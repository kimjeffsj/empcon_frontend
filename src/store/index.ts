import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// import Reducers
import authReducer from "@/features/auth/store/authSlice";
import uiReducer from "@/store/uiSlice";
import schedulesReducer from "@/features/schedules/store/schedulesSlice";
import positionsReducer from "@/features/positions/store/positionSlice";
import leavesReducer from "@/features/leaves/store/leaveSlice";
import timeclocksReducer from "@/features/timeclocks/store/timeclocksSlice";
import payrollReducer from "@/features/payroll/store/payrollSlice";
import employeesReducer from "@/features/employees/store/employeesSlice";
import departmentsReducer from "@/features/departments/store/departmentsSlice";
import notificationsReducer from "@/features/notifications/store/notificationsSlice";

export const store = configureStore({
  reducer: {
    // Add reducers as features are implemented
    // employees: employeesReducer,
    // schedules: schedulesReducer,
    // etc.
    auth: authReducer,
    ui: uiReducer,
    schedules: schedulesReducer,
    positions: positionsReducer,
    leaves: leavesReducer,
    timeclocks: timeclocksReducer,
    payroll: payrollReducer,
    employees: employeesReducer,
    departments: departmentsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
