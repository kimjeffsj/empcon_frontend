import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  loading: {
    [key: string]: boolean;
  };
  alerts: {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
  }[];
}

const initialState: UiState = {
  sidebarOpen: true,
  loading: {},
  alerts: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; isLoading: boolean }>
    ) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    addAlert: (
      state,
      action: PayloadAction<Omit<UiState["alerts"][0], "id">>
    ) => {
      const id = Date.now().toString();
      state.alerts.push({ ...action.payload, id });
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addAlert,
  removeAlert,
  clearAlerts,
} = uiSlice.actions;

export default uiSlice.reducer;
