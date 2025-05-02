import { scheduleApi } from "@/api/schedule/scheduleApi";
import {
  BatchScheduleDto,
  CreateScheduleDto,
  Schedule,
  ScheduleListResponse,
  ScheduleQueryParams,
  UpdateScheduleDto,
} from "@/api/schedule/scheduleApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ScheduleState {
  schedules: ScheduleListResponse | null;
  currentSchedule: Schedule | null;
  error: string | null;
}

const initialState: ScheduleState = {
  schedules: null,
  currentSchedule: null,
  error: null,
};

export const getSchedules = createAsyncThunk<
  ScheduleListResponse,
  ScheduleQueryParams | undefined,
  { rejectValue: { message: string } }
>("schedules/getSchedules", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getSchedules", isLoading: true }));

    return await scheduleApi.getSchedules(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch schedules";

    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getSchedules", isLoading: false }));
  }
});

export const getUserSchedules = createAsyncThunk<
  ScheduleListResponse,
  { userId: string; params?: any },
  { rejectValue: { message: string } }
>(
  "schedules/getUserSchedules",
  async ({ userId, params }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getUserSchedules", isLoading: true }));

      return await scheduleApi.getUserSchedules(userId, params);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user schedules";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getUserSchedules", isLoading: false }));
    }
  }
);

export const getScheduleById = createAsyncThunk<
  Schedule,
  string,
  { rejectValue: { message: string } }
>("schedules/getScheduleById", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getScheduleById", isLoading: true }));

    return await scheduleApi.getSchedule(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch schedule";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getScheduleById", isLoading: false }));
  }
});

export const createSchedule = createAsyncThunk<
  Schedule,
  CreateScheduleDto,
  { rejectValue: { message: string } }
>(
  "schedules/createSchedule",
  async (scheduleData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "createSchedule", isLoading: true }));

      const schedule = await scheduleApi.createSchedule(scheduleData);

      dispatch(
        addAlert({ type: "success", message: "Schedule created successfully" })
      );
      return schedule;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create schedule";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "createSchedule", isLoading: false }));
    }
  }
);

export const createBatchSchedules = createAsyncThunk<
  { count: number },
  BatchScheduleDto,
  { rejectValue: { message: string } }
>(
  "schedules/createBatchSchedules",
  async (scheduleData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "createBatchSchedules", isLoading: true }));

      const result = await scheduleApi.createBatchSchedules(scheduleData);

      dispatch(
        addAlert({ type: "success", message: "Schedules created successfully" })
      );

      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create batch schedules";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "createBatchSchedules", isLoading: false }));
    }
  }
);

export const updateSchedule = createAsyncThunk<
  Schedule,
  { id: string; data: UpdateScheduleDto },
  { rejectValue: { message: string } }
>(
  "schedules/updateSchedule",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updateSchedule", isLoading: true }));
      const schedule = await scheduleApi.updateSchedule(id, data);
      dispatch(
        addAlert({ type: "success", message: "Schedule updated successfully" })
      );
      return schedule;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update schedule";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updateSchedule", isLoading: false }));
    }
  }
);

export const deleteSchedule = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("schedules/deleteSchedule", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deleteSchedule", isLoading: true }));
    await scheduleApi.deleteSchedule(id);
    dispatch(
      addAlert({ type: "success", message: "Schedule deleted successfully" })
    );
    return id;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete schedule";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deleteSchedule", isLoading: false }));
  }
});

const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    clearScheduleError: (state) => {
      state.error = null;
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getSchedules
      .addCase(getSchedules.pending, (state) => {
        state.error = null;
      })
      .addCase(getSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
        state.error = null;
      })
      .addCase(getSchedules.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch schedules";
      })

      // getUserSchedules
      .addCase(getUserSchedules.pending, (state) => {
        state.error = null;
      })
      .addCase(getUserSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
        state.error = null;
      })
      .addCase(getUserSchedules.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch user schedules";
      })

      // getScheduleById
      .addCase(getScheduleById.pending, (state) => {
        state.error = null;
      })
      .addCase(getScheduleById.fulfilled, (state, action) => {
        state.currentSchedule = action.payload;
        state.error = null;
      })
      .addCase(getScheduleById.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch schedule";
      })

      // createSchedule
      .addCase(createSchedule.fulfilled, (state) => {})

      // createBatchSchedules
      .addCase(createBatchSchedules.pending, (state) => {
        state.error = null;
      })
      .addCase(createBatchSchedules.fulfilled, (state, action) => {
        console.log(`Successfully created ${action.payload.count} schedules`);
      })
      .addCase(createBatchSchedules.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to create batch schedules";
      })

      // updateSchedule
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.currentSchedule = action.payload;
      })

      // deleteSchedule
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        if (state.schedules && state.schedules.data) {
          state.schedules.data = state.schedules.data.filter(
            (schedule) => schedule.id !== action.payload
          );
        }
      });
  },
});

export const { clearScheduleError, clearCurrentSchedule } =
  schedulesSlice.actions;
export default schedulesSlice.reducer;
