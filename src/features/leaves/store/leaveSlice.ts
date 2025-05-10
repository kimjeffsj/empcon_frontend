import { leaveApi } from "@/api/leave/leaveApi";
import {
  LeaveRequest,
  LeaveRequestListResponse,
  LeaveRequestQueryParams,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ProcessLeaveRequestDto,
  UserLeaveBalancesResponse,
  LeaveBalanceQueryParams,
  LeaveTypeListResponse,
  LeaveBalanceListResponse,
} from "@/api/leave/leaveApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchQueryParams } from "@/api/common/commonApi.types";

interface LeavesState {
  leaveTypes: LeaveTypeListResponse | null;
  userLeaveBalances: UserLeaveBalancesResponse | null;
  leaveBalances: LeaveBalanceListResponse | null;
  leaveRequests: LeaveRequestListResponse | null;
  currentLeaveRequest: LeaveRequest | null;
  error: string | null;
}

const initialState: LeavesState = {
  leaveTypes: null,
  userLeaveBalances: null,
  leaveBalances: null,
  leaveRequests: null,
  currentLeaveRequest: null,
  error: null,
};

// Fetch Leave Types (paginated)
export const getLeaveTypes = createAsyncThunk<
  LeaveTypeListResponse, // Return the full response
  SearchQueryParams | undefined, // Accept search query params
  { rejectValue: { message: string } }
>("leaves/getLeaveTypes", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getLeaveTypes", isLoading: true }));
    return await leaveApi.getLeaveTypes(params); // Pass params
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch leave types";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getLeaveTypes", isLoading: false }));
  }
});

// Fetch Leave Balances for a specific user (summary)
export const getUserLeaveBalances = createAsyncThunk<
  UserLeaveBalancesResponse,
  { userId: string; year?: number }, // Input userId and optional year
  { rejectValue: { message: string } }
>(
  "leaves/getUserLeaveBalances",
  async ({ userId, year }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getUserLeaveBalances", isLoading: true }));
      return await leaveApi.getUserLeaveBalances(userId, year); // Use getUserLeaveBalances
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user leave balances";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getUserLeaveBalances", isLoading: false }));
    }
  }
);

// Fetch Leave Balances (general, paginated) - If needed for admin views
export const getLeaveBalances = createAsyncThunk<
  LeaveBalanceListResponse,
  LeaveBalanceQueryParams | undefined,
  { rejectValue: { message: string } }
>("leaves/getLeaveBalances", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getLeaveBalances", isLoading: true }));
    return await leaveApi.getLeaveBalances(params); // Use getLeaveBalances
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch leave balances";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getLeaveBalances", isLoading: false }));
  }
});

// Fetch Leave Requests (paginated)
export const getLeaveRequests = createAsyncThunk<
  LeaveRequestListResponse,
  LeaveRequestQueryParams | undefined,
  { rejectValue: { message: string } }
>("leaves/getLeaveRequests", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getLeaveRequests", isLoading: true }));
    return await leaveApi.getLeaveRequests(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch leave requests";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getLeaveRequests", isLoading: false }));
  }
});

// Fetch a single Leave Request by ID
export const getLeaveRequestById = createAsyncThunk<
  LeaveRequest,
  string, // id
  { rejectValue: { message: string } }
>("leaves/getLeaveRequestById", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getLeaveRequestById", isLoading: true }));
    return await leaveApi.getLeaveRequest(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch leave request details";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getLeaveRequestById", isLoading: false }));
  }
});

// Create a new Leave Request
export const createLeaveRequest = createAsyncThunk<
  LeaveRequest,
  CreateLeaveRequestDto,
  { rejectValue: { message: string } }
>("leaves/createLeaveRequest", async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "createLeaveRequest", isLoading: true }));
    const leaveRequest = await leaveApi.createLeaveRequest(data);
    dispatch(
      addAlert({
        type: "success",
        message: "Leave request created successfully",
      })
    );
    // Optionally re-fetch user balances after creation if needed
    if (data.userId) {
      dispatch(getUserLeaveBalances({ userId: data.userId }));
    }
    return leaveRequest;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create leave request";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "createLeaveRequest", isLoading: false }));
  }
});

// Update an existing Leave Request
export const updateLeaveRequest = createAsyncThunk<
  LeaveRequest,
  { id: string; data: UpdateLeaveRequestDto },
  { rejectValue: { message: string } }
>(
  "leaves/updateLeaveRequest",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updateLeaveRequest", isLoading: true }));
      const leaveRequest = await leaveApi.updateLeaveRequest(id, data);
      dispatch(
        addAlert({
          type: "success",
          message: "Leave request updated successfully",
        })
      );
      return leaveRequest;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update leave request";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updateLeaveRequest", isLoading: false }));
    }
  }
);

// Process a Leave Request (Approve/Reject)
export const processLeaveRequest = createAsyncThunk<
  LeaveRequest,
  { id: string; data: ProcessLeaveRequestDto }, // Use ProcessLeaveRequestDto
  { rejectValue: { message: string } }
>(
  "leaves/processLeaveRequest",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "processLeaveRequest", isLoading: true }));
      const leaveRequest = await leaveApi.processLeaveRequest(id, data); // Pass DTO
      const actionText = data.status === "APPROVED" ? "approved" : "rejected";
      dispatch(
        addAlert({
          type: "success",
          message: `Leave request ${actionText} successfully`,
        })
      );
      // Optionally re-fetch user balances after processing if needed
      if (leaveRequest.userId) {
        dispatch(getUserLeaveBalances({ userId: leaveRequest.userId }));
      }
      return leaveRequest;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to process leave request";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "processLeaveRequest", isLoading: false }));
    }
  }
);

// Cancel a Leave Request
export const cancelLeaveRequest = createAsyncThunk<
  LeaveRequest,
  string, // id
  { rejectValue: { message: string } }
>("leaves/cancelLeaveRequest", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "cancelLeaveRequest", isLoading: true }));
    const leaveRequest = await leaveApi.cancelLeaveRequest(id);
    dispatch(
      addAlert({
        type: "success",
        message: "Leave request cancelled successfully",
      })
    );
    // Optionally re-fetch user balances after cancellation if needed
    if (leaveRequest.userId) {
      dispatch(getUserLeaveBalances({ userId: leaveRequest.userId }));
    }
    return leaveRequest;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to cancel leave request";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "cancelLeaveRequest", isLoading: false }));
  }
});

const leavesSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
    clearCurrentLeaveRequest: (state) => {
      state.currentLeaveRequest = null;
    },
    clearLeaveTypes: (state) => {
      state.leaveTypes = null;
    },
    clearUserLeaveBalances: (state) => {
      state.userLeaveBalances = null;
    },
    clearLeaveBalances: (state) => {
      state.leaveBalances = null;
    },
    clearLeaveRequests: (state) => {
      state.leaveRequests = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getLeaveTypes
      .addCase(getLeaveTypes.pending, (state) => {
        state.error = null;
      })
      .addCase(getLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload; // Store the full response
      })
      .addCase(getLeaveTypes.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch leave types";
      })

      // getUserLeaveBalances
      .addCase(getUserLeaveBalances.pending, (state) => {
        state.error = null;
      })
      .addCase(getUserLeaveBalances.fulfilled, (state, action) => {
        state.userLeaveBalances = action.payload;
      })
      .addCase(getUserLeaveBalances.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch user leave balances";
      })

      // getLeaveBalances (General)
      .addCase(getLeaveBalances.pending, (state) => {
        state.error = null;
      })
      .addCase(getLeaveBalances.fulfilled, (state, action) => {
        state.leaveBalances = action.payload;
      })
      .addCase(getLeaveBalances.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch leave balances";
      })

      // getLeaveRequests
      .addCase(getLeaveRequests.pending, (state) => {
        state.error = null;
      })
      .addCase(getLeaveRequests.fulfilled, (state, action) => {
        state.leaveRequests = action.payload;
      })
      .addCase(getLeaveRequests.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch leave requests";
      })

      // getLeaveRequestById
      .addCase(getLeaveRequestById.pending, (state) => {
        state.error = null;
        state.currentLeaveRequest = null;
      })
      .addCase(getLeaveRequestById.fulfilled, (state, action) => {
        state.currentLeaveRequest = action.payload;
      })
      .addCase(getLeaveRequestById.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch leave request details";
      })

      // createLeaveRequest
      .addCase(createLeaveRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.currentLeaveRequest = action.payload;
        // Add to the beginning of the list if it exists and matches current filters (simplified: just add)
        if (state.leaveRequests?.data) {
          state.leaveRequests.data = [
            action.payload,
            ...state.leaveRequests.data,
          ];
          state.leaveRequests.total += 1;
          // Adjust pagination if needed, though adding to first page is common
        }
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to create leave request";
      })

      // updateLeaveRequest, processLeaveRequest, cancelLeaveRequest (Shared logic)
      .addMatcher(
        (
          action
        ): action is PayloadAction<LeaveRequest> => // Type predicate
          action.type === updateLeaveRequest.fulfilled.type ||
          action.type === processLeaveRequest.fulfilled.type ||
          action.type === cancelLeaveRequest.fulfilled.type,
        (state, action) => {
          const updatedRequest = action.payload;
          // Update in the list
          if (state.leaveRequests?.data) {
            state.leaveRequests.data = state.leaveRequests.data.map((req) =>
              req.id === updatedRequest.id ? updatedRequest : req
            );
          }
          // Update current if it matches
          if (state.currentLeaveRequest?.id === updatedRequest.id) {
            state.currentLeaveRequest = updatedRequest;
          }
        }
      )
      .addMatcher(
        (action) =>
          action.type === updateLeaveRequest.pending.type ||
          action.type === processLeaveRequest.pending.type ||
          action.type === cancelLeaveRequest.pending.type,
        (state) => {
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type === updateLeaveRequest.rejected.type ||
          action.type === processLeaveRequest.rejected.type ||
          action.type === cancelLeaveRequest.rejected.type,
        (state, action: PayloadAction<{ message: string } | undefined>) => {
          // Add type annotation for action

          state.error =
            action.payload?.message ||
            "Failed to update/process/cancel leave request";
        }
      );
  },
});

export const {
  clearLeaveError,
  clearCurrentLeaveRequest,
  clearLeaveTypes,
  clearUserLeaveBalances,
  clearLeaveBalances,
  clearLeaveRequests,
} = leavesSlice.actions;
export default leavesSlice.reducer;
