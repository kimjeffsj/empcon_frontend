import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorBoundary } from "react-error-boundary";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { createEmployee } from "@/features/employees/store/employeesSlice";
import { getDepartments } from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import {
  CreateEmployeeDto,
  EmployeeRole,
} from "@/api/employee/employeeApi.types";
import ErrorFallback from "@/components/common/ErrorFallback";
import { toast } from "sonner";

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
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import {
  CreateEmployeeFormData,
  createEmployeeSchema,
} from "./validations/createEmployee.schema";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";

const EmployeeCreatePageContent = () => {
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
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      hireDate: "",
      role: EmployeeRole.EMPLOYEE,
      departmentId: "",
      positionId: "",
      payRate: "",
      payPeriodType: PayPeriodType.BI_WEEKLY,
      overtimeEnabled: true,
      address: "",
      socialInsuranceNumber: "",
      comments: "",
      emergencyContact: "",
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

  const handlePayRateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || value.trim() === "") {
      form.setValue("payRate", "", { shouldValidate: true });
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      form.setError("payRate", { type: "manual", message: "Invalid number" });
      return;
    }

    form.setValue("payRate", numericValue.toFixed(2), { shouldValidate: true });
  };

  // Form submit handler
  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      const numericPayRate =
        data.payRate && data.payRate.trim() !== ""
          ? parseFloat(data.payRate)
          : undefined;

      // Zod 스키마가 이미 payRate 문자열을 검증하므로, 여기서의 수동 검증은 단순화하거나 제거 가능.
      // createEmployeeSchema에서 payRate가 string().optional().refine(...)으로 정의됨.
      // 여기서는 numericPayRate가 NaN인지 여부만 추가로 확인.
      if (
        data.payRate &&
        data.payRate.trim() !== "" &&
        numericPayRate === undefined
      ) {
        // refine에서 이미 처리될 수 있으나, 예방적 조치
        form.setError("payRate", {
          type: "manual",
          message: "Pay rate must be a valid number.",
        });
        return;
      }

      const hireDateTransformed = data.hireDate
        ? new Date(data.hireDate).toISOString()
        : "";
      if (!hireDateTransformed) {
        form.setError("hireDate", {
          type: "manual",
          message: "Hire date is required",
        });
        return;
      }

      const createEmployeeDto: CreateEmployeeDto = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        hireDate: hireDateTransformed,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        role: data.role,
        departmentId: data.departmentId || undefined,
        positionId: data.positionId || undefined,
        payRate: numericPayRate, // 여기서 숫자 또는 undefined
        payPeriodType: data.payPeriodType || undefined,
        overtimeEnabled: data.overtimeEnabled,
        profile: {
          address: data.address || undefined,
          socialInsuranceNumber: data.socialInsuranceNumber || undefined,
          comments: data.comments || undefined,
          emergencyContact: data.emergencyContact || undefined,
        },
      };

      if (
        !createEmployeeDto.profile?.address &&
        !createEmployeeDto.profile?.socialInsuranceNumber &&
        !createEmployeeDto.profile?.comments &&
        !createEmployeeDto.profile?.emergencyContact
      ) {
        delete createEmployeeDto.profile;
      }

      const result = await dispatch(createEmployee(createEmployeeDto)).unwrap();
      toast.success("Employee created successfully!");
      navigate(`/employees/${result.id}`);
    } catch (error: any) {
      console.error("Failed to create employee:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create employee. Please try again.";
      toast.error(errorMessage);
      // 서버에서 오는 에러 메시지가 배열이나 객체일 경우에 대한 처리도 추가하면 좋음
      if (error?.data?.errors) {
        Object.entries(error.data.errors).forEach(([field, message]) => {
          form.setError(field as any, {
            type: "server",
            message: message as string,
          });
        });
      }
    }
  };

  // Form error handler
  const onError = (errors: any) => {
    console.error("[EmployeeCreatePage.tsx] Form validation errors:", errors);
    toast.error("Please check the form for errors.");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
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
                  Enter the employee's basic information, email and password.
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
                          <Input placeholder="Doe" {...field} />
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
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            readOnly={autoGeneratePassword}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoPassword"
                      checked={autoGeneratePassword}
                      onChange={(e) =>
                        setAutoGeneratePassword(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="autoPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Auto-generate password
                    </label>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>
                  Assign role, department, position and hire date.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
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
                            {positions?.data?.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>
                                {pos.title}
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
                  Set up payroll details for the employee.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="payRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Rate (per hour)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="e.g., 20.50"
                            {...field}
                            onBlur={handlePayRateBlur}
                          />
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
                        <FormLabel>Pay Period Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Pay Period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PayPeriodType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="overtimeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Overtime Pay
                        </FormLabel>
                        <FormDescription>
                          Enable if this employee is eligible for overtime pay.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information (Optional)</CardTitle>
                <CardDescription>
                  Provide any other relevant details about the employee.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialInsuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Insurance Number (SIN)</FormLabel>
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
                        <Input placeholder="Name - Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Any additional notes..."
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="min-w-[150px]"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Create Employee
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

const EmployeeCreatePage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload(); /* or other reset logic */
      }}
    >
      <EmployeeCreatePageContent />
    </ErrorBoundary>
  );
};

export default EmployeeCreatePage;
