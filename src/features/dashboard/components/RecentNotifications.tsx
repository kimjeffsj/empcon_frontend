import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { formatToVancouverTime } from "@/utils/dateUtils";
import { getNotifications } from "@/features/notifications/store/notificationsSlice";

export const RecentNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(
    (state) => state.notifications || { notifications: null, isLoading: false }
  );
  const isLoading = useAppSelector(
    (state) => state.ui.loading.getNotifications
  );

  useEffect(() => {
    dispatch(getNotifications({ limit: 5 }));
  }, [dispatch]);

  const recentNotifications = notifications?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!recentNotifications.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        새로운 알림이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-md p-4 ${
            !notification.isRead ? "bg-primary/5 border-primary/20" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            <span className="text-xs text-muted-foreground">
              {formatToVancouverTime(
                new Date(notification.createdAt),
                "MM/dd HH:mm"
              )}
            </span>
          </div>
          <p className="text-sm">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
