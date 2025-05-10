import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Briefcase, AlertCircle } from "lucide-react";

import { format, addDays } from "date-fns"; // addDays 추가 임포트
import { ScheduleList } from "@/features/dashboard/components/ScheduleList";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ClockInOutCard } from "@/features/dashboard/components/ClockInOutCard";

import { RecentNotifications } from "@/features/dashboard/components/RecentNotifications";
import { getUserSchedules } from "@/features/schedules/store/schedulesSlice";
import { getActiveTimeClock } from "@/features/timeclocks/store/timeclocksSlice";
import { getUserLeaveBalances } from "@/features/leaves/store/leaveSlice";
import { PendingRequestsCard } from "@/features/dashboard/components/PendingRequestCard";
import { getLeaveRequests } from "@/features/leaves/store/leaveSlice"; // 추가
import { LeaveStatus } from "@/api/leave/leaveApi.types"; // 추가

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { schedules } = useAppSelector((state) => state.schedules);
  const { activeTimeClock } = useAppSelector((state) => state.timeclocks);
  const { userLeaveBalances, leaveRequests } = useAppSelector(
    (state) => state.leaves
  ); // leaveRequests 추가
  const { loading } = useAppSelector((state) => state.ui);

  // 에러 상태 추가
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const schedulesLoading = loading["getUserSchedules"];
  const timeClockLoading = loading["getActiveTimeClock"];
  const leavesLoading = loading["getUserLeaveBalances"];
  const requestsLoading = loading["getLeaveRequests"]; // 추가

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const today = new Date();

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
            setLoadingError("스케줄 데이터를 불러오는데 실패했습니다.");
          });

        // 현재 출근 상태 로드
        dispatch(getActiveTimeClock(user.id))
          .unwrap()
          .catch((err) => {
            setLoadingError("출근 상태를 확인하는데 실패했습니다.");
          });

        // 휴가 잔액 로드
        dispatch(getUserLeaveBalances({ userId: user.id }))
          .unwrap()
          .catch((err) => {
            setLoadingError("휴가 데이터를 불러오는데 실패했습니다.");
          });

        // 매니저인 경우 보류 중인 요청 로드
        if (isManager) {
          dispatch(getLeaveRequests({ status: LeaveStatus.PENDING, limit: 5 }))
            .unwrap()
            .catch((err) => {
              setLoadingError("요청 데이터를 불러오는데 실패했습니다.");
            });
        }
      } catch (error) {
        console.error("Dashboard data loading error:", error);
        setLoadingError("데이터를 불러오는데 문제가 발생했습니다.");
      }
    }
  }, [dispatch, user, isManager]);

  // 보류 중인 요청 수 계산
  const pendingRequestsCount = leaveRequests?.total || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>

        {/* 에러 메시지 표시 */}
        {loadingError && (
          <div className="bg-destructive/15 p-4 rounded-lg text-destructive">
            <p>{loadingError}</p>
            <button
              className="text-sm underline mt-2"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h2 className="font-medium text-xl">
            안녕하세요, {user?.firstName} {user?.lastName}님
          </h2>
          <p className="text-muted-foreground">
            {format(today, "yyyy년 M월 d일 (EEEE)", { locale: undefined })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="오늘 스케줄"
            value={
              schedulesLoading
                ? "로딩 중..."
                : schedules?.data?.length > 0
                ? "예정됨"
                : "없음"
            }
            description={
              schedulesLoading
                ? ""
                : schedules?.data?.length > 0
                ? `${format(
                    new Date(schedules.data[0].startTime),
                    "HH:mm"
                  )} - ${format(new Date(schedules.data[0].endTime), "HH:mm")}`
                : "오늘은 스케줄이 없습니다"
            }
            icon={<Calendar className="h-8 w-8 text-blue-500" />}
          />

          <StatCard
            title="출근 상태"
            value={
              timeClockLoading
                ? "로딩 중..."
                : activeTimeClock
                ? "출근 중"
                : "퇴근"
            }
            description={
              timeClockLoading
                ? ""
                : activeTimeClock
                ? `${format(
                    new Date(activeTimeClock.clockInTime),
                    "HH:mm"
                  )}에 출근`
                : "아직 출근 전입니다"
            }
            icon={<Clock className="h-8 w-8 text-green-500" />}
            variant={activeTimeClock ? "success" : "default"}
          />

          <StatCard
            title="휴가 잔액"
            value={
              leavesLoading
                ? "로딩 중..."
                : userLeaveBalances?.balances?.length > 0
                ? `${userLeaveBalances.balances.reduce(
                    (sum, balance) => sum + balance.balanceDays,
                    0
                  )}일`
                : "0일"
            }
            description="사용 가능한 휴가 일수"
            icon={<Briefcase className="h-8 w-8 text-purple-500" />}
          />

          {isManager ? (
            <StatCard
              title="미처리 요청"
              value={
                requestsLoading ? "로딩 중..." : `${pendingRequestsCount}건`
              }
              description="승인 대기 중인 요청"
              icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
              variant="warning"
            />
          ) : (
            <StatCard
              title="직원 정보"
              value={user?.department?.name || "부서 미지정"}
              description={user?.position?.title || "직책 미지정"}
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
                  앞으로 일주일 스케줄
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleList
                  schedules={schedules?.data || []}
                  isLoading={schedulesLoading}
                  emptyMessage="앞으로 일주일간 스케줄이 없습니다."
                />
              </CardContent>
            </Card>

            <ClockInOutCard
              activeTimeClock={activeTimeClock}
              isLoading={timeClockLoading}
            />

            {isManager && (
              <PendingRequestsCard
                isLoading={requestsLoading}
                pendingRequests={leaveRequests?.data || []}
              />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  최근 알림
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
                  휴가 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leavesLoading ? (
                  <div className="text-center py-4">로딩 중...</div>
                ) : userLeaveBalances?.balances?.length > 0 ? (
                  <div className="space-y-2">
                    {userLeaveBalances.balances.map((balance) => (
                      <div
                        key={balance.leaveTypeId}
                        className="flex justify-between items-center"
                      >
                        <span>{balance.leaveTypeName || "일반 휴가"}</span>
                        <span className="font-medium">
                          {balance.remaining}/{balance.balanceDays}일
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    사용 가능한 휴가가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            {isManager && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    직원 출근 현황
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 실제 데이터로 교체 - 여기서는 간단한 UI만 추가 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>출근</span>
                      </div>
                      <span className="font-medium">3명</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>결근</span>
                      </div>
                      <span className="font-medium">0명</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>지각</span>
                      </div>
                      <span className="font-medium">1명</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span>미출근</span>
                      </div>
                      <span className="font-medium">2명</span>
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
