import { Text } from "react-native-paper";
import { View } from "react-native";

export default function LabelledInput({
  label,
  children,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <View {...props}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>{label}</Text>
      {children}
    </View>
  );
}
