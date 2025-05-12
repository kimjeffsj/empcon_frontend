import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Briefcase, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { ScheduleList } from "@/features/dashboard/components/ScheduleList";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ClockInOutCard } from "@/features/dashboard/components/ClockInOutCard";
import { RecentNotifications } from "@/features/dashboard/components/RecentNotifications";
import { getUserSchedules } from "@/features/schedules/store/schedulesSlice";
import { getActiveTimeClock } from "@/features/timeclocks/store/timeclocksSlice";
import { getUserLeaveBalances } from "@/features/leaves/store/leaveSlice";
import { PendingRequestsCard } from "@/features/dashboard/components/PendingRequestCard";
import { getLeaveRequests } from "@/features/leaves/store/leaveSlice";
import { LeaveStatus } from "@/api/leave/leaveApi.types";
import { formatToVancouverTime } from "@/utils/dateUtils";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { schedules } = useAppSelector((state) => state.schedules);
  const { activeTimeClock } = useAppSelector((state) => state.timeclocks);
  const { userLeaveBalances, leaveRequests } = useAppSelector(
    (state) => state.leaves
  ); // Added leaveRequests
  const { loading } = useAppSelector((state) => state.ui);

  // Error state
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const schedulesLoading = loading["getUserSchedules"];
  const timeClockLoading = loading["getActiveTimeClock"];
  const leavesLoading = loading["getUserLeaveBalances"];
  const requestsLoading = loading["getLeaveRequests"];

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todaySchedules =
    schedules?.data?.filter(
      (s) =>
        formatToVancouverTime(new Date(s.startTime), "yyyy-MM-dd") === todayStr
    ) || [];

  // 대시보드 데이터 로딩
  useEffect(() => {
    if (user) {
      try {
        // 날짜 범위 확장 - 오늘부터 향후 7일까지
        const startDate = format(today, "yyyy-MM-dd");
        const endDate = format(addDays(today, 6), "yyyy-MM-dd"); // 일주일 범위로 확장

        // 스케줄 데이터 로드
        dispatch(
          getUserSchedules({
            userId: user.id,
            params: { startDate, endDate },
          })
        )
          .unwrap()
          .catch((err) => {
            setLoadingError("Failed to load schedule data.");
          });

        // 현재 출근 상태 로드
        dispatch(getActiveTimeClock(user.id))
          .unwrap()
          .catch((err) => {
            setLoadingError("Failed to check clock-in status.");
          });

        // 휴가 잔액 로드
        dispatch(getUserLeaveBalances({ userId: user.id }))
          .unwrap()
          .catch((err) => {
            setLoadingError("Failed to load leave data.");
          });

        // 매니저인 경우 보류 중인 요청 로드
        if (isManager) {
          dispatch(getLeaveRequests({ status: LeaveStatus.PENDING, limit: 5 }))
            .unwrap()
            .catch((err) => {
              setLoadingError("Failed to load request data.");
            });
        }
      } catch (error) {
        console.error("Dashboard data loading error:", error);
        setLoadingError("An error occurred while loading data.");
      }
    }
  }, [dispatch, user, isManager]);

  // Calculate number of pending requests
  const pendingRequestsCount = leaveRequests?.total || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Display error message */}
        {loadingError && (
          <div className="bg-destructive/15 p-4 rounded-lg text-destructive">
            <p>{loadingError}</p>
            <button
              className="text-sm underline mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h2 className="font-medium text-xl">
            Hello, {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-muted-foreground">
            {format(today, "MMMM d, yyyy (EEEE)", { locale: undefined })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Schedule"
            value={
              schedulesLoading
                ? "Loading..."
                : (schedules?.data?.length ?? 0) > 0
                ? "Scheduled"
                : "None"
            }
            description={
              schedulesLoading
                ? ""
                : (schedules?.data?.length ?? 0) > 0 && schedules
                ? `${formatToVancouverTime(
                    new Date(schedules.data![0].startTime),
                    "HH:mm"
                  )} - ${formatToVancouverTime(
                    new Date(schedules.data![0].endTime),
                    "HH:mm"
                  )}`
                : "No schedule for today"
            }
            icon={<Calendar className="h-8 w-8 text-blue-500" />}
          />

          <StatCard
            title="Clock-In Status"
            value={
              timeClockLoading
                ? "Loading..."
                : activeTimeClock
                ? "Clocked In"
                : "Clocked Out"
            }
            description={
              timeClockLoading
                ? ""
                : activeTimeClock
                ? `Clocked in at ${format(
                    new Date(activeTimeClock.clockInTime),
                    "HH:mm"
                  )}`
                : "Not clocked in yet"
            }
            icon={<Clock className="h-8 w-8 text-green-500" />}
            variant={activeTimeClock ? "success" : "default"}
          />

          <StatCard
            title="Leave Balance"
            value={
              leavesLoading
                ? "Loading..."
                : (userLeaveBalances?.balances?.length ?? 0) > 0
                ? `${userLeaveBalances!.balances!.reduce(
                    (sum, balance) => sum + balance.balanceDays,
                    0
                  )} days`
                : "0 days"
            }
            description="Available leave days"
            icon={<Briefcase className="h-8 w-8 text-purple-500" />}
          />

          {isManager ? (
            <StatCard
              title="Pending Requests"
              value={
                requestsLoading ? "Loading..." : `${pendingRequestsCount} cases`
              }
              description="Requests awaiting approval"
              icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
              variant="warning"
            />
          ) : (
            <StatCard
              title="Employee Information"
              value={user?.department?.name || "Department not assigned"}
              description={user?.position?.title || "Position not assigned"}
              icon={<Users className="h-8 w-8 text-indigo-500" />}
            />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Week's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleList
                  schedules={schedules?.data || []}
                  isLoading={schedulesLoading}
                  emptyMessage="No schedule for the upcoming week."
                />
              </CardContent>
            </Card>

            <ClockInOutCard
              activeTimeClock={activeTimeClock}
              isLoading={timeClockLoading}
              todaySchedules={todaySchedules}
            />

            {isManager && (
              <PendingRequestsCard
                isLoading={!!requestsLoading}
                pendingRequests={leaveRequests?.data ?? []}
              />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentNotifications />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Leave Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leavesLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (userLeaveBalances?.balances?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {userLeaveBalances!.balances!.map((balance) => (
                      <div
                        key={balance.leaveTypeId}
                        className="flex justify-between items-center"
                      >
                        <span>{balance.leaveTypeName || "General Leave"}</span>
                        <span className="font-medium">
                          {balance.remaining}/{balance.balanceDays} days
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No available leave.
                  </div>
                )}
              </CardContent>
            </Card>

            {isManager && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Employee Attendance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Replace with actual data - simple UI added here for now */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Present</span>
                      </div>
                      <span className="font-medium">3 employees</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Absent</span>
                      </div>
                      <span className="font-medium">0 employees</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Late</span>
                      </div>
                      <span className="font-medium">1 employee</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span>Not Clocked In</span>
                      </div>
                      <span className="font-medium">2 employees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
