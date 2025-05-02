import { payrollApi } from "@/api/payroll/payrollApi";
import {
  CreatePayPeriodDto,
  PaginatedPayPeriodResponse,
  PayAdjustmentDto,
  PayPeriodQueryParams,
  PayPeriodWithCalculations,
  UpdatePayPeriodDto,
} from "@/api/payroll/payrollApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PayrollState {
  payPeriods: PaginatedPayPeriodResponse | null;
  currentPayPeriod: PayPeriodWithCalculations | null;
  isLoading: boolean;
  error: string | null;
  // TODO: myPayroll 추가 백엔드도 필요
}

const initialState: PayrollState = {
  payPeriods: null,
  currentPayPeriod: null,
  isLoading: false,
  error: null,
};

export const getPayPeriods = createAsyncThunk<
  PaginatedPayPeriodResponse,
  PayPeriodQueryParams | undefined,
  { rejectValue: { message: string } }
>("payroll/getPayPeriods", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getPayPeriods", isLoading: true }));
    return await payrollApi.getPayPeriods(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch pay periods";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getPayPeriods", isLoading: false }));
  }
});

export const getPayPeriodById = createAsyncThunk<
  PayPeriodWithCalculations,
  string,
  { rejectValue: { message: string } }
>("payroll/getPayPeriodById", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getPayPeriodById", isLoading: true }));
    return await payrollApi.getPayPeriod(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch pay period details";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getPayPeriodById", isLoading: false }));
  }
});

export const createPayPeriod = createAsyncThunk<
  PayPeriodWithCalculations,
  CreatePayPeriodDto,
  { rejectValue: { message: string } }
>("payroll/createPayPeriod", async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "createPayPeriod", isLoading: true }));
    const newPayPeriod = await payrollApi.createPayPeriod(data);
    dispatch(
      addAlert({ type: "success", message: "Pay period created successfully" })
    );
    // Optionally re-fetch the list or add to the state directly
    dispatch(getPayPeriods()); // Example: Re-fetch list
    return newPayPeriod;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create pay period";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "createPayPeriod", isLoading: false }));
  }
});

export const updatePayPeriod = createAsyncThunk<
  PayPeriodWithCalculations,
  { id: string; data: UpdatePayPeriodDto },
  { rejectValue: { message: string } }
>(
  "payroll/updatePayPeriod",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updatePayPeriod", isLoading: true }));
      const updatedPayPeriod = await payrollApi.updatePayPeriod(id, data);
      dispatch(
        addAlert({
          type: "success",
          message: "Pay period updated successfully",
        })
      );
      return updatedPayPeriod;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update pay period";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updatePayPeriod", isLoading: false }));
    }
  }
);

export const deletePayPeriod = createAsyncThunk<
  string, // Return the ID of the deleted pay period
  string,
  { rejectValue: { message: string } }
>("payroll/deletePayPeriod", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deletePayPeriod", isLoading: true }));
    await payrollApi.deletePayPeriod(id);
    dispatch(
      addAlert({ type: "success", message: "Pay period deleted successfully" })
    );
    return id; // Return the ID on success
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete pay period";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deletePayPeriod", isLoading: false }));
  }
});

export const calculatePayroll = createAsyncThunk<
  { message: string; data: { employeeCount: number } },
  string, // payPeriodId
  { rejectValue: { message: string } }
>("payroll/calculatePayroll", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "calculatePayroll", isLoading: true }));
    const result = await payrollApi.calculatePayroll(id);
    dispatch(addAlert({ type: "success", message: result.message }));
    // Re-fetch the current pay period to show updated calculations and status
    dispatch(getPayPeriodById(id));
    return result;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to calculate payroll";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    // Optionally re-fetch to show status reverted to DRAFT on error
    dispatch(getPayPeriodById(id));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "calculatePayroll", isLoading: false }));
  }
});

export const addAdjustment = createAsyncThunk<
  PayPeriodWithCalculations,
  PayAdjustmentDto,
  { rejectValue: { message: string } }
>("payroll/addAdjustment", async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "addAdjustment", isLoading: true }));
    const updatedPayPeriod = await payrollApi.addAdjustment(data);
    dispatch(
      addAlert({ type: "success", message: "Adjustment added successfully" })
    );
    return updatedPayPeriod;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to add adjustment";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "addAdjustment", isLoading: false }));
  }
});

export const markAsPaid = createAsyncThunk<
  PayPeriodWithCalculations,
  string, // payPeriodId
  { rejectValue: { message: string } }
>("payroll/markAsPaid", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "markAsPaid", isLoading: true }));
    const updatedPayPeriod = await payrollApi.markAsPaid(id);
    dispatch(
      addAlert({ type: "success", message: "Pay period marked as paid" })
    );
    return updatedPayPeriod;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to mark pay period as paid";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "markAsPaid", isLoading: false }));
  }
});

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
    },
    clearCurrentPayPeriod: (state) => {
      state.currentPayPeriod = null;
    },
    clearPayPeriods: (state) => {
      state.payPeriods = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPayPeriods
      .addCase(getPayPeriods.pending, (state) => {
        state.error = null;
      })
      .addCase(getPayPeriods.fulfilled, (state, action) => {
        state.payPeriods = action.payload;
      })
      .addCase(getPayPeriods.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch pay periods";
      })

      // getPayPeriodById
      .addCase(getPayPeriodById.pending, (state) => {
        state.currentPayPeriod = null;
        state.error = null;
      })
      .addCase(getPayPeriodById.fulfilled, (state, action) => {
        state.currentPayPeriod = action.payload;
      })
      .addCase(getPayPeriodById.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch pay period details";
      })

      // createPayPeriod
      .addCase(createPayPeriod.pending, (state) => {})
      .addCase(createPayPeriod.fulfilled, (state) => {})
      .addCase(createPayPeriod.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to create pay period";
      })

      // deletePayPeriod
      .addCase(deletePayPeriod.pending, (state) => {})
      .addCase(deletePayPeriod.fulfilled, (state, action) => {
        const deletedId = action.payload;
        if (state.payPeriods?.data) {
          state.payPeriods.data = state.payPeriods.data.filter(
            (pp) => pp.id !== deletedId
          );
          // Adjust pagination meta if needed
          if (state.payPeriods) {
            // Check if payPeriods exists
            state.payPeriods.total -= 1; // Use top-level 'total'
            // Recalculate totalPages
            if (state.payPeriods.limit > 0) {
              state.payPeriods.totalPages = Math.ceil(
                state.payPeriods.total / state.payPeriods.limit
              );
            } else {
              state.payPeriods.totalPages = state.payPeriods.total > 0 ? 1 : 0; // Handle limit 0 case
            }
          }
        }
        if (state.currentPayPeriod?.id === deletedId) {
          state.currentPayPeriod = null; // Clear detail view if deleted item was shown
        }
      })
      .addCase(deletePayPeriod.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete pay period";
      })

      // calculatePayroll
      .addCase(calculatePayroll.pending, (state) => {})
      .addCase(calculatePayroll.fulfilled, (state) => {})
      .addCase(calculatePayroll.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to calculate payroll";
      })

      // Matchers for updatePayPeriod, addAdjustment, markAsPaid
      .addMatcher<PayloadAction<PayPeriodWithCalculations>>(
        (action) =>
          action.type === updatePayPeriod.fulfilled.type ||
          action.type === addAdjustment.fulfilled.type ||
          action.type === markAsPaid.fulfilled.type,
        (state, action) => {
          const updatedPayPeriod = action.payload;
          state.currentPayPeriod = updatedPayPeriod; // Update detail view

          // Update item in the list if it exists
          if (state.payPeriods?.data) {
            state.payPeriods.data = state.payPeriods.data.map((pp) =>
              pp.id === updatedPayPeriod.id ? updatedPayPeriod : pp
            );
          }
        }
      )
      .addMatcher(
        (action) =>
          action.type === updatePayPeriod.pending.type ||
          action.type === addAdjustment.pending.type ||
          action.type === markAsPaid.pending.type,
        (state) => {
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type === updatePayPeriod.rejected.type ||
          action.type === addAdjustment.rejected.type ||
          action.type === markAsPaid.rejected.type,
        (state, action: PayloadAction<{ message: string } | undefined>) => {
          state.error = action.payload?.message || "Operation failed";
        }
      );
  },
});

export const { clearPayrollError, clearCurrentPayPeriod, clearPayPeriods } =
  payrollSlice.actions;

export default payrollSlice.reducer;
