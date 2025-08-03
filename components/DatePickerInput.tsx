import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from "react";
import { Platform, View, Pressable } from "react-native";
import { TextInput } from "react-native-paper";
import { useAppTheme } from "../hooks/useAppTheme";

// Conditional import for web
let DatePicker: any = null;
if (Platform.OS === 'web') {
  DatePicker = require('react-datepicker').default;
  // Import CSS
  if (typeof document !== 'undefined') {
    require('react-datepicker/dist/react-datepicker.css');
  }
}

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  style?: any;
  maxDate?: Date;
  minDate?: Date;
}

export default function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "Select a date",
  style,
  maxDate = new Date(),
  minDate = new Date(1920, 0, 1)
}: DatePickerInputProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const theme = useAppTheme();

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (Platform.OS === 'web') {
        const target = event.target as Node;
        const isOutsideDatePicker = datePickerRef.current && !datePickerRef.current.contains(target);
        const isOutsideInput = inputRef.current && !inputRef.current.contains(target);
        
        if (isOutsideDatePicker && isOutsideInput) {
          setShowDatePicker(false);
        }
      }
    };

    if (showDatePicker && Platform.OS === 'web') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDatePicker]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      onChange(formatDate(date));
    }
  };

  const handleDateSelection = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onChange(formatDate(date));
    }
    setShowDatePicker(false);
  };

  return (
    <>
      {Platform.OS === 'web' ? (
        <div ref={inputRef} style={{ position: 'relative', zIndex: 1001 }}>
          <TextInput
            label={label}
            value={value}
            mode="outlined"
            style={style}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            placeholder={placeholder}
            showSoftInputOnFocus={false}
            editable={false}
            onPointerDown={() => setShowDatePicker(true)}
          />
          {showDatePicker && DatePicker && (
        <>
          <style>{`
            .custom-datepicker .react-datepicker__day:hover {
              background-color: ${theme.colors.onSurfaceDisabled} !important;
              color: white !important;
            }
            .custom-datepicker .react-datepicker__day--selected {
              background-color: ${theme.colors.primary} !important;
              color: white !important;
            }
            .custom-datepicker .react-datepicker__day--keyboard-selected {
              background-color: ${theme.colors.primaryContainer} !important;
              color: ${theme.colors.onPrimaryContainer} !important;
            }
            .custom-datepicker .react-datepicker__header {
              background-color: ${theme.colors.outline} !important;
              border-bottom: 1px solid ${theme.colors.outline} !important;
            }
            .custom-datepicker .react-datepicker__current-month {
            //   color: ${theme.colors.primary} !important;
              font-weight: 600 !important;
              font-size: 16px !important;
              margin-bottom: 8px !important;
            }
            .custom-datepicker .react-datepicker__day-name {
              color: ${theme.colors.onSurfaceVariant} !important;
              font-weight: 500 !important;
              font-size: 12px !important;
            }
            .custom-datepicker .react-datepicker__month-dropdown,
            .custom-datepicker .react-datepicker__year-dropdown {
              background-color: ${theme.colors.surface} !important;
              border: 2px solid ${theme.colors.primary} !important;
              border-radius: 16px !important;
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
              padding: 12px 0 !important;
              max-height: 280px !important;
              overflow-y: auto !important;
              min-width: 140px !important;
              z-index: 1001 !important;
            }
            .custom-datepicker .react-datepicker__month-dropdown-container,
            .custom-datepicker .react-datepicker__year-dropdown-container {
              position: relative !important;
            }
            .custom-datepicker .react-datepicker__month-option,
            .custom-datepicker .react-datepicker__year-option {
              padding: 14px 24px !important;
              color: ${theme.colors.onSurface} !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
              font-size: 15px !important;
              font-weight: 500 !important;
              border-bottom: 1px solid ${theme.colors.outline}33 !important;
              position: relative !important;
            }
            .custom-datepicker .react-datepicker__month-option:hover,
            .custom-datepicker .react-datepicker__year-option:hover {
              background-color: ${theme.colors.primaryContainer} !important;
              color: ${theme.colors.onPrimaryContainer} !important;
              transform: translateX(4px) !important;
            }
            .custom-datepicker .react-datepicker__month-option:last-child,
            .custom-datepicker .react-datepicker__year-option:last-child {
              border-bottom: none !important;
            }
            .custom-datepicker .react-datepicker__month-option--selected,
            .custom-datepicker .react-datepicker__year-option--selected {
              background-color: ${theme.colors.primary} !important;
              color: ${theme.colors.onPrimary} !important;
              font-weight: 700 !important;
              position: relative !important;
            }
            .custom-datepicker .react-datepicker__month-option--selected::before,
            .custom-datepicker .react-datepicker__year-option--selected::before {
              content: '✓' !important;
              position: absolute !important;
              right: 16px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              font-weight: bold !important;
            }
            .custom-datepicker .react-datepicker__navigation {
              width: 28px !important;
              height: 28px !important;
              border-radius: 6px !important;
              background-color: transparent !important;
              border: 1px solid ${theme.colors.outline} !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              transition: all 0.2s ease !important;
            }
            .custom-datepicker .react-datepicker__triangle {
              display: none !important;
            }
            .custom-datepicker .react-datepicker__day {
              border-radius: 6px !important;
              transition: all 0.2s ease !important;
              width: 32px !important;
              height: 32px !important;
              line-height: 32px !important;
              margin: 2px !important;
            }
            .custom-datepicker .react-datepicker__day--outside-month {
              color: ${theme.colors.outline} !important;
            }
          `}</style>
          <div ref={datePickerRef} style={{ 
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 1000,
            // backgroundColor: 'white',
            // border: '1px solid #ccc',
            // borderRadius: '8px',
            // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            // padding: '8px',
            // width: 'fit-content'
          }}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelection}
              maxDate={maxDate}
              minDate={minDate}
              dateFormat="dd/MM/yyyy"
              inline
              calendarClassName="custom-datepicker"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
            />
          </div>
        </>
      )}
        </div>
      ) : (
        <Pressable onPress={() => setShowDatePicker(true)}>
            <View ref={inputRef} style={{ position: 'relative' }} pointerEvents="none">
            <TextInput
                label={label}
                value={value}
                mode="outlined"
                style={style}
                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                placeholder={placeholder}
                showSoftInputOnFocus={false}
                editable={false}
            />
            {showDatePicker && (
                <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={maxDate}
                minimumDate={minDate}
                />
            )}
            </View>
        </Pressable>
      )}
    </>
  );
}
