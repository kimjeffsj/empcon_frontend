import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, SubmitHandler, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import {
  getEmployeeById,
  updateEmployee,
} from "@/features/employees/store/employeesSlice";
import { UpdateEmployeeDto } from "@/api/employee/employeeApi.types";
import { getDepartments } from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { UpdateEmployeeFormData } from "./validations/updateEmployee.schema";
import { updateEmployeeSchema } from "./validations/updateEmployee.schema";

const EmployeeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentEmployee } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoading = loading["getEmployeeById"];
  const isUpdating = loading["updateEmployee"];

  const isOwnProfile = user?.id === id;
  const isManager =
    user?.role === EmployeeRole.MANAGER || user?.role === EmployeeRole.ADMIN;
  const canEdit = isOwnProfile || isManager;

  const form = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      hireDate: "",
      terminationDate: "",
      role: EmployeeRole.EMPLOYEE,
      departmentId: "",
      positionId: "",
      payRate: "",
      payPeriodType: PayPeriodType.BI_WEEKLY,
      overtimeEnabled: false,
      address: "",
      socialInsuranceNumber: "",
      comments: "",
      emergencyContact: "",
    },
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
      const vancouverTimeZone = "America/Vancouver";
      form.reset({
        email: currentEmployee.email,
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName,
        dateOfBirth: currentEmployee.dateOfBirth
          ? formatInTimeZone(
              parseISO(currentEmployee.dateOfBirth),
              vancouverTimeZone,
              "yyyy-MM-dd"
            )
          : "",
        hireDate: formatInTimeZone(
          parseISO(currentEmployee.hireDate),
          vancouverTimeZone,
          "yyyy-MM-dd"
        ),
        terminationDate: currentEmployee.terminationDate
          ? formatInTimeZone(
              parseISO(currentEmployee.terminationDate),
              vancouverTimeZone,
              "yyyy-MM-dd"
            )
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
  }, [currentEmployee, form]);

  const onSubmit: SubmitHandler<UpdateEmployeeFormData> = async (formData) => {
    if (!id) return;

    const numericPayRate =
      formData.payRate && formData.payRate.trim() !== ""
        ? parseFloat(formData.payRate)
        : undefined;

    if (
      formData.payRate &&
      formData.payRate.trim() !== "" &&
      isNaN(numericPayRate!)
    ) {
      form.setError("payRate", {
        type: "manual",
        message: "Invalid number for pay rate",
      });
      return;
    }

    const dataToSubmit: UpdateEmployeeDto = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      hireDate: formData.hireDate
        ? new Date(formData.hireDate).toISOString()
        : undefined,
      role: formData.role,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : undefined,
      terminationDate: formData.terminationDate
        ? new Date(formData.terminationDate).toISOString()
        : undefined,
      departmentId: formData.departmentId || undefined,
      positionId: formData.positionId || undefined,
      payRate: numericPayRate,
      payPeriodType: formData.payPeriodType || undefined,
      overtimeEnabled: formData.overtimeEnabled,
      profile: {
        address: formData.address || undefined,
        socialInsuranceNumber: formData.socialInsuranceNumber || undefined,
        comments: formData.comments || undefined,
        emergencyContact: formData.emergencyContact || undefined,
      },
    };

    if (!dataToSubmit.profile?.address) delete dataToSubmit.profile?.address;
    if (!dataToSubmit.profile?.socialInsuranceNumber)
      delete dataToSubmit.profile?.socialInsuranceNumber;
    if (!dataToSubmit.profile?.comments) delete dataToSubmit.profile?.comments;
    if (!dataToSubmit.profile?.emergencyContact)
      delete dataToSubmit.profile?.emergencyContact;
    if (Object.keys(dataToSubmit.profile || {}).length === 0) {
      delete dataToSubmit.profile;
    }

    if (!formData.hireDate) {
      // This case should ideally be prevented by form validation if hireDate is truly required.
      // If hireDate can be cleared in the form but is required by UpdateEmployeeDto if any part of it is sent,
      // then this logic might need adjustment based on API behavior for partial updates.
      // For now, we assume valid hireDate string from form or it's handled by Zod schema.
      // If hireDate is removed from DTO for partial update, then delete dataToSubmit.hireDate;
    }

    const promise = dispatch(
      updateEmployee({ id, data: dataToSubmit as any })
    ).unwrap();

    toast.promise(promise, {
      loading: "Updating employee information...",
      success: () => {
        navigate(`/employees/${id}`);
        return "Employee information updated successfully.";
      },
      error: (err: any) =>
        err.message || "Failed to update employee information.",
    });
  };

  const handlePayRateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value && !isNaN(parseFloat(value))) {
      form.setValue("payRate", parseFloat(value).toFixed(2), {
        shouldValidate: true,
      });
    } else if (value.trim() === "") {
      form.setValue("payRate", "", { shouldValidate: true });
    }
  };

  if (!canEdit) {
    return (
      <MainLayout>
        <div className="text-center">
          <p>You do not have permission to access this page.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Employee Information
          </h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the employee's basic information
                </CardDescription>
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

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>
                  Edit the employee's work-related information
                </CardDescription>
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
                        <div className="flex gap-2">
                          <FormLabel>Termination Date</FormLabel>
                          <FormDescription>
                            Enter only if the employee has been terminated
                          </FormDescription>
                        </div>
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
                              {positions?.data?.map((position) => (
                                <SelectItem
                                  key={position.id}
                                  value={position.id}
                                >
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
                )}
              </CardContent>
            </Card>

            {isManager && (
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Information</CardTitle>
                  <CardDescription>
                    Edit information for payroll calculation
                  </CardDescription>
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
                          <FormLabel>Pay Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 17.50"
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
                          <FormLabel>Pay Period</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                      control={
                        form.control as Control<UpdateEmployeeFormData, any>
                      }
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
                              checked={!!field.value}
                              onBlur={field.onBlur}
                              onChange={(e) => field.onChange(e.target.checked)}
                              ref={field.ref}
                              name={field.name}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Edit optional information</CardDescription>
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
                          {...field}
                          placeholder="Enter address"
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
                        <FormLabel>SIN (Social Insurance Number)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isManager}
                            placeholder="123-456-789"
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
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="010-1234-5678"
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
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...field}
                          disabled={!isManager}
                          placeholder="Enter additional comments"
                          value={field.value || ""}
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
              <Button
                type="submit"
                disabled={
                  isUpdating ||
                  !form.formState.isDirty /*|| !form.formState.isValid*/
                }
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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

export default EmployeeEditPage;
