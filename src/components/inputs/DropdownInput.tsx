import { useDisclosure } from "@/hooks/useDisclosure";
import { TouchableHighlight, View } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import LabelledInput from "./LabelledInput";

export function DropdownIndex({
  container,
  option,
  setOption,
  ...props
}: {
  container: readonly string[];
  option: number;
  setOption: (index: number) => void;
  label?: string;
  [key: string]: any;
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
            style={{ pointerEvents: "none"}}
            right={<TextInput.Icon icon="chevron-down" onPress={open} />}
            showSoftInputOnFocus={false}
            editable={false}
            {...props}
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

export function DropdownInput({
  container,
  option,
  setOption,
  label,
  ...props
}: {
  container: readonly string[];
  option: string;
  setOption: (index: string) => void;
  label?: string;
  [key: string]: any;
}) {
  const { isOpen, open, close } = useDisclosure();

  return (
    <Menu
      visible={isOpen}
      onDismiss={close}
      anchor={
        <TouchableHighlight onPress={open} activeOpacity={0.6} underlayColor="#DDDDDD">
          <TextInput
            value={option}
            mode="outlined"
            style={{ pointerEvents: "none"}}
            right={<TextInput.Icon icon="chevron-down" onPress={open} />}
            showSoftInputOnFocus={false}
            editable={false}
            label={label}
            {...props}
          />
        </TouchableHighlight>
      }
    >
      {container.map((option) => (
        <Menu.Item
          key={option}
          onPress={() => {
            setOption(option);
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
        <DropdownIndex container={container} option={option} setOption={setOption} />
      </LabelledInput>
    </View>
  );
}
