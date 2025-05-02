import { employeeApi } from "@/api/employee/employeeApi";
import {
  Employee,
  EmployeeListResponse,
  EmployeeQueryParams,
} from "@/api/employee/employeeApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface EmployeeState {
  employees: EmployeeListResponse | null;
  currentEmployee: Employee | null;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: null,
  currentEmployee: null,
  error: null,
};

export const getEmployees = createAsyncThunk<
  EmployeeListResponse,
  EmployeeQueryParams | undefined,
  { rejectValue: { message: string } }
>("employees/getEmployees", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getEmployees", isLoading: true }));

    return await employeeApi.getEmployees(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch employees";

    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getEmployees", isLoading: false }));
  }
});

export const getEmployeeById = createAsyncThunk<
  Employee,
  string,
  { rejectValue: { message: string } }
>("employees/getEmployeeById", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getEmployeeById", isLoading: true }));

    return employeeApi.getEmployee(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch the employee by id";
    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getEmployeeById", isLoading: false }));
  }
});

export const createEmployee = createAsyncThunk<
  Employee,
  any,
  { rejectValue: { message: string } }
>(
  "employees/createEmployee",
  async (employeeData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "createEmployee", isLoading: true }));

      const employee = await employeeApi.createEmployee(employeeData);

      dispatch(
        addAlert({ type: "success", message: "Employee created successfully" })
      );
      return employee;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create employee";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading({ key: "createEmployee", isLoading: false }));
    }
  }
);

export const updateEmployee = createAsyncThunk<
  Employee,
  { id: string; data: any },
  { rejectValue: { message: string } }
>(
  "employees/updateEmployee",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updateEmployee", isLoading: true }));

      const employee = await employeeApi.updateEmployee(id, data);

      dispatch(
        addAlert({ type: "success", message: "Employee updated successfully" })
      );

      return employee;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update employee";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updateEmployee", isLoading: false }));
    }
  }
);

export const deleteEmployee = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("employees/deleteEmployee", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deleteEmployee", isLoading: true }));

    await employeeApi.deleteEmployee(id);

    dispatch(
      addAlert({ type: "success", message: "Employee deleted successfully" })
    );

    return id;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete employee";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deleteEmployee", isLoading: false }));
  }
});

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Employees
      .addCase(getEmployees.pending, (state) => {
        state.error = null;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch employees";
      })
      // Get Employee by Id
      .addCase(getEmployeeById.pending, (state) => {
        state.error = null;
      })
      .addCase(getEmployeeById.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(getEmployeeById.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch employee";
      })

      // createEmployee
      .addCase(createEmployee.fulfilled, (state) => {})

      // updateEmployee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
      })

      // deleteEmployee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        if (state.employees && state.employees.data) {
          state.employees.data = state.employees.data.filter(
            (employee) => employee.id !== action.payload
          );
        }
      });
  },
});

export const { clearEmployeeError, clearCurrentEmployee } =
  employeesSlice.actions;
export default employeesSlice.reducer;
