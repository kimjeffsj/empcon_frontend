import { timeClockApi } from "@/api/timeclock/timeClockApi";
import {
  TimeClock,
  UpdateTimeClockDto,
  TimeClockQueryParams,
  TimeClockListResponse,
} from "@/api/timeclock/timeClockApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TimeClocksState {
  timeClocks: TimeClockListResponse | null;
  currentTimeClock: TimeClock | null;
  activeTimeClock: TimeClock | null;
  error: string | null;
}

const initialState: TimeClocksState = {
  timeClocks: null,
  currentTimeClock: null,
  activeTimeClock: null,
  error: null,
};

export const getTimeClocks = createAsyncThunk<
  any,
  any | undefined,
  { rejectValue: { message: string } }
>("timeClocks/getTimeClocks", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getTimeClocks", isLoading: true }));

    return await timeClockApi.getTimeClocks(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch time clocks";
    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getTimeClocks", isLoading: false }));
  }
});

export const getTimeClock = createAsyncThunk<
  TimeClock,
  string,
  { rejectValue: { message: string } }
>("timeClocks/getTimeClock", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getTimeClock", isLoading: true }));
    return await timeClockApi.getTimeClock(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch time clock";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getTimeClock", isLoading: false }));
  }
});

export const getActiveTimeClock = createAsyncThunk<
  TimeClock | null,
  string,
  { rejectValue: { message: string } }
>(
  "timeClocks/getActiveTimeClock",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getActiveTimeClock", isLoading: true }));

      return await timeClockApi.getActiveTimeClock(userId);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch active time clock";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getActiveTimeClock", isLoading: false }));
    }
  }
);

export const getUserTimeClocks = createAsyncThunk<
  any,
  { userId: string; params?: Omit<TimeClockQueryParams, "userId"> },
  { rejectValue: { message: string } }
>(
  "timeClocks/getUserTimeClocks",
  async ({ userId, params }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getUserTimeClocks", isLoading: true }));
      return await timeClockApi.getUserTimeClocks(userId, params);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user time clocks";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getUserTimeClocks", isLoading: false }));
    }
  }
);

export const clockIn = createAsyncThunk<
  TimeClock,
  any,
  { rejectValue: { message: string } }
>("timeClocks/clockIn", async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "clockIn", isLoading: true }));

    const timeClock = await timeClockApi.clockIn(data);

    dispatch(addAlert({ type: "success", message: "Clock in successful" }));

    return timeClock;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to clock in";

    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "clockIn", isLoading: false }));
  }
});

export const clockOut = createAsyncThunk<
  TimeClock,
  { id: string; data?: any },
  { rejectValue: { message: string } }
>(
  "timeClocks/clockOut",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "clockOut", isLoading: true }));

      const timeClock = await timeClockApi.clockOut(id, data);

      dispatch(addAlert({ type: "success", message: "Clock out successful" }));

      return timeClock;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to clock out";

      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "clockOut", isLoading: false }));
    }
  }
);

export const updateTimeClock = createAsyncThunk<
  TimeClock,
  { id: string; data: UpdateTimeClockDto },
  { rejectValue: { message: string } }
>(
  "timeClocks/updateTimeClock",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updateTimeClock", isLoading: true }));
      const timeClock = await timeClockApi.updateTimeClock(id, data);
      dispatch(
        addAlert({
          type: "success",
          message: "Time clock updated successfully",
        })
      );
      return timeClock;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update time clock";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updateTimeClock", isLoading: false }));
    }
  }
);

export const deleteTimeClock = createAsyncThunk<
  string, // Return the ID of the deleted time clock
  string,
  { rejectValue: { message: string } }
>("timeClocks/deleteTimeClock", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deleteTimeClock", isLoading: true }));
    await timeClockApi.deleteTimeClock(id);
    dispatch(
      addAlert({ type: "success", message: "Time clock deleted successfully" })
    );

    return id; // Return the ID on success
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete time clock";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deleteTimeClock", isLoading: false }));
  }
});

const timeClocksSlice = createSlice({
  name: "timeClocks",
  initialState,
  reducers: {
    clearTimeClockError: (state) => {
      state.error = null;
    },
    clearCurrentTimeClock: (state) => {
      state.currentTimeClock = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getTimeClocks
      .addCase(getTimeClocks.pending, (state) => {
        state.error = null;
      })
      .addCase(getTimeClocks.fulfilled, (state, action) => {
        state.timeClocks = action.payload;
        state.error = null;
      })
      .addCase(getTimeClocks.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch time clocks";
      })

      // getTimeClock
      .addCase(getTimeClock.pending, (state) => {
        state.error = null;
        state.currentTimeClock = null; // Clear current while fetching
      })
      .addCase(getTimeClock.fulfilled, (state, action) => {
        state.currentTimeClock = action.payload;
        state.error = null;
      })
      .addCase(getTimeClock.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch time clock";
      })

      // getActiveTimeClock
      .addCase(getActiveTimeClock.pending, (state) => {
        state.error = null;
      })
      .addCase(getActiveTimeClock.fulfilled, (state, action) => {
        state.activeTimeClock = action.payload;
        state.error = null;
      })
      .addCase(getActiveTimeClock.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch active time clock";
      })

      // getUserTimeClocks
      .addCase(getUserTimeClocks.pending, (state) => {
        state.error = null;
      })
      .addCase(getUserTimeClocks.fulfilled, (state, action) => {
        state.timeClocks = action.payload; // Assuming this replaces the general list
        state.error = null;
      })
      .addCase(getUserTimeClocks.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch user time clocks";
      })

      // clockIn
      .addCase(clockIn.pending, (state) => {})
      .addCase(clockIn.fulfilled, (state, action) => {
        state.activeTimeClock = action.payload;
        // Optionally add to the beginning of the list if needed immediately
        // if (state.timeClocks && state.timeClocks.data) {
        //   state.timeClocks.data = [action.payload, ...state.timeClocks.data];
        // }
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to clock in";
      })

      // clockOut
      .addCase(clockOut.pending, (state) => {})
      .addCase(clockOut.fulfilled, (state, action) => {
        state.activeTimeClock = null;

        // Update the specific time clock entry in the list or add if not present
        if (state.timeClocks && state.timeClocks.data) {
          const index = state.timeClocks.data.findIndex(
            (tc: TimeClock) => tc.id === action.payload.id
          );
          if (index !== -1) {
            state.timeClocks.data[index] = action.payload;
          } else {
            // If clocking out creates a new record visible in the list immediately
            state.timeClocks.data = [action.payload, ...state.timeClocks.data];
          }
        }
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to clock out";
      })

      // updateTimeClock
      .addCase(updateTimeClock.pending, (state) => {})
      .addCase(updateTimeClock.fulfilled, (state, action) => {
        // Update the time clock in the list if it exists
        if (state.timeClocks && state.timeClocks.data) {
          state.timeClocks.data = state.timeClocks.data.map((tc: TimeClock) =>
            tc.id === action.payload.id ? action.payload : tc
          );
        }
        // Update current time clock if it's the one being edited
        if (
          state.currentTimeClock &&
          state.currentTimeClock.id === action.payload.id
        ) {
          state.currentTimeClock = action.payload;
        }
      })
      .addCase(updateTimeClock.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to update time clock";
      })

      // deleteTimeClock
      .addCase(deleteTimeClock.pending, (state) => {})
      .addCase(deleteTimeClock.fulfilled, (state, action) => {
        // Remove the time clock from the list
        if (state.timeClocks && state.timeClocks.data) {
          state.timeClocks.data = state.timeClocks.data.filter(
            (tc: TimeClock) => tc.id !== action.payload // action.payload is the ID
          );
          // Optionally update pagination metadata if needed
          if (state.timeClocks) {
            // Check if timeClocks exists
            state.timeClocks.total -= 1; // Use top-level 'total'
            // Recalculate totalPages
            if (state.timeClocks.limit > 0) {
              state.timeClocks.totalPages = Math.ceil(
                state.timeClocks.total / state.timeClocks.limit
              );
            } else {
              state.timeClocks.totalPages = state.timeClocks.total > 0 ? 1 : 0; // Handle limit 0 case
            }
          }
        }
        // Clear current time clock if it's the one being deleted
        if (
          state.currentTimeClock &&
          state.currentTimeClock.id === action.payload
        ) {
          state.currentTimeClock = null;
        }
      })
      .addCase(deleteTimeClock.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete time clock";
      });
  },
});

export const { clearTimeClockError, clearCurrentTimeClock } =
  timeClocksSlice.actions;
export default timeClocksSlice.reducer;
