// app/video-call.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import {
  Text,
  IconButton,
  Surface,
  Portal,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  VideoSourceType,
  RenderModeType,
  ChannelProfileType,
  ClientRoleType,
  ConnectionStateType,
  ConnectionChangedReasonType,
  RtcConnection,
  UserOfflineReasonType,
} from 'react-native-agora';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { AGORA_CONFIG, generateChannelName } from '../constants/agora';

const { width, height } = Dimensions.get('window');

interface CallState {
  joined: boolean;
  remoteUid: number[];
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  callDuration: number;
  connectionState: string;
  isInitializing: boolean;
}

export default function VideoCallScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { 
    appointmentId, 
    interpreterName, 
    userType, 
    appointmentTime 
  } = useLocalSearchParams<{
    appointmentId: string;
    interpreterName: string;
    userType: string;
    appointmentTime: string;
  }>();

  // 状态管理
  const [callState, setCallState] = useState<CallState>({
    joined: false,
    remoteUid: [],
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerEnabled: true,
    callDuration: 0,
    connectionState: 'Initializing...',
    isInitializing: true,
  });

  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);

  const rtcEngineRef = useRef<IRtcEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    initializeAgora();
    setupBackHandler();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  // 初始化 Agora
  const initializeAgora = async () => {
    try {
      updateCallState({ connectionState: 'Initializing...' });

      // 创建 RTC 引擎（新版本 API）
      rtcEngineRef.current = createAgoraRtcEngine();

      if (!mountedRef.current || !rtcEngineRef.current) return;

      const engine = rtcEngineRef.current;

      // 初始化引擎
      engine.initialize({
        appId: AGORA_CONFIG.appId,
        logConfig: { filePath: '' },
      });

      // 添加事件监听器
      addEventListeners();

      // 启用音视频
      engine.enableVideo();
      engine.enableAudio();

      // 设置频道配置
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // 设置音频配置
      engine.setEnableSpeakerphone(true);

      // 加入频道
      const channelName = generateChannelName(parseInt(appointmentId || '0'));
      updateCallState({ connectionState: 'Joining channel...' });

      const result = engine.joinChannel(
        AGORA_CONFIG.token,
        channelName,
        0,
        {}
      );

      if (result < 0) {
        throw new Error(`Failed to join channel: ${result}`);
      }

    } catch (error) {
      console.error('Failed to initialize Agora:', error);
      if (mountedRef.current) {
        updateCallState({ 
          connectionState: 'Failed to initialize',
          isInitializing: false 
        });
        showErrorAlert('Initialization Error', 'Failed to start video call. Please try again.');
      }
    }
  };

  // 添加事件监听器
  const addEventListeners = () => {
    if (!rtcEngineRef.current) return;

    const engine = rtcEngineRef.current;

    // 加入频道成功
    engine.addListener('onJoinChannelSuccess', (connection: RtcConnection, elapsed: number) => {
      console.log('onJoinChannelSuccess', connection, elapsed);
      if (mountedRef.current) {
        updateCallState({ 
          joined: true, 
          connectionState: 'Connected',
          isInitializing: false 
        });
        startTimer();
      }
    });

    // 用户加入
    engine.addListener('onUserJoined', (connection: RtcConnection, remoteUid: number, elapsed: number) => {
      console.log('onUserJoined', connection, remoteUid, elapsed);
      if (mountedRef.current) {
        setCallState(prev => ({
          ...prev,
          remoteUid: [...prev.remoteUid.filter(id => id !== remoteUid), remoteUid]
        }));
      }
    });

    // 用户离线
    engine.addListener('onUserOffline', (connection: RtcConnection, remoteUid: number, reason: UserOfflineReasonType) => {
      console.log('onUserOffline', connection, remoteUid, reason);
      if (mountedRef.current) {
        setCallState(prev => ({
          ...prev,
          remoteUid: prev.remoteUid.filter(id => id !== remoteUid)
        }));
      }
    });

    // 错误处理
    engine.addListener('onError', (err: number, msg: string) => {
      console.error('Agora Error:', err, msg);
      if (mountedRef.current) {
        updateCallState({ connectionState: 'Connection Error' });
        setShowConnectionError(true);
      }
    });

    // 连接状态变化
    engine.addListener('onConnectionStateChanged', (
      connection: RtcConnection, 
      state: ConnectionStateType, 
      reason: ConnectionChangedReasonType
    ) => {
      console.log('onConnectionStateChanged', connection, state, reason);
      if (mountedRef.current) {
        const stateText = getConnectionStateText(state);
        updateCallState({ connectionState: stateText });

        if (state === ConnectionStateType.ConnectionStateFailed) {
          setShowConnectionError(true);
        }
      }
    });

    // 音频路由变化
    engine.addListener('onAudioRoutingChanged', (routing: number) => {
      console.log('onAudioRoutingChanged', routing);
    });

    // 远程视频状态变化
    engine.addListener('onRemoteVideoStateChanged', (
      connection: RtcConnection,
      remoteUid: number, 
      state: number, 
      reason: number, 
      elapsed: number
    ) => {
      console.log('onRemoteVideoStateChanged', connection, remoteUid, state, reason, elapsed);
    });
  };

  // 更新状态的辅助函数
  const updateCallState = (updates: Partial<CallState>) => {
    if (mountedRef.current) {
      setCallState(prev => ({ ...prev, ...updates }));
    }
  };

  // 获取连接状态文本
  const getConnectionStateText = (state: ConnectionStateType): string => {
    switch (state) {
      case ConnectionStateType.ConnectionStateDisconnected: return 'Disconnected';
      case ConnectionStateType.ConnectionStateConnecting: return 'Connecting...';
      case ConnectionStateType.ConnectionStateConnected: return 'Connected';
      case ConnectionStateType.ConnectionStateReconnecting: return 'Reconnecting...';
      case ConnectionStateType.ConnectionStateFailed: return 'Connection Failed';
      default: return 'Unknown';
    }
  };

  // 设置返回按键处理
  const setupBackHandler = () => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowEndCallModal(true);
      return true;
    });

    return () => backHandler.remove();
  };

  // 开始计时器
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      if (mountedRef.current) {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }
    }, 1000);
  };

  // 格式化通话时长
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 切换静音
  const toggleMute = () => {
    if (rtcEngineRef.current) {
      try {
        const result = rtcEngineRef.current.muteLocalAudioStream(!callState.isMuted);
        if (result === 0) {
          updateCallState({ isMuted: !callState.isMuted });
        }
      } catch (error) {
        console.error('Toggle mute error:', error);
      }
    }
  };

  // 切换视频
  const toggleVideo = () => {
    if (rtcEngineRef.current) {
      try {
        const result = rtcEngineRef.current.muteLocalVideoStream(!callState.isVideoEnabled);
        if (result === 0) {
          updateCallState({ isVideoEnabled: !callState.isVideoEnabled });
        }
      } catch (error) {
        console.error('Toggle video error:', error);
      }
    }
  };

  // 切换扬声器
  const toggleSpeaker = () => {
    if (rtcEngineRef.current) {
      try {
        const result = rtcEngineRef.current.setEnableSpeakerphone(!callState.isSpeakerEnabled);
        if (result === 0) {
          updateCallState({ isSpeakerEnabled: !callState.isSpeakerEnabled });
        }
      } catch (error) {
        console.error('Toggle speaker error:', error);
      }
    }
  };

  // 切换摄像头
  const switchCamera = () => {
    if (rtcEngineRef.current && callState.isVideoEnabled) {
      try {
        rtcEngineRef.current.switchCamera();
      } catch (error) {
        console.error('Switch camera error:', error);
      }
    }
  };

  // 显示错误提示
  const showErrorAlert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Retry',
          onPress: () => {
            cleanup();
            setTimeout(() => initializeAgora(), 1000);
          }
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  // 结束通话
  const endCall = () => {
    try {
      setShowEndCallModal(false);
      
      if (rtcEngineRef.current) {
        const engine = rtcEngineRef.current;
        
        // 离开频道
        const leaveResult = engine.leaveChannel();
        console.log('Leave channel result:', leaveResult);
        
        // 释放引擎
        engine.release();
        rtcEngineRef.current = null;
      }
      
      cleanup();
      router.back();
    } catch (error) {
      console.error('Error ending call:', error);
      router.back();
    }
  };

  // 清理资源
  const cleanup = () => {
    mountedRef.current = false;
    
    // 清理计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 清理 RTC 引擎
    if (rtcEngineRef.current) {
      try {
        const engine = rtcEngineRef.current;
        
        // 移除所有监听器
        engine.removeAllListeners();
        
        // 离开频道 (同步方法，返回数字)
        const leaveResult = engine.leaveChannel();
        console.log('Cleanup - Leave channel result:', leaveResult);
        
        // 释放引擎
        engine.release();
        rtcEngineRef.current = null;
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  };

  // 渲染本地视频
  const renderLocalVideo = () => {
    if (!callState.joined || !callState.isVideoEnabled) {
      return (
        <View style={[styles.videoPlaceholder, styles.localVideoContainer]}>
          <IconButton
            icon="video-off"
            iconColor={theme.colors.onSurface}
            size={20}
          />
          <Text style={[styles.placeholderText, { color: theme.colors.onSurface, fontSize: 10 }]}>
            Camera Off
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.localVideoContainer}>
        {/* 本地视频使用新版本的 RtcSurfaceView */}
        <RtcSurfaceView
          canvas={{
            uid: 0,
            sourceType: VideoSourceType.VideoSourceCamera,
            renderMode: RenderModeType.RenderModeHidden,
          }}
          style={styles.videoView}
        />
      </View>
    );
  };

  // 渲染远程视频
  const renderRemoteVideo = () => {
    if (callState.remoteUid.length === 0) {
      return (
        <View style={[styles.videoPlaceholder, styles.remoteVideoContainer]}>
          {callState.isInitializing ? (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.placeholderText, { color: theme.colors.onSurface, marginTop: 16 }]}>
                {callState.connectionState}
              </Text>
            </>
          ) : (
            <>
              <IconButton
                icon="account"
                iconColor={theme.colors.onSurface}
                size={48}
              />
              <Text style={[styles.placeholderText, { color: theme.colors.onSurface }]}>
                {callState.joined ? 'Waiting for participant...' : callState.connectionState}
              </Text>
            </>
          )}
        </View>
      );
    }

    return (
      <View style={styles.remoteVideoContainer}>
        {/* 远程视频使用新版本的 RtcSurfaceView */}
        <RtcSurfaceView
          canvas={{
            uid: callState.remoteUid[0],
            sourceType: VideoSourceType.VideoSourceRemote,
            renderMode: RenderModeType.RenderModeHidden,
          }}
          style={styles.videoView}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000" 
        translucent={false}
      />
      
      {/* 头部信息 */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {interpreterName || `Appointment #${appointmentId}`}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {appointmentTime && `📅 ${appointmentTime}`}
            </Text>
          </View>
          <View style={styles.callInfo}>
            <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
              {formatDuration(callState.callDuration)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {callState.connectionState}
            </Text>
          </View>
        </View>
      </Surface>

      {/* 视频区域 */}
      <View style={styles.videoContainer}>
        {/* 远程视频（主视频） */}
        {renderRemoteVideo()}
        
        {/* 本地视频（小窗） */}
        <View style={styles.localVideoWrapper}>
          {renderLocalVideo()}
        </View>
      </View>

      {/* 控制按钮 */}
      <Surface style={[styles.controls, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <View style={styles.controlsRow}>
          <IconButton
            icon={callState.isMuted ? "microphone-off" : "microphone"}
            mode="contained"
            iconColor={callState.isMuted ? theme.colors.onError : theme.colors.onPrimary}
            containerColor={callState.isMuted ? theme.colors.error : theme.colors.primary}
            onPress={toggleMute}
            disabled={!callState.joined}
          />
          
          <IconButton
            icon={callState.isVideoEnabled ? "video" : "video-off"}
            mode="contained"
            iconColor={!callState.isVideoEnabled ? theme.colors.onError : theme.colors.onPrimary}
            containerColor={!callState.isVideoEnabled ? theme.colors.error : theme.colors.primary}
            onPress={toggleVideo}
            disabled={!callState.joined}
          />
          
          <IconButton
            icon={callState.isSpeakerEnabled ? "volume-high" : "volume-off"}
            mode="contained"
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
            onPress={toggleSpeaker}
            disabled={!callState.joined}
          />
          
          <IconButton
            icon="camera-switch"
            mode="contained"
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
            onPress={switchCamera}
            disabled={!callState.joined || !callState.isVideoEnabled}
          />
          
          <IconButton
            icon="phone-hangup"
            mode="contained"
            iconColor={theme.colors.onError}
            containerColor={theme.colors.error}
            onPress={() => setShowEndCallModal(true)}
            size={28}
          />
        </View>
      </Surface>

      {/* 结束通话确认对话框 */}
      <Portal>
        <Modal
          visible={showEndCallModal}
          onDismiss={() => setShowEndCallModal(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text variant="titleMedium" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
            End Call?
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
            Are you sure you want to end this appointment call?
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowEndCallModal(false)}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={endCall}
              style={{ flex: 1, marginLeft: 8 }}
              buttonColor={theme.colors.error}
            >
              End Call
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* 连接错误对话框 */}
      <Portal>
        <Modal
          visible={showConnectionError}
          dismissable={false}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text variant="titleMedium" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
            Connection Error
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
            There was a problem with the connection. Would you like to try again?
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowConnectionError(false);
                router.back();
              }}
              style={{ flex: 1, marginRight: 8 }}
            >
              Exit
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowConnectionError(false);
                cleanup();
                setTimeout(() => initializeAgora(), 1000);
              }}
              style={{ flex: 1, marginLeft: 8 }}
            >
              Retry
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  callInfo: {
    alignItems: 'flex-end',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoWrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  videoView: {
    flex: 1,
  },
  controls: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
    elevation: 8,
  },
  modalActions: {
    flexDirection: 'row',
  },
});
