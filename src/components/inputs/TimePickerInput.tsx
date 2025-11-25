import { useDisclosure } from "@/hooks/useDisclosure";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function TimePickerInput({
  hours,
  setHours,
  minutes,
  setMinutes,
  validRange,
  ...props
}: {
  hours: number | undefined;
  setHours: (hours: number | undefined) => void;
  minutes: number | undefined;
  setMinutes: (minutes: number | undefined) => void;
  validRange?: { startDate: Date | undefined; endDate: Date | undefined };
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
    <TouchableOpacity onPress={open} {...props}>
      <TextInput
        mode="outlined"
        value={
          hours === undefined || minutes === undefined
            ? ""
            : new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
        right={<TextInput.Icon icon="clock" onPress={open} />}
        placeholder="Select a time"
        style={{ pointerEvents: "none" }}
      ></TextInput>
      <TimePickerModal
        locale="en"
        label="Select time"
        visible={isOpen}
        onDismiss={close}
        hours={hours}
        minutes={minutes}
        onConfirm={onConfirm}
      />
    </TouchableOpacity>
  );
}
