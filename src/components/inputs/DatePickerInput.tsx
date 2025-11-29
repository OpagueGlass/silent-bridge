import { useDisclosure } from "@/hooks/useDisclosure";
import { useCallback } from "react";
import { TouchableHighlight } from "react-native";
import { IconButton, TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getToday: () => Date = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getValidRange: () => { startDate: Date; endDate: Date } = () => {
  const startDate = getToday();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 90);
  endDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
};

export function DateRangePickerInput({
  dateRange,
  setDateRange,
  validRange,
  placeholder,
  ...props
}: {
  dateRange: { startDate: Date | undefined; endDate: Date | undefined };
  setDateRange: React.Dispatch<React.SetStateAction<{ startDate: Date | undefined; endDate: Date | undefined }>>;
  validRange?: { startDate: Date | undefined; endDate: Date | undefined };
  [key: string]: any;
}) {
  const { isOpen, open, close } = useDisclosure();
  const onConfirm = useCallback(
    ({ startDate, endDate }: { startDate: CalendarDate; endDate?: CalendarDate }) => {
      endDate?.setHours(23, 59, 59, 999);
      setDateRange({ startDate, endDate });
      close();
    },
    [close, setDateRange]
  );
  return (
    <>
      <IconButton
        mode="outlined"
        onPress={open}
        icon="calendar-range"
        style={{ backgroundColor: "white" }}
        {...props}
      />
      <DatePickerModal
        mode="range"
        locale="en-GB"
        label={placeholder ? `Select ${placeholder.toLowerCase()}` : "Select date range"}
        visible={isOpen}
        validRange={validRange}
        onDismiss={close}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onConfirm={onConfirm}
        saveLabel="Save"
      />
    </>
  );
}

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
          placeholder={placeholder ?? "Select date"}
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
