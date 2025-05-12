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
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from "@/features/positions/store/positionSlice";
import { getEmployees } from "@/features/employees/store/employeesSlice";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import ErrorFallback from "@/components/common/ErrorFallback";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RotateCw,
  Loader2,
  Users,
  ArrowLeft,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/api/department/department.types";
import {
  CreatePositionDto,
  UpdatePositionDto,
} from "@/api/position/positionApi.types";
import { DepartmentFormData } from "./validations/createDepartment.schema";
import { positionSchema } from "./validations/createPosition.schema";
import { departmentSchema } from "./validations/createDepartment.schema";
import { PositionFormData } from "./validations/createPosition.schema";

const DepartmentsPageContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const { departments } = useAppSelector((state) => state.departments);
  const { positions } = useAppSelector((state) => state.positions);
  const { employees } = useAppSelector((state) => state.employees);
  const { loading } = useAppSelector((state) => state.ui);

  const isLoading = loading["getDepartments"] || false;
  const isCreatingDept = loading["createDepartment"] || false;
  const isUpdatingDept = loading["updateDepartment"] || false;
  const isDeletingDept = loading["deleteDepartment"] || false;
  const isCreatingPos = loading["createPosition"] || false;
  const isUpdatingPos = loading["updatePosition"] || false;
  const isDeletingPos = loading["deletePosition"] || false;

  // Local state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDeptDialogOpen, setCreateDeptDialogOpen] = useState(false);
  const [editDeptDialogOpen, setEditDeptDialogOpen] = useState(false);
  const [deleteDeptDialogOpen, setDeleteDeptDialogOpen] = useState(false);
  const [createPosDialogOpen, setCreatePosDialogOpen] = useState(false);
  const [editPosDialogOpen, setEditPosDialogOpen] = useState(false);
  const [deletePosDialogOpen, setDeletePosDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);

  // Forms
  const deptForm = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const posForm = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: "",
      description: "",
      departmentId: "",
    },
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(getPositions({ limit: "100" }));
    dispatch(getEmployees({ limit: "1000" }));
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

    return () => {
      debouncedFetch.cancel();
    };
  }, [search, currentPage, fetchDepartments]);

  // Get positions for a department
  const getPositionsForDepartment = (departmentId: string) => {
    return (
      positions?.data?.filter(
        (pos: any) => pos.departmentId === departmentId
      ) || []
    );
  };

  // Toggle department expansion
  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  // Handle department operations
  const handleCreateDepartment = async (data: DepartmentFormData) => {
    try {
      const createData: CreateDepartmentDto = {
        name: data.name,
        description: data.description,
      };

      await dispatch(createDepartment(createData)).unwrap();
      toast.success("Department created successfully");
      setCreateDeptDialogOpen(false);
      deptForm.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create department";
      toast.error(errorMessage);
    }
  };

  const handleEditDepartment = (department: any) => {
    setSelectedDepartment(department);
    deptForm.reset({
      name: department.name,
      description: department.description || "",
    });
    setEditDeptDialogOpen(true);
  };

  const handleUpdateDepartment = async (data: DepartmentFormData) => {
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
      setEditDeptDialogOpen(false);
      setSelectedDepartment(null);
      deptForm.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update department";
      toast.error(errorMessage);
    }
  };

  const handleDeleteDepartment = (department: any) => {
    setSelectedDepartment(department);
    setDeleteDeptDialogOpen(true);
  };

  const handleDeleteDepartmentConfirm = async () => {
    if (!selectedDepartment) return;

    try {
      await dispatch(deleteDepartment(selectedDepartment.id)).unwrap();
      toast.success("Department deleted successfully");
      setDeleteDeptDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete department";
      toast.error(errorMessage);
    }
  };

  // Handle position operations
  const handleCreatePosition = (departmentId: string) => {
    posForm.reset({
      title: "",
      description: "",
      departmentId: departmentId,
    });
    setCreatePosDialogOpen(true);
  };

  const handleCreatePositionSubmit = async (data: PositionFormData) => {
    try {
      const createData: CreatePositionDto = {
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
      };

      await dispatch(createPosition(createData)).unwrap();
      toast.success("Position created successfully");
      setCreatePosDialogOpen(false);
      posForm.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create position";
      toast.error(errorMessage);
    }
  };

  const handleEditPosition = (position: any) => {
    setSelectedPosition(position);
    posForm.reset({
      title: position.title,
      description: position.description || "",
      departmentId: position.departmentId || "",
    });
    setEditPosDialogOpen(true);
  };

  const handleUpdatePosition = async (data: PositionFormData) => {
    if (!selectedPosition) return;

    try {
      const updateData: UpdatePositionDto = {
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
      };

      await dispatch(
        updatePosition({ id: selectedPosition.id, data: updateData })
      ).unwrap();
      toast.success("Position updated successfully");
      setEditPosDialogOpen(false);
      setSelectedPosition(null);
      posForm.reset();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update position";
      toast.error(errorMessage);
    }
  };

  const handleDeletePosition = (position: any) => {
    setSelectedPosition(position);
    setDeletePosDialogOpen(true);
  };

  const handleDeletePositionConfirm = async () => {
    if (!selectedPosition) return;

    try {
      await dispatch(deletePosition(selectedPosition.id)).unwrap();
      toast.success("Position deleted successfully");
      setDeletePosDialogOpen(false);
      setSelectedPosition(null);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete position";
      toast.error(errorMessage);
    }
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
              Organization Management
            </h1>
          </div>
          <Button onClick={() => setCreateDeptDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Department
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Search Departments</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
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

        {/* Department List with Positions */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : departments?.data?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No departments found.
              </CardContent>
            </Card>
          ) : (
            departments?.data?.map((department: any) => {
              const departmentPositions = getPositionsForDepartment(
                department.id
              );
              const isExpanded = expandedDepartments.includes(department.id);

              // Calculate employee count for the department
              const employeeCount = employees?.data
                ? employees.data.filter(
                    (user: any) => user.department?.id === department.id
                  ).length
                : 0;

              return (
                <Card key={department.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {department.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {department.description || "No description"}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {employeeCount} employees{" "}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {departmentPositions.length} positions
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreatePosition(department.id)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Position
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {departmentPositions.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <button
                          onClick={() => toggleDepartment(department.id)}
                          className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-primary transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                          Positions ({departmentPositions.length})
                        </button>

                        {isExpanded && (
                          <div className="space-y-2">
                            {departmentPositions.map((position: any) => (
                              <div
                                key={position.id}
                                className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                              >
                                <div>
                                  <p className="font-medium">
                                    {position.title}
                                  </p>
                                  {position.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {position.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPosition(position)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeletePosition(position)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {departments && departments.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: departments.totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === departments.totalPages ||
                  Math.abs(page - currentPage) <= 2
              )
              .map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </Fragment>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === departments.totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Department Create Dialog */}
        <Dialog
          open={createDeptDialogOpen}
          onOpenChange={setCreateDeptDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to organize your employees.
              </DialogDescription>
            </DialogHeader>
            <Form {...deptForm}>
              <form
                onSubmit={deptForm.handleSubmit(handleCreateDepartment)}
                className="space-y-4"
              >
                <FormField
                  control={deptForm.control}
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
                  control={deptForm.control}
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
                      setCreateDeptDialogOpen(false);
                      deptForm.reset();
                    }}
                    disabled={isCreatingDept}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingDept}>
                    {isCreatingDept ? (
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

        {/* Department Edit Dialog */}
        <Dialog open={editDeptDialogOpen} onOpenChange={setEditDeptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Make changes to the department information.
              </DialogDescription>
            </DialogHeader>
            <Form {...deptForm}>
              <form
                onSubmit={deptForm.handleSubmit(handleUpdateDepartment)}
                className="space-y-4"
              >
                <FormField
                  control={deptForm.control}
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
                  control={deptForm.control}
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
                      setEditDeptDialogOpen(false);
                      setSelectedDepartment(null);
                      deptForm.reset();
                    }}
                    disabled={isUpdatingDept}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingDept}>
                    {isUpdatingDept && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Department Delete Dialog */}
        <Dialog
          open={deleteDeptDialogOpen}
          onOpenChange={setDeleteDeptDialogOpen}
        >
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
                  setDeleteDeptDialogOpen(false);
                  setSelectedDepartment(null);
                }}
                disabled={isDeletingDept}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDepartmentConfirm}
                disabled={isDeletingDept}
              >
                {isDeletingDept && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Position Create Dialog */}
        <Dialog
          open={createPosDialogOpen}
          onOpenChange={setCreatePosDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
              <DialogDescription>
                Add a new position to this department.
              </DialogDescription>
            </DialogHeader>
            <Form {...posForm}>
              <form
                onSubmit={posForm.handleSubmit(handleCreatePositionSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={posForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Manager, Developer, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={posForm.control}
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
                      setCreatePosDialogOpen(false);
                      posForm.reset();
                    }}
                    disabled={isCreatingPos}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingPos}>
                    {isCreatingPos ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Position
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Position Edit Dialog */}
        <Dialog open={editPosDialogOpen} onOpenChange={setEditPosDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription>
                Make changes to the position information.
              </DialogDescription>
            </DialogHeader>
            <Form {...posForm}>
              <form
                onSubmit={posForm.handleSubmit(handleUpdatePosition)}
                className="space-y-4"
              >
                <FormField
                  control={posForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={posForm.control}
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
                      setEditPosDialogOpen(false);
                      setSelectedPosition(null);
                      posForm.reset();
                    }}
                    disabled={isUpdatingPos}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingPos}>
                    {isUpdatingPos && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Position Delete Dialog */}
        <Dialog
          open={deletePosDialogOpen}
          onOpenChange={setDeletePosDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Position</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the position "
                {selectedPosition?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeletePosDialogOpen(false);
                  setSelectedPosition(null);
                }}
                disabled={isDeletingPos}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePositionConfirm}
                disabled={isDeletingPos}
              >
                {isDeletingPos && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Position
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
