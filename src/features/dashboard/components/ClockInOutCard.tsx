import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { TimeClock } from "@/api/timeclock/timeClockApi.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { clockIn, clockOut } from "@/features/timeclocks/store/timeclocksSlice";

interface ClockInOutCardProps {
  activeTimeClock: TimeClock | null;
  isLoading: boolean;
}

export const ClockInOutCard = ({
  activeTimeClock,
  isLoading,
}: ClockInOutCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);

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
                (activeTimeClock ? (
                  <Button
                    onClick={handleClockOut}
                    disabled={clockOutLoading}
                    variant="destructive"
                  >
                    {clockOutLoading ? "Processing..." : "Clock Out"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClockIn}
                    disabled={clockInLoading}
                    variant="default"
                  >
                    {clockInLoading ? "Processing..." : "Clock In"}
                  </Button>
                ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
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
