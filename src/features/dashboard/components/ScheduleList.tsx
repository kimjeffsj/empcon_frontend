import { Schedule } from "@/api/schedule/scheduleApi.types";
import { format } from "date-fns";

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  emptyMessage: string;
}

export const ScheduleList = ({
  schedules,
  isLoading,
  emptyMessage,
}: ScheduleListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {format(new Date(schedule.startTime), "HH:mm")} -{" "}
                {format(new Date(schedule.endTime), "HH:mm")}
              </div>
              <div className="text-sm text-muted-foreground">
                {schedule.scheduleType === "REGULAR"
                  ? "Regular"
                  : schedule.scheduleType === "OVERTIME"
                  ? "Overtime"
                  : "Stat"}
                {schedule.isStatutoryHoliday && " (Stat Holiday)"}
              </div>
              {schedule.notes && (
                <div className="text-sm mt-2">{schedule.notes}</div>
              )}
            </div>
            <div className="text-sm">
              {schedule.breakTime > 0 && (
                <span className="text-muted-foreground">
                  휴식: {Math.floor(schedule.breakTime / 60)}시간{" "}
                  {schedule.breakTime % 60}분
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
