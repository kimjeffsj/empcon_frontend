import { departmentApi } from "@/api/department/departmentApi";
import {
  CreateDepartmentDto,
  Department,
  DepartmentListResponse,
  DepartmentUserResponse,
  UpdateDepartmentDto,
} from "@/api/department/department.types.ts";
import { SearchQueryParams } from "@/api/common/commonApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface DepartmentState {
  departments: DepartmentListResponse | null;
  currentDepartment: Department | null;
  currentDepartmentUsers: DepartmentUserResponse | null; // Store users for the current department view
  error: string | null;
}

const initialState: DepartmentState = {
  departments: null,
  currentDepartment: null,
  currentDepartmentUsers: null,
  error: null,
};

// Async Thunks

export const getDepartments = createAsyncThunk<
  DepartmentListResponse,
  SearchQueryParams | undefined,
  { rejectValue: { message: string } }
>(
  "departments/getDepartments",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getDepartments", isLoading: true }));
      return await departmentApi.getDepartments(params);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch departments";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getDepartments", isLoading: false }));
    }
  }
);

export const getDepartmentById = createAsyncThunk<
  Department,
  string,
  { rejectValue: { message: string } }
>(
  "departments/getDepartmentById",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getDepartmentById", isLoading: true }));
      return await departmentApi.getDepartment(id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch department details";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getDepartmentById", isLoading: false }));
    }
  }
);

export const createDepartment = createAsyncThunk<
  Department,
  CreateDepartmentDto,
  { rejectValue: { message: string } }
>(
  "departments/createDepartment",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "createDepartment", isLoading: true }));
      const newDepartment = await departmentApi.createDepartment(data);
      dispatch(
        addAlert({
          type: "success",
          message: "Department created successfully",
        })
      );
      // Re-fetch the list to include the new department and update pagination
      dispatch(getDepartments());
      return newDepartment;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create department";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "createDepartment", isLoading: false }));
    }
  }
);

export const updateDepartment = createAsyncThunk<
  Department,
  { id: string; data: UpdateDepartmentDto },
  { rejectValue: { message: string } }
>(
  "departments/updateDepartment",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updateDepartment", isLoading: true }));
      const updatedDepartment = await departmentApi.updateDepartment(id, data);
      dispatch(
        addAlert({
          type: "success",
          message: "Department updated successfully",
        })
      );
      return updatedDepartment;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update department";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updateDepartment", isLoading: false }));
    }
  }
);

export const deleteDepartment = createAsyncThunk<
  string, // Return the ID of the deleted department
  string,
  { rejectValue: { message: string } }
>("departments/deleteDepartment", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deleteDepartment", isLoading: true }));
    await departmentApi.deleteDepartment(id);
    dispatch(
      addAlert({ type: "success", message: "Department deleted successfully" })
    );
    return id; // Return the ID on success
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete department";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deleteDepartment", isLoading: false }));
  }
});

export const getDepartmentUsers = createAsyncThunk<
  DepartmentUserResponse,
  string, // departmentId
  { rejectValue: { message: string } }
>(
  "departments/getDepartmentUsers",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getDepartmentUsers", isLoading: true }));
      // Assuming getDepartmentUsers API call returns { message, data, total }
      const response = await departmentApi.getDepartmentUsers(id);
      // Construct the DepartmentUserResponse object
      return {
        message: response.message, // Assuming message is directly on response
        data: response.data, // Assuming data is directly on response
        total: response.total, // Assuming total is directly on response
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch department users";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getDepartmentUsers", isLoading: false }));
    }
  }
);

// Department Slice

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
      state.currentDepartmentUsers = null; // Also clear users when clearing department
    },
    clearDepartments: (state) => {
      state.departments = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getDepartments
      .addCase(getDepartments.pending, (state) => {
        state.error = null;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch departments";
      })

      // getDepartmentById
      .addCase(getDepartmentById.pending, (state) => {
        state.currentDepartment = null; // Clear previous detail view
        state.currentDepartmentUsers = null; // Clear users as well
        state.error = null;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch department details";
      })

      // createDepartment (Handled by re-fetching list in thunk)
      .addCase(createDepartment.pending, (state) => {})
      .addCase(createDepartment.fulfilled, (state) => {})
      .addCase(createDepartment.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to create department";
      })

      // updateDepartment
      .addCase(updateDepartment.pending, (state) => {
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const updatedDepartment = action.payload;
        state.currentDepartment = updatedDepartment; // Update detail view

        // Update item in the list if it exists
        if (state.departments?.data) {
          state.departments.data = state.departments.data.map((dept) =>
            dept.id === updatedDepartment.id ? updatedDepartment : dept
          );
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to update department";
      })

      // deleteDepartment
      .addCase(deleteDepartment.pending, (state) => {})
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        if (state.departments?.data) {
          state.departments.data = state.departments.data.filter(
            (dept) => dept.id !== deletedId
          );
          // Adjust pagination using top-level fields
          if (state.departments) {
            state.departments.total -= 1;
            if (state.departments.limit > 0) {
              state.departments.totalPages = Math.ceil(
                state.departments.total / state.departments.limit
              );
            } else {
              state.departments.totalPages =
                state.departments.total > 0 ? 1 : 0;
            }
          }
        }
        if (state.currentDepartment?.id === deletedId) {
          state.currentDepartment = null; // Clear detail view if deleted item was shown
          state.currentDepartmentUsers = null;
        }
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete department";
      })

      // getDepartmentUsers
      .addCase(getDepartmentUsers.pending, (state) => {
        state.currentDepartmentUsers = null; // Clear previous users
        state.error = null;
      })
      .addCase(getDepartmentUsers.fulfilled, (state, action) => {
        state.currentDepartmentUsers = action.payload;
      })
      .addCase(getDepartmentUsers.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch department users";
      });
  },
});

export const {
  clearDepartmentError,
  clearCurrentDepartment,
  clearDepartments,
} = departmentSlice.actions;

export default departmentSlice.reducer;
