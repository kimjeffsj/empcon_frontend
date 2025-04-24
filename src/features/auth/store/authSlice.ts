import { authApi } from "@/api/auth/authApi";
import { AuthResponse, LoginCredentials, User } from "@/api/auth/authApi.types";
import { addAlert, setLoading } from "@/store/uiSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const getRefreshToken = (): string | null =>
  localStorage.getItem("refreshToken");

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

      // Store both Access Token and Refresh Token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      } else {
        console.warn("Refresh token not received during login.");
        localStorage.removeItem("refreshToken");
      }

      dispatch(addAlert({ type: "success", message: "Login successful" }));

      // Contains user, token, refreshToken
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to login";
      dispatch(addAlert({ type: "error", message: errorMessage }));

      // Clear tokens on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

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
  const token = localStorage.getItem("token");
  if (!token) {
    return rejectWithValue({ message: "No token found" });
  }

  try {
    dispatch(setLoading({ key: "getCurrentUser", isLoading: true }));
    return await authApi.getCurrentUser();
  } catch (error: any) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

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
  void, // Return type on success (nothing needed)
  void, // Argument type (none needed)
  { rejectValue: { message: string } } // Type for rejectWithValue payload
>("auth/logout", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "logout", isLoading: true }));

    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }

    // Always clear local tokens regardless of API call success/failure
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    dispatch(addAlert({ type: "info", message: "You have been logged out." }));
    return;
  } catch (error: any) {
    // Even if backend logout fails, proceed with client-side logout
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    const errorMessage =
      error.response?.data?.message ||
      "Server logout failed, logged out locally.";
    dispatch(addAlert({ type: "warning", message: errorMessage }));
    // Reject to potentially signal an issue, but client state is cleared
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
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      state.user = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please log in again.";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Login failed";
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;

        if (action.payload?.message !== "No token found") {
          state.error = action.payload?.message || "Failed to verify session";
        }
      })

      // Logout Thunk
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export const { clearError, handleLogoutOnTokenFailure } = authSlice.actions;
export default authSlice.reducer;
