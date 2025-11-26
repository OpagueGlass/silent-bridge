import { useDisclosure } from "@/hooks/useDisclosure";
import { View, Text, TouchableOpacity, TouchableHighlight } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LabelledInput from "./LabelledInput";

export function DropdownInput({
  container,
  option,
  setOption,
}: {
  container: readonly string[];
  option: number;
  setOption: (index: number) => void;
}) {
  const { isOpen, open, close } = useDisclosure();

  return (
    <Menu
      visible={isOpen}
      onDismiss={close}
      anchor={
        <TouchableHighlight onPress={open} activeOpacity={0.6} underlayColor="#DDDDDD">
          <TextInput
            value={container[option]}
            mode="outlined"
            style={{ pointerEvents: "none" }}
            right={<TextInput.Icon icon="chevron-down" onPress={open} />}
            showSoftInputOnFocus={false}
            editable={false}
          />
        </TouchableHighlight>
      }
    >
      {container.map((option, index) => (
        <Menu.Item
          key={option}
          onPress={() => {
            setOption(index);
            close();
          }}
          title={option}
        />
      ))}
    </Menu>
  );
}

export default function LabelledDropdownInput({
  label,
  container,
  option,
  setOption,
  ...props
}: {
  label: string;
  container: readonly string[];
  option: number;
  setOption: (index: number) => void;
  [key: string]: any;
}) {

  return (
    <View style={{ flex: 1 }} {...props}>
      <LabelledInput label={label}>
        <DropdownInput container={container} option={option} setOption={setOption} />
      </LabelledInput>
    </View>
  );
}
