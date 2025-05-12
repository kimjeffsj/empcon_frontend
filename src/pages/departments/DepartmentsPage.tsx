import { useEffect, useState, useCallback, Fragment } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAppDispatch, useAppSelector } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/features/departments/store/departmentsSlice";
import { getPositions } from "@/features/positions/store/positionSlice";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import ErrorFallback from "@/components/common/ErrorFallback";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  RotateCw,
  Loader2,
  Users,
  Building2,
  FileDown,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/api/department/department.types";
import { DepartmentFormData } from "./validations/createDepartment.schema";
import { departmentSchema } from "./validations/createDepartment.schema";

const DepartmentsPageContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoading = loading["getDepartments"] || false;
  const isCreating = loading["createDepartment"] || false;
  const isUpdating = loading["updateDepartment"] || false;
  const isDeleting = loading["deleteDepartment"] || false;

  // Local state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Form
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(getPositions({ limit: "100" }));
  }, [dispatch]);

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((params: any) => {
      dispatch(getDepartments(params));
    }, 300),
    [dispatch]
  );

  // Fetch departments function
  const fetchDepartments = useCallback(
    (page: number = currentPage) => {
      const params: any = {
        page: page.toString(),
        limit: "10",
      };

      if (search) params.search = search;

      debouncedFetch(params);
    },
    [search, currentPage, debouncedFetch]
  );

  // Effect to fetch departments when filters or page change
  useEffect(() => {
    fetchDepartments(currentPage);

    // Cleanup function
    return () => {
      debouncedFetch.cancel();
    };
  }, [search, currentPage, fetchDepartments]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setCurrentPage(1);
  };

  // Handle create department
  const handleCreate = async (data: DepartmentFormData) => {
    try {
      const createData: CreateDepartmentDto = {
        name: data.name,
        description: data.description,
      };

      await dispatch(createDepartment(createData)).unwrap();
      toast.success("Department created successfully");
      setCreateDialogOpen(false);
      form.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create department";
      toast.error(errorMessage);
    }
  };

  // Handle edit department
  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: DepartmentFormData) => {
    if (!selectedDepartment) return;

    try {
      const updateData: UpdateDepartmentDto = {
        name: data.name,
        description: data.description,
      };

      await dispatch(
        updateDepartment({ id: selectedDepartment.id, data: updateData })
      ).unwrap();
      toast.success("Department updated successfully");
      setEditDialogOpen(false);
      setSelectedDepartment(null);
      form.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update department";
      toast.error(errorMessage);
    }
  };

  // Handle delete department
  const handleDelete = (department: any) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDepartment) return;

    try {
      await dispatch(deleteDepartment(selectedDepartment.id)).unwrap();
      toast.success("Department deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete department";
      toast.error(errorMessage);
    }
  };

  // Get position count for a department
  const getPositionCount = (departmentId: string) => {
    return (
      positions?.data?.filter((pos) => pos.departmentId === departmentId)
        .length || 0
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/employees")}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Organization Settings
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/positions")}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Positions
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Department
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Search Departments</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by department name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Department List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departments ({departments?.total || 0})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Export")}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : departments?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No departments found.
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium">Name</th>
                        <th className="p-4 text-left font-medium">
                          Description
                        </th>
                        <th className="p-4 text-left font-medium">
                          Employee Count
                        </th>
                        <th className="p-4 text-left font-medium">
                          Position Count
                        </th>
                        <th className="p-4 text-left font-medium">
                          Created Date
                        </th>
                        <th className="p-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments?.data?.map((department) => (
                        <tr
                          key={department.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium">{department.name}</td>
                          <td className="p-4 text-muted-foreground">
                            {department.description || "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {/* TODO: Get actual employee count */}0
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {getPositionCount(department.id)}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {new Date(
                              department.createdAt
                            ).toLocaleDateString()}
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
                                  onClick={() => handleEdit(department)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(department)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
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
                {departments && departments.totalPages > 1 && (
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
                      { length: departments.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === departments.totalPages ||
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
                      disabled={currentPage === departments.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to organize your employees.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreate)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sales, Engineering, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Department
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Make changes to the department information.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setSelectedDepartment(null);
                      form.reset();
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Department</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the department "
                {selectedDepartment?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedDepartment(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

const DepartmentsPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <DepartmentsPageContent />
    </ErrorBoundary>
  );
};

export default DepartmentsPage;
