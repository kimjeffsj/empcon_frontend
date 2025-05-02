import { authApi } from "@/api/auth/authApi";
import { AuthResponse, LoginCredentials, User } from "@/api/auth/authApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: { message: string } }
>(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "login", isLoading: true }));
      const response = await authApi.login(credentials);

      dispatch(addAlert({ type: "success", message: "Login successful" }));

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to login";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      return rejectWithValue(error.response?.data || { message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "login", isLoading: false }));
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: { message: string } }
>("auth/getCurrentUser", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getCurrentUser", isLoading: true }));
    return await authApi.getCurrentUser();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || {
        message: "Failed to fetch user information",
      }
    );
  } finally {
    dispatch(setLoading({ key: "getCurrentUser", isLoading: false }));
  }
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: { message: string } }
>("auth/logout", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "logout", isLoading: true }));

    await authApi.logout();

    dispatch(addAlert({ type: "info", message: "You have been logged out." }));
    return;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Server logout failed, logged out locally.";

    dispatch(addAlert({ type: "warning", message: errorMessage }));

    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "logout", isLoading: false }));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    // Action to handle logout initiated by token refresh failure
    handleLogoutOnTokenFailure: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please log in again.";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Login failed";
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {})
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Failed to verify session";
      })

      // Logout Thunk
      .addCase(logoutThunk.pending, (state) => {})
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export const { clearError, handleLogoutOnTokenFailure } = authSlice.actions;
export default authSlice.reducer;
