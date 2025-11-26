import { Image, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

export default function ProfileImage({
  profile,
  size = 72,
  borderRadius = 16,
}: {
  profile: { photo: string } | null;
  size?: number;
  borderRadius?: number;
}) {
  if (!profile) {
    return null;
  }

  return (
    <Image
      source={{ uri: profile.photo }}
      style={{ width: size, height: size, borderRadius, backgroundColor: "#ddd" }}
    />
  );
}

export function ClickableProfileImage({
  profile,
  size = 72,
  borderRadius = 16,
  isClickable = true,
  ...props
}: {
  profile: { id: string, photo: string } | null;
  size?: number;
  borderRadius?: number;
  isClickable?: boolean;
  [key: string]: any;
}) {
  if (!profile) return null;

  const image = <ProfileImage profile={profile} size={size} borderRadius={borderRadius} />;

  if (isClickable) {
    return (
      <TouchableOpacity {...props} onPress={() => router.push(`/interpreter/${profile.id}`)}>
        {image}
      </TouchableOpacity>
    );
  }
  return <View {...props}>{image}</View>;
}
