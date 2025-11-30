import { View } from "react-native";
import { Chip } from "react-native-paper";

export function InfoChip({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return (
    <Chip
      style={{
        marginRight: 8,
        backgroundColor: "#3498db14",
        borderColor: "#246a9933",
        borderWidth: 1,
      }}
      textStyle={{ color: "#024675" }}
      {...props}
    >
      {children}
    </Chip>
  );
}

export default function InfoChips({ items }: { items: string[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {items.map((item, index) => (
        <InfoChip
          key={index}
          style={{
            marginRight: 8,
            marginBottom: 8,
            backgroundColor: "#3498db14",
            borderColor: "#246a9933",
            borderWidth: 1,
          }}
        >
          {item}
        </InfoChip>
      ))}
    </View>
  );
}
