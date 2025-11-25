import { useDisclosure } from "@/hooks/useDisclosure";
import { useCallback } from "react";
import { TouchableHighlight } from "react-native";
import { TextInput } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";

export default function TimePickerInput({
  hours,
  setHours,
  minutes,
  setMinutes,
  validRange,
  placeholder,
  ...props
}: {
  hours: number | undefined;
  setHours: (hours: number | undefined) => void;
  minutes: number | undefined;
  setMinutes: (minutes: number | undefined) => void;
  validRange?: { startDate: Date | undefined; endDate: Date | undefined };
  placeholder?: string;
  [key: string]: any;
}) {
  const { isOpen, open, close } = useDisclosure();

  const onConfirm = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setHours(hours);
      setMinutes(minutes);
      close();
    },
    [close, setHours, setMinutes]
  );

  return (
    <>
      <TouchableHighlight onPress={open} activeOpacity={0.6} underlayColor="#DDDDDD" {...props}>
        <TextInput
          mode="outlined"
          value={
            hours === undefined || minutes === undefined
              ? ""
              : new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
          right={<TextInput.Icon icon="clock" onPress={open} />}
          placeholder={placeholder ?? "Select a time"}
          style={{ pointerEvents: "none" }}
        ></TextInput>
      </TouchableHighlight>
      <TimePickerModal
        locale="en"
        label={placeholder ? `Select ${placeholder.toLowerCase()}` : "Select time"}
        visible={isOpen}
        onDismiss={close}
        hours={hours}
        minutes={minutes}
        onConfirm={onConfirm}
      />
    </>
  );
}
