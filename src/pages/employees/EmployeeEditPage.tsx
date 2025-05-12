import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, SubmitHandler, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorBoundary } from "react-error-boundary";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import {
  getEmployeeById,
  updateEmployee,
} from "@/features/employees/store/employeesSlice";
import { UpdateEmployeeDto } from "@/api/employee/employeeApi.types";
import { getDepartments } from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";
import { toast } from "sonner";
import ErrorFallback from "@/components/common/ErrorFallback";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { UpdateEmployeeFormData } from "./validations/updateEmployee.schema";
import { updateEmployeeSchema } from "./validations/updateEmployee.schema";

const EmployeeEditPageContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentEmployee } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoadingPage = loading["getEmployeeById"];
  const isUpdating = loading["updateEmployee"];

  const isOwnProfile = user?.id === id;
  const isManager =
    user?.role === EmployeeRole.MANAGER || user?.role === EmployeeRole.ADMIN;
  const canEditPage = isOwnProfile || isManager;

  const form = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
  });

  useEffect(() => {
    if (id) {
      dispatch(getEmployeeById(id));
      dispatch(getDepartments({ limit: "100" }));
      dispatch(getPositions({ limit: "100" }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentEmployee) {
      form.reset({
        email: currentEmployee.email,
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName,
        dateOfBirth: currentEmployee.dateOfBirth
          ? currentEmployee.dateOfBirth.substring(0, 10)
          : "",
        hireDate: currentEmployee.hireDate.substring(0, 10),
        terminationDate: currentEmployee.terminationDate
          ? currentEmployee.terminationDate.substring(0, 10)
          : "",
        role: currentEmployee.role,
        departmentId: currentEmployee.department?.id || "",
        positionId: currentEmployee.position?.id || "",
        payRate: currentEmployee.payRate
          ? parseFloat(currentEmployee.payRate.toString()).toFixed(2)
          : "",
        payPeriodType: currentEmployee.payPeriodType || PayPeriodType.BI_WEEKLY,
        overtimeEnabled: currentEmployee.overtimeEnabled ?? false,
        address: currentEmployee.profile?.address || "",
        socialInsuranceNumber:
          currentEmployee.profile?.socialInsuranceNumber || "",
        comments: currentEmployee.profile?.comments || "",
        emergencyContact: currentEmployee.profile?.emergencyContact || "",
      });
    }
  }, [currentEmployee, form, id]);

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

  const onSubmit: SubmitHandler<UpdateEmployeeFormData> = async (formData) => {
    if (!id) return;

    const numericPayRate =
      formData.payRate && formData.payRate.trim() !== ""
        ? parseFloat(formData.payRate)
        : undefined;

    if (
      formData.payRate &&
      formData.payRate.trim() !== "" &&
      numericPayRate === undefined
    ) {
      form.setError("payRate", {
        type: "manual",
        message: "Pay rate must be a valid number.",
      });
      return;
    }

    const dataToSubmit: UpdateEmployeeDto = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : undefined,
      hireDate: formData.hireDate
        ? new Date(formData.hireDate).toISOString()
        : undefined,
      terminationDate: formData.terminationDate
        ? new Date(formData.terminationDate).toISOString()
        : undefined,
      role: formData.role,
      departmentId: formData.departmentId || undefined,
      positionId: formData.positionId || undefined,
      payRate: numericPayRate,
      payPeriodType: formData.payPeriodType || undefined,
      overtimeEnabled: formData.overtimeEnabled,
      ...((formData.address ||
        formData.socialInsuranceNumber ||
        formData.comments ||
        formData.emergencyContact) && {
        profile: {
          address: formData.address || undefined,
          socialInsuranceNumber: formData.socialInsuranceNumber || undefined,
          comments: formData.comments || undefined,
          emergencyContact: formData.emergencyContact || undefined,
        },
      }),
    };

    if (dataToSubmit.profile) {
      if (dataToSubmit.profile.address === "")
        dataToSubmit.profile.address = undefined;
      if (dataToSubmit.profile.socialInsuranceNumber === "")
        dataToSubmit.profile.socialInsuranceNumber = undefined;
      if (dataToSubmit.profile.comments === "")
        dataToSubmit.profile.comments = undefined;
      if (dataToSubmit.profile.emergencyContact === "")
        dataToSubmit.profile.emergencyContact = undefined;
      if (Object.values(dataToSubmit.profile).every((v) => v === undefined)) {
        delete dataToSubmit.profile;
      }
    }

    if (formData.departmentId === "") dataToSubmit.departmentId = undefined;
    if (formData.positionId === "") dataToSubmit.positionId = undefined;
    if (formData.terminationDate === "")
      dataToSubmit.terminationDate = undefined;

    const promise = dispatch(
      updateEmployee({ id, data: dataToSubmit })
    ).unwrap();

    toast.promise(promise, {
      loading: "Updating employee information...",
      success: () => {
        navigate(-1);
        return "Employee information updated successfully.";
      },
      error: (err: any) => {
        let message = "Failed to update employee information.";
        if (err?.data?.message) message = err.data.message;
        else if (err?.message) message = err.message;
        if (err?.data?.errors) {
          Object.entries(err.data.errors).forEach(([field, errMsg]) => {
            form.setError(field as any, {
              type: "server",
              message: errMsg as string,
            });
          });
        }
        return message;
      },
    });
  };

  if (!canEditPage) {
    return (
      <MainLayout>
        <div className="text-center p-4">
          <p className="text-lg text-muted-foreground">
            You do not have permission to edit this employee.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoadingPage) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!currentEmployee && !isLoadingPage) {
    return (
      <MainLayout>
        <div className="text-center p-4">
          <p className="text-lg text-muted-foreground">Employee not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
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
            Edit Employee Information for {currentEmployee?.firstName}{" "}
            {currentEmployee?.lastName}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="terminationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termination Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty if an active employee.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {isManager && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                    <FormField
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
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
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
                      name="positionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
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
                )}
              </CardContent>
            </Card>

            {/* Payroll Information Card - 접근 권한(isManager) 확인 필요, 현재 코드에서는 isManager일 때만 보임. */}
            {isManager && (
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
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
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
                      name="payPeriodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pay Period Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || PayPeriodType.BI_WEEKLY}
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
                    <FormField
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
                      name="overtimeEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Overtime Pay
                            </FormLabel>
                            <FormDescription>
                              Employee is eligible for overtime pay.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control as Control<UpdateEmployeeFormData, any>}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St, Anytown"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="socialInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Insurance Number (SIN)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123-456-789"
                            {...field}
                            value={field.value || ""}
                            disabled={!isManager}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={
                      form.control as Control<UpdateEmployeeFormData, any>
                    }
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name - Phone Number"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as Control<UpdateEmployeeFormData, any>}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Any additional notes..."
                          value={field.value || ""}
                          disabled={!isManager}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !form.formState.isDirty}
                className="min-w-[150px]"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

const EmployeeEditPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <EmployeeEditPageContent />
    </ErrorBoundary>
  );
};

export default EmployeeEditPage;
