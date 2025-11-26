import { useDisclosure } from "@/hooks/useDisclosure";
import { useCallback } from "react";
import { TouchableHighlight } from "react-native";
import { TextInput } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";

export default function TimePickerInput({
  time,
  setTime,
  validRange,
  placeholder,
  ...props
}: {
  time: { hours: number | undefined; minutes: number | undefined };
  setTime: (time: { hours: number; minutes: number }) => void;
  validRange?: { startDate: Date | undefined; endDate: Date | undefined };
  placeholder?: string;
  [key: string]: any;
}) {
  const { isOpen, open, close } = useDisclosure();

  const onConfirm = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setTime({ hours, minutes });
      close();
    },
    [close, setTime]
  );

  return (
    <>
      <TouchableHighlight onPress={open} activeOpacity={0.6} underlayColor="#DDDDDD" {...props}>
        <TextInput
          mode="outlined"
          value={
            time.hours === undefined || time.minutes === undefined
              ? ""
              : new Date(0, 0, 0, time.hours, time.minutes).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
          }
          right={<TextInput.Icon icon="clock" onPress={open} />}
          placeholder={placeholder ?? "Select time"}
          style={{ pointerEvents: "none" }}
        ></TextInput>
      </TouchableHighlight>
      <TimePickerModal
        locale="en"
        label={placeholder ? `Select ${placeholder.toLowerCase()}` : "Select time"}
        visible={isOpen}
        onDismiss={close}
        hours={time.hours}
        minutes={time.minutes ?? 0}
        onConfirm={onConfirm}
      />
    </>
  );
}
