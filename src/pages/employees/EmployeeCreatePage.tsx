import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { createEmployee } from "@/features/employees/store/employeesSlice";
import { getDepartments } from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import { format } from "date-fns";
import {
  CreateEmployeeDto,
  EmployeeRole,
} from "@/api/employee/employeeApi.types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, RefreshCw, UserPlus } from "lucide-react";
import {
  CreateEmployeeFormData,
  createEmployeeSchema,
} from "./validations/employee.schema";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";

const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { loading } = useAppSelector((state) => state.ui);

  const isCreating = loading["createEmployee"];

  // Local state
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // Fetch departments and positions
  useEffect(() => {
    dispatch(getDepartments({ limit: "100" }));
    dispatch(getPositions({ limit: "100" }));
  }, [dispatch]);

  // Form setup
  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      role: EmployeeRole.EMPLOYEE,
      hireDate: format(new Date(), "yyyy-MM-dd"),
      overtimeEnabled: true,
      payPeriodType: PayPeriodType.BI_WEEKLY,
    },
  });

  // Generate random password
  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Auto-generate password when checkbox is checked
  useEffect(() => {
    if (autoGeneratePassword) {
      form.setValue("password", generatePassword());
    }
  }, [autoGeneratePassword, form]);

  // Form submit handler
  const onSubmit = async (data: CreateEmployeeFormData) => {
    console.log("[EmployeeCreatePage.tsx] onSubmit called with data:", data);
    try {
      // 백엔드 DTO 구조에 맞게 데이터 변환
      const createEmployeeDto: CreateEmployeeDto = {
        // 필수 필드
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        hireDate: new Date(data.hireDate).toISOString(),

        // 선택 필드
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        role: data.role,
        departmentId: data.departmentId || undefined,
        positionId: data.positionId || undefined,
        payRate: Number(data.payRate) || undefined,
        payPeriodType: data.payPeriodType || undefined,
        overtimeEnabled: data.overtimeEnabled,

        // 프로필 정보
        profile: {
          address: data.address || undefined,
          socialInsuranceNumber: data.socialInsuranceNumber || undefined,
          comments: data.comments || undefined,
          emergencyContact: data.emergencyContact || undefined,
        },
      };

      const result = await dispatch(createEmployee(createEmployeeDto)).unwrap();

      navigate(`/employees/${result.id}`);
    } catch (error: any) {
      console.error("Failed to create employee:", error);
    }
  };

  // Form error handler
  const onError = (errors: any) => {
    console.error("[EmployeeCreatePage.tsx] Form validation errors:", errors);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Employee
          </h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the employee's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Kim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Cheolsu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoGeneratePassword"
                      checked={autoGeneratePassword}
                      onChange={(e) =>
                        setAutoGeneratePassword(e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="autoGeneratePassword"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Auto-generate temporary password
                    </label>
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Password"
                              {...field}
                              disabled={autoGeneratePassword}
                            />
                            {autoGeneratePassword && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  form.setValue("password", generatePassword())
                                }
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Securely share this password with the employee
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>
                  Enter the employee's work-related information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={EmployeeRole.EMPLOYEE}>
                              Employee
                            </SelectItem>
                            <SelectItem value={EmployeeRole.MANAGER}>
                              Manager
                            </SelectItem>
                            <SelectItem value={EmployeeRole.ADMIN}>
                              Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments?.data?.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions?.data?.map((position) => (
                              <SelectItem key={position.id} value={position.id}>
                                {position.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payroll Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll Information</CardTitle>
                <CardDescription>
                  Enter information for payroll calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="payRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1.75 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payPeriodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Period</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PayPeriodType.SEMI_MONTHLY}>
                              Semi-monthly
                            </SelectItem>
                            <SelectItem value={PayPeriodType.BI_WEEKLY}>
                              Bi-weekly
                            </SelectItem>
                            <SelectItem value={PayPeriodType.MONTHLY}>
                              Monthly
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overtimeEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Overtime Pay</FormLabel>
                          <FormDescription>
                            Applied based on BC labor law
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-gray-300"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Enter optional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="socialInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SIN (Social Insurance Number)</FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="010-1234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Enter additional comments"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Employee
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default EmployeeCreatePage;
