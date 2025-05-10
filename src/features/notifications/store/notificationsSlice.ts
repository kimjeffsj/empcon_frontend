import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  NotificationListResponse,
  NotificationQueryParams,
} from "@/api/notification/notificationApi.types";
import { notificationApi } from "@/api/notification/notificationApi";
import { setLoading, addAlert } from "@/store/uiSlice";

interface NotificationsState {
  notifications: NotificationListResponse | null;
  unreadCount: number;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: null,
  unreadCount: 0,
  error: null,
};

// Notification list retrieval
export const getNotifications = createAsyncThunk<
  NotificationListResponse,
  NotificationQueryParams | undefined,
  { rejectValue: { message: string } }
>(
  "notifications/getNotifications",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ key: "getNotifications", isLoading: true }));
      return await notificationApi.getNotifications(params);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch notifications";
      dispatch(addAlert({ type: "error", message: errorMessage }));
      return rejectWithValue({ message: errorMessage });
    } finally {
      dispatch(setLoading({ key: "getNotifications", isLoading: false }));
    }
  }
);

// Retrieve unread notification count
export const getUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: { message: string } }
>("notifications/getUnreadCount", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "getUnreadCount", isLoading: true }));
    return await notificationApi.getUnreadCount();
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch unread count";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "getUnreadCount", isLoading: false }));
  }
});

// Mark notification as read
export const markAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("notifications/markAsRead", async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "markAsRead", isLoading: true }));
    await notificationApi.markAsRead(id);
    dispatch(getUnreadCount());
    return id;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to mark notification as read";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "markAsRead", isLoading: false }));
  }
});

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: { message: string } }
>("notifications/markAllAsRead", async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading({ key: "markAllAsRead", isLoading: true }));
    await notificationApi.markAllAsRead();
    dispatch(
      addAlert({ type: "success", message: "All notifications marked as read" })
    );
    dispatch(getUnreadCount());
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to mark all notifications as read";
    dispatch(addAlert({ type: "error", message: errorMessage }));
    return rejectWithValue({ message: errorMessage });
  } finally {
    dispatch(setLoading({ key: "markAllAsRead", isLoading: false }));
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getNotifications
      .addCase(getNotifications.pending, (state) => {
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to fetch notifications";
      })

      // getUnreadCount
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // markAsRead
      .addCase(markAsRead.fulfilled, (state, action) => {
        if (state.notifications?.data) {
          state.notifications.data = state.notifications.data.map(
            (notification) =>
              notification.id === action.payload
                ? { ...notification, isRead: true }
                : notification
          );
        }
        // Decrease unread notification count (API call updates the exact count, but for UI responsiveness)
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })

      // markAllAsRead
      .addCase(markAllAsRead.fulfilled, (state) => {
        if (state.notifications?.data) {
          state.notifications.data = state.notifications.data.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          );
        }
        state.unreadCount = 0;
      });
  },
});

export const { clearError, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
