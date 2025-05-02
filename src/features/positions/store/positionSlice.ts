import { SearchQueryParams } from "@/api/common/commonApi.types";
import { positionApi } from "@/api/position/positionApi";
import {
  Position,
  PositionListResponse,
  PositionUserResponse,
} from "@/api/position/positionApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PositionsState {
  positions: PositionListResponse | null;
  currentPosition: Position | null;
  currentPositionUsers: PositionUserResponse | null;
  error: string | null;
}

const initialState: PositionsState = {
  positions: null,
  currentPosition: null,
  currentPositionUsers: null,
  error: null,
};

export const getPositions = createAsyncThunk<
  PositionListResponse,
  any | undefined,
  { rejectValue: { message: string } }
>("positions/getPositions", async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getPositions", isLoading: true }));

    return await positionApi.getPositions(params);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch positions";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getPositions", isLoading: false }));
  }
});

export const getPositionById = createAsyncThunk<
  Position,
  string,
  { rejectValue: { message: string } }
>("positions/getPositionById", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getPositionById", isLoading: true }));
    return await positionApi.getPosition(id);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch position";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getPositionById", isLoading: false }));
  }
});

export const createPosition = createAsyncThunk<
  Position,
  any,
  { rejectValue: { message: string } }
>(
  "positions/createPosition",
  async (positionData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "createPosition", isLoading: true }));
      const position = await positionApi.createPosition(positionData);
      dispatch(
        addAlert({ type: "success", message: "Position created successfully" })
      );
      return position;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create position";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "createPosition", isLoading: false }));
    }
  }
);

export const updatePosition = createAsyncThunk<
  Position,
  { id: string; data: any },
  { rejectValue: { message: string } }
>(
  "positions/updatePosition",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "updatePosition", isLoading: true }));
      const position = await positionApi.updatePosition(id, data);
      dispatch(
        addAlert({ type: "success", message: "Position updated successfully" })
      );
      return position;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update position";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "updatePosition", isLoading: false }));
    }
  }
);

export const getPositionUsers = createAsyncThunk<
  PositionUserResponse,
  { id: string; params?: SearchQueryParams },
  { rejectValue: { message: string } }
>(
  "positions/getPositionUsers",
  async ({ id, params }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getPositionUsers", isLoading: true }));
      const usersResponse = await positionApi.getPositionUsers(id, params);

      return usersResponse;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch position users";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getPositionUsers", isLoading: false }));
    }
  }
);

export const deletePosition = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("positions/deletePosition", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "deletePosition", isLoading: true }));

    await positionApi.deletePosition(id);
    dispatch(
      addAlert({
        type: "success",
        message: "Position deleted successfully",
      })
    );

    return id;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete position";
    dispatch(addAlert({ type: "error", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "deletePosition", isLoading: false }));
  }
});

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    clearPositionError: (state) => {
      state.error = null;
    },
    clearCurrentPosition: (state) => {
      state.currentPosition = null;
    },
    clearCurrentPositionUsers: (state) => {
      state.currentPositionUsers = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPositions
      .addCase(getPositions.pending, (state) => {
        state.error = null;
      })
      .addCase(getPositions.fulfilled, (state, action) => {
        state.positions = action.payload;
        state.error = null;
      })
      .addCase(getPositions.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch positions";
      })

      // getPositionById
      .addCase(getPositionById.pending, (state) => {
        state.error = null;
      })
      .addCase(getPositionById.fulfilled, (state, action) => {
        state.currentPosition = action.payload;
        state.error = null;
      })
      .addCase(getPositionById.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch position";
      })

      // createPosition
      .addCase(createPosition.fulfilled, (state) => {})

      // updatePosition
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.currentPosition = action.payload;
      })

      // getPositionUsers
      .addCase(getPositionUsers.pending, (state) => {
        state.currentPositionUsers = null;
        state.error = null;
      })
      .addCase(getPositionUsers.fulfilled, (state, action) => {
        state.currentPositionUsers = action.payload;
        state.error = null;
      })
      .addCase(getPositionUsers.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch position users";
      })

      // deletePosition
      .addCase(deletePosition.fulfilled, (state, action) => {
        if (state.positions && state.positions.data) {
          state.positions.data = state.positions.data.filter(
            (position) => position.id !== action.payload
          );
        }
      });
  },
});

export const {
  clearPositionError,
  clearCurrentPosition,
  clearCurrentPositionUsers,
} = positionsSlice.actions;
export default positionsSlice.reducer;
