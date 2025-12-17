import { useAppTheme } from "@/hooks/useAppTheme";
import { useDisclosure } from "@/hooks/useDisclosure";
import { ActiveProfile, Appointment } from "@/utils/query";
import { useState } from "react";
import { View } from "react-native";
import { Surface, Text } from "react-native-paper";
import AppointmentCard, { handleCancelAppointment } from "../cards/AppointmentCard";
import { DateRangePickerInput, getValidRange } from "../inputs/DatePickerInput";
import { DropdownIndex } from "../inputs/DropdownInput";
import WarningDialog from "../modals/WarningDialog";
import { handleJoinAppointment } from "../cards/AppointmentCard";

function NameDropdown({
  nameOptions,
  option,
  setOption,
}: {
  nameOptions: { id: string; label: string }[];
  option: number;
  setOption: (index: number) => void;
}) {
  return <DropdownIndex container={nameOptions.map((opt) => opt.label)} option={option} setOption={setOption} />;
}

export default function UpcomingSection({
  profile,
  upcomingAppointments,
  setUpcomingAppointments,
  nameOptions,
  isInterpreter,
  getProviderToken,
}: {
  profile: ActiveProfile | null;
  upcomingAppointments: Appointment[];
    setUpcomingAppointments: (appointments: Appointment[]) => void;
  nameOptions: { id: string; label: string }[];
  isInterpreter: boolean;
  getProviderToken: () => Promise<string | null>;
}) {
  const theme = useAppTheme();
  const [option, setOption] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const { isOpen, open, close } = useDisclosure();

  return (
    <View>
      <Text variant="titleLarge">Upcoming Appointments</Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <NameDropdown nameOptions={nameOptions} option={option} setOption={setOption} />
        </View>
        <DateRangePickerInput dateRange={dateRange} setDateRange={setDateRange} validRange={getValidRange()} />
      </View>
      {upcomingAppointments.length > 0 ? (
        <Surface
          mode="flat"
          style={{
            paddingTop: theme.spacing.sm,
            paddingHorizontal: theme.spacing.sm,
            borderRadius: theme.roundness,
          }}
        >
          {upcomingAppointments
            .filter((appointment) => {
              const matchesName = option === 0 || appointment.profile?.id === nameOptions[option].id;
              const { startTime } = appointment;
              const matchesDateRange =
                dateRange.startDate && dateRange.endDate
                  ? new Date(startTime) >= dateRange.startDate && new Date(startTime) <= dateRange.endDate
                  : true;
              return matchesName && matchesDateRange;
            })
            .map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isInterpreter={isInterpreter}
                onCardPress={
                  isInterpreter && appointment.status !== "Cancelled"
                    ? () => {
                          setAppointment(appointment);
                          open();
                        }
                    : undefined
                }
                onJoinPress={() => handleJoinAppointment(profile!, appointment)}
              />
            ))}
          {isInterpreter ? (
            <WarningDialog
              visible={isOpen}
              title="Cancel Appointment"
              message="Are you sure you want to cancel this appointment? This action cannot be undone."
              cancelText="Close"
              confirmText="Cancel"
              onConfirm={async () => {
                if (appointment) {
                  setUpcomingAppointments(
                    upcomingAppointments.map((appt) =>
                      appt.id === appointment.id ? { ...appt, status: "Cancelled" } : appt
                    )
                  );
                  const providerToken = await getProviderToken();
                  await handleCancelAppointment(profile!, appointment, providerToken!);
                }
                close();
              }}
              onDismiss={close}
              isDanger={true}
            />
          ) : null}
        </Surface>
      ) : (
        <Surface
          mode="flat"
          style={{
            height: 160,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: theme.spacing.xs,
            borderRadius: theme.roundness,
          }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant }}>No upcoming appointments found</Text>
        </Surface>
      )}
    </View>
  );
}
