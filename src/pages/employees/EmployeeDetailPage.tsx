import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { getEmployeeById } from "@/features/employees/store/employeesSlice";
import { getUserSchedules } from "@/features/schedules/store/schedulesSlice";
import { getUserTimeClocks } from "@/features/timeclocks/store/timeclocksSlice";
import { getUserLeaveBalances } from "@/features/leaves/store/leaveSlice";
import { format } from "date-fns";
import { EmployeeRole } from "@/api/employee/employeeApi.types";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { currentEmployee } = useAppSelector((state) => state.employees);
  const { schedules } = useAppSelector((state) => state.schedules);
  const { timeClocks } = useAppSelector((state) => state.timeclocks);
  const { userLeaveBalances } = useAppSelector((state) => state.leaves);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoading = loading["getEmployeeById"];
  const isManager =
    user?.role === EmployeeRole.MANAGER || user?.role === EmployeeRole.ADMIN;

  // Fetch employee data
  useEffect(() => {
    if (id) {
      dispatch(getEmployeeById(id));

      // Also fetch related data
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      dispatch(
        getUserSchedules({
          userId: id,
          params: {
            startDate: format(startOfMonth, "yyyy-MM-dd"),
            endDate: format(endOfMonth, "yyyy-MM-dd"),
          },
        })
      );

      dispatch(
        getUserTimeClocks({
          userId: id,
          params: {
            startDate: format(startOfMonth, "yyyy-MM-dd"),
            endDate: format(endOfMonth, "yyyy-MM-dd"),
            limit: "10",
          },
        })
      );

      dispatch(getUserLeaveBalances({ userId: id }));
    }
  }, [id, dispatch]);

  // 직원이 자신의 정보를 보는지 또는 매니저가 다른 직원을 보는지 확인
  const isOwnProfile = user?.id === id;
  const canEdit = isOwnProfile || isManager;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!currentEmployee) {
    return (
      <MainLayout>
        <div className="text-center">
          <p>Employee information not found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Employee Details
            </h1>
          </div>
          {canEdit && (
            <Button onClick={() => navigate(`/employees/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
          )}
        </div>

        {/* Employee Info Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {currentEmployee.lastName} {currentEmployee.firstName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {currentEmployee.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {currentEmployee.dateOfBirth
                    ? format(
                        new Date(currentEmployee.dateOfBirth),
                        "yyyy-MM-dd"
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      currentEmployee.role === EmployeeRole.ADMIN
                        ? "bg-purple-100 text-purple-700"
                        : currentEmployee.role === EmployeeRole.MANAGER
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {currentEmployee.role === EmployeeRole.ADMIN
                      ? "Admin"
                      : currentEmployee.role === EmployeeRole.MANAGER
                      ? "Manager"
                      : "Employee"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">
                  {currentEmployee.department?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">
                  {currentEmployee.position?.title || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(currentEmployee.hireDate), "yyyy-MM-dd")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      !currentEmployee.terminationDate
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {!currentEmployee.terminationDate ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              {currentEmployee.terminationDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Termination Date
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(currentEmployee.terminationDate),
                      "yyyy-MM-dd"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {currentEmployee.profile?.address || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Emergency Contact
                </p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {currentEmployee.profile?.emergencyContact || "-"}
                </p>
              </div>
              {isManager && (
                <div>
                  <p className="text-sm text-muted-foreground">Pay Rate</p>
                  <p className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {currentEmployee.payRate
                      ? `$${currentEmployee.payRate.toFixed(2)}`
                      : "-"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Month's Schedules
              </CardTitle>
              <CardDescription>Schedule details for this month</CardDescription>
            </CardHeader>
            <CardContent>
              {schedules?.data?.length === 0 ? (
                <p className="text-muted-foreground">No schedules available.</p>
              ) : (
                <div className="space-y-2">
                  {schedules?.data?.slice(0, 5).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(schedule.startTime), "MM/dd")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(schedule.startTime), "HH:mm")} -{" "}
                          {format(new Date(schedule.endTime), "HH:mm")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          schedule.scheduleType === "REGULAR"
                            ? "bg-blue-100 text-blue-700"
                            : schedule.scheduleType === "OVERTIME"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {schedule.scheduleType === "REGULAR"
                          ? "Regular"
                          : schedule.scheduleType === "OVERTIME"
                          ? "Overtime"
                          : "Holiday"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Leave Balances
              </CardTitle>
              <CardDescription>Available leave status</CardDescription>
            </CardHeader>
            <CardContent>
              {userLeaveBalances?.balances?.length === 0 ? (
                <p className="text-muted-foreground">
                  No leave information available.
                </p>
              ) : (
                <div className="space-y-2">
                  {userLeaveBalances?.balances?.map((balance) => (
                    <div
                      key={balance.leaveTypeId}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <p className="font-medium">{balance.leaveTypeName}</p>
                      <p className="text-sm">
                        <span className="font-medium">{balance.remaining}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {balance.balanceDays} days
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Time Clocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Time Clock Records
            </CardTitle>
            <CardDescription>Time clock records for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {timeClocks?.data?.length === 0 ? (
              <p className="text-muted-foreground">
                No time clock records available.
              </p>
            ) : (
              <div className="space-y-2">
                {timeClocks?.data?.slice(0, 5).map((clock) => (
                  <div
                    key={clock.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(clock.clockInTime), "MM/dd (E)")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Clock In: {format(new Date(clock.clockInTime), "HH:mm")}
                        {clock.clockOutTime && (
                          <>
                            {" "}
                            | Clock Out:{" "}
                            {format(new Date(clock.clockOutTime), "HH:mm")}
                          </>
                        )}
                      </p>
                    </div>
                    {clock.totalMinutes && (
                      <p className="text-sm font-medium">
                        {Math.floor(clock.totalMinutes / 60)}h{" "}
                        {clock.totalMinutes % 60}m
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EmployeeDetailPage;
