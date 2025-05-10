import apiClient from "../client";
import {
  Notification,
  NotificationListResponse,
  NotificationQueryParams,
  CreateNotificationDto,
  MarkNotificationsReadResponse,
} from "./notificationApi.types";

export const notificationApi = {
  /**
   * 사용자의 알림 목록을 가져옵니다.
   * @param params 페이지네이션, 필터링 매개변수
   */
  getNotifications: async (params?: NotificationQueryParams) => {
    const response = await apiClient.get<NotificationListResponse>(
      "/notifications",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * 특정 알림을 읽음 상태로 표시합니다.
   * @param id 알림 ID
   */
  markAsRead: async (id: string) => {
    const response = await apiClient.put<{ message: string }>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  /**
   * 사용자의 모든 알림을 읽음 상태로 표시합니다.
   */
  markAllAsRead: async () => {
    const response = await apiClient.put<MarkNotificationsReadResponse>(
      "/notifications/read-all"
    );
    return response.data;
  },

  /**
   * 특정 알림을 삭제합니다.
   * @param id 알림 ID
   */
  deleteNotification: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/notifications/${id}`
    );
    return response.data;
  },

  /**
   * 새 알림을 전송합니다 (관리자/매니저 권한 필요).
   * @param notification 생성할 알림 데이터
   */
  sendNotification: async (notification: CreateNotificationDto) => {
    const response = await apiClient.post<{
      message: string;
      data: Notification;
    }>("/notifications/send", notification);
    return response.data.data;
  },

  /**
   * 알림 수신 설정을 업데이트합니다.
   * @param settings 알림 설정 데이터
   */
  updateNotificationSettings: async (settings: any) => {
    const response = await apiClient.put<{ message: string }>(
      "/notifications/settings",
      settings
    );
    return response.data;
  },

  /**
   * 알림 읽지 않은 갯수를 가져옵니다.
   */
  getUnreadCount: async () => {
    const response = await apiClient.get<{ count: number }>(
      "/notifications/unread-count"
    );
    return response.data.count;
  },
};
