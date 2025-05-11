import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { TimeClock } from "@/api/timeclock/timeClockApi.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { clockIn, clockOut } from "@/features/timeclocks/store/timeclocksSlice";
import { Schedule } from "@/api/schedule/scheduleApi.types";
import { isAfter, isBefore, addMinutes } from "date-fns";

interface ClockInOutCardProps {
  activeTimeClock: TimeClock | null;
  isLoading: boolean;
  todaySchedules: Schedule[];
}

export const ClockInOutCard = ({
  activeTimeClock,
  isLoading,
  todaySchedules,
}: ClockInOutCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);

  const now = new Date();
  // 오늘 스케줄이 여러 개일 경우, 가장 이른 시작/가장 늦은 종료 기준
  const earliestStart =
    todaySchedules.length > 0
      ? new Date(
          Math.min(
            ...todaySchedules.map((s) => new Date(s.startTime).getTime())
          )
        )
      : null;
  const latestEnd =
    todaySchedules.length > 0
      ? new Date(
          Math.max(...todaySchedules.map((s) => new Date(s.endTime).getTime()))
        )
      : null;

  // clock-in: 시작 5분 전부터 가능
  const canClockIn =
    !!earliestStart &&
    isAfter(now, addMinutes(earliestStart, -5)) &&
    !!latestEnd &&
    isBefore(now, latestEnd);
  // clock-out: 종료 5분 전부터 가능
  const canClockOut = !!latestEnd && isAfter(now, addMinutes(latestEnd, -5));

  const handleClockIn = async () => {
    if (!user) return;
    setClockInLoading(true);
    try {
      await dispatch(clockIn({ userId: user.id })).unwrap();
    } catch (error) {
      console.error("Clock in failed:", error);
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeTimeClock) return;
    setClockOutLoading(true);
    try {
      await dispatch(clockOut({ id: activeTimeClock.id, data: {} })).unwrap();
    } catch (error) {
      console.error("Clock out failed:", error);
    } finally {
      setClockOutLoading(false);
    }
  };

  let buttonMessage = "";
  let showButton = true;
  let buttonDisabled = false;

  if (todaySchedules.length === 0) {
    showButton = false;
    buttonMessage = "오늘은 스케줄이 없습니다.";
  } else if (!activeTimeClock) {
    // 출근 전
    if (!canClockIn) {
      showButton = true;
      buttonDisabled = true;
      buttonMessage = `출근은 ${
        earliestStart
          ? `${format(addMinutes(earliestStart, -5), "HH:mm")} 부터 가능합니다.`
          : "불가"
      }`;
    }
  } else {
    // 출근 중
    if (!canClockOut) {
      showButton = true;
      buttonDisabled = true;
      buttonMessage = `퇴근은 ${
        latestEnd
          ? `${format(addMinutes(latestEnd, -5), "HH:mm")} 부터 가능합니다.`
          : "불가"
      }`;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Clock In/Out
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Stats</h3>
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? "Loading..."
                  : activeTimeClock
                  ? `Working since ${format(
                      new Date(activeTimeClock.clockInTime),
                      "HH:mm"
                    )}`
                  : "Not clocked in yet"}
              </p>
            </div>
            <div>
              {!isLoading &&
                showButton &&
                (activeTimeClock ? (
                  <Button
                    onClick={handleClockOut}
                    disabled={clockOutLoading || buttonDisabled}
                    variant="destructive"
                  >
                    {clockOutLoading ? "Processing..." : "Clock Out"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClockIn}
                    disabled={clockInLoading || buttonDisabled}
                    variant="default"
                  >
                    {clockInLoading ? "Processing..." : "Clock In"}
                  </Button>
                ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {buttonMessage && <p>{buttonMessage}</p>}
            {activeTimeClock ? (
              <p>
                Actual working hours will be calculated automatically upon
                clocking out
              </p>
            ) : (
              <p>Clocking in will automatically sync with your schedule.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
