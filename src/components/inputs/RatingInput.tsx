import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RatingInput({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: "row" }}>
      {stars.map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <MaterialCommunityIcons
            name={star <= rating ? "star" : "star-outline"}
            size={32}
            color={star <= rating ? "#FFC107" : "#BDBDBD"}
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
