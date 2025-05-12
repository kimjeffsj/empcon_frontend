import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeAlert } from "@/store/uiSlice";
import { toast } from "sonner";

export const ToastNotifications = () => {
  const { alerts } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    alerts.forEach((alert) => {
      const existingToast = document.getElementById(`toast-${alert.id}`);
      if (existingToast) return;

      const toastOptions = {
        id: alert.id,
        duration: alert.type === "error" ? 6000 : 4000,
        className: "toast-notification",
        onDismiss: () => dispatch(removeAlert(alert.id)),
        onAutoClose: () => dispatch(removeAlert(alert.id)),
      };

      switch (alert.type) {
        case "success":
          toast.success(alert.message, toastOptions);
          break;
        case "error":
          toast.error(alert.message, toastOptions);
          break;
        case "warning":
          toast.warning(alert.message, toastOptions);
          break;
        case "info":
          toast.info(alert.message, toastOptions);
          break;
        default:
          toast(alert.message, toastOptions);
      }

      setTimeout(() => {
        dispatch(removeAlert(alert.id));
      }, toastOptions.duration);
    });
  }, [alerts, dispatch]);

  return null;
};
