import { useEffect, useState, useCallback, Fragment } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { getEmployees } from "@/features/employees/store/employeesSlice";
import { getDepartments } from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import { useNavigate } from "react-router-dom";
import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { debounce } from "lodash";
import { formatToVancouverTime } from "@/utils/dateUtils";
import { RoleBadge } from "@/components/common/RoleBadge";
import ErrorFallback from "@/components/common/ErrorFallback";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileDown,
  Edit,
  Eye,
  MoreHorizontal,
  RotateCw,
  Loader2,
  Building2,
} from "lucide-react";

const EmployeesListPageContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const { employees } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoading = loading["getEmployees"];

  // Local state for filters
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch departments and positions on component mount
  useEffect(() => {
    dispatch(getDepartments({ limit: "100" }));
    dispatch(getPositions({ limit: "100" }));
  }, [dispatch]);

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((params: any) => {
      dispatch(getEmployees(params));
    }, 300),
    [dispatch]
  );

  // Fetch employees function
  const fetchEmployees = useCallback(
    (page: number = currentPage) => {
      const params: any = {
        page: page.toString(),
        limit: "10",
      };

      if (search) params.search = search;
      if (selectedDepartment) params.departmentId = selectedDepartment;
      if (selectedPosition) params.positionId = selectedPosition;
      if (selectedRole) params.role = selectedRole;
      if (selectedStatus) params.isActive = selectedStatus;

      debouncedFetch(params);
    },
    [
      search,
      selectedDepartment,
      selectedPosition,
      selectedRole,
      selectedStatus,
      currentPage,
      debouncedFetch,
    ]
  );

  // Effect to fetch employees when filters or page change
  useEffect(() => {
    fetchEmployees(currentPage);

    // Cleanup function to cancel debounced fetch on unmount or when dependencies change
    return () => {
      debouncedFetch.cancel();
    };
  }, [
    search,
    selectedDepartment,
    selectedPosition,
    selectedRole,
    selectedStatus,
    currentPage,
    fetchEmployees,
  ]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setSelectedRole("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  // Handle Excel export
  const handleExport = () => {
    // TODO: Implement Excel export functionality
    console.log("Export to Excel");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/departments")}>
              <Building2 className="mr-2 h-4 w-4" />
              Organization Settings
            </Button>
            <Button onClick={() => navigate("/employees/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Search and Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Department filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments?.data?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              {/* Position filter */}
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Positions</option>
                {positions?.data?.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </select>

              {/* Role filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Roles</option>
                <option value={EmployeeRole.EMPLOYEE}>Employee</option>
                <option value={EmployeeRole.MANAGER}>Manager</option>
                <option value={EmployeeRole.ADMIN}>Admin</option>
              </select>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Employee table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee List ({employees?.total || 0})</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : employees?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found.
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Name
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Email
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Department
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Position
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Role
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Hire Date
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Status
                        </th>
                        <th className="p-4 text-left font-medium whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees?.data?.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 whitespace-nowrap">
                            {employee.lastName} {employee.firstName}
                          </td>
                          <td className="p-4">{employee.email}</td>
                          <td className="p-4">
                            {employee.department?.name || "-"}
                          </td>
                          <td className="p-4">
                            {employee.position?.title || "-"}
                          </td>
                          <td className="p-4">
                            <RoleBadge role={employee.role} />
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {formatToVancouverTime(
                              employee.hireDate,
                              "yyyy-MM-dd"
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                !employee.terminationDate
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {!employee.terminationDate
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/employees/${employee.id}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/employees/${employee.id}/edit`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {employees && employees.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from(
                      { length: employees.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === employees.totalPages ||
                          Math.abs(page - currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span key={`ellipsis-${page}`} className="px-2">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={
                              page === currentPage ? "page" : undefined
                            }
                          >
                            {page}
                          </Button>
                        </Fragment>
                      ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === employees.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

const EmployeesListPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
        // TODO: Consider more specific reset logic if needed, e.g., re-fetch data or clear filters
        window.location.reload();
      }}
    >
      <EmployeesListPageContent />
    </ErrorBoundary>
  );
};

export default EmployeesListPage;
