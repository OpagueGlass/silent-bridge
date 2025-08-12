import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { loadProfile } = useAuth();
  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically exchanges the code for a session
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();
      // if (user) {
      //   const { data: profile } = await supabase.from('profile').select('*').eq('id', user.id).maybeSingle();
      const profile = await loadProfile();
      if (profile) {
        router.push('/');
      } else {
        router.push('/auth/account-type');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
