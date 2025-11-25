import { useDisclosure } from "@/hooks/useDisclosure";
import { useCallback } from "react";
import { TouchableHighlight } from "react-native";
import { TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function DatePickerInput({
  date,
  setDate,
  validRange,
  placeholder,
  ...props
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  validRange?: { startDate: Date | undefined; endDate: Date | undefined };
  placeholder?: string;
  [key: string]: any;
}) {
  const { isOpen, open, close } = useDisclosure();

  const onConfirm = useCallback(
    ({ date }: { date: CalendarDate }) => {
      setDate(date);
      close();
    },
    [close, setDate]
  );

  return (
    <>
      <TouchableHighlight onPress={open} activeOpacity={0.6} underlayColor="#DDDDDD" {...props}>
        <TextInput
          mode="outlined"
          value={date ? formatDate(date) : ""}
          right={<TextInput.Icon icon="calendar" onPress={open} />}
          placeholder={placeholder ?? "Select a date"}
          style={{ pointerEvents: "none" }}
        ></TextInput>
      </TouchableHighlight>
      <DatePickerModal
        mode="single"
        locale="en-GB"
        label={placeholder ? `Select ${placeholder.toLowerCase()}` : "Select date"}
        saveLabel="Save"
        visible={isOpen}
        validRange={validRange}
        onDismiss={close}
        date={date}
        onConfirm={onConfirm}
      />
    </>
  );
}
