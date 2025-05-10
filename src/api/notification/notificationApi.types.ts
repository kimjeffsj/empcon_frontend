import { PaginatedResponse } from "../common/commonApi.types";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type:
    | "SCHEDULE_CHANGE"
    | "REQUEST_UPDATE"
    | "LEAVE_UPDATE"
    | "PAYROLL"
    | "GENERAL";
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationListResponse = PaginatedResponse<Notification>;

export interface NotificationQueryParams {
  page?: number | string;
  limit?: number | string;
  unreadOnly?: boolean | string;
  type?:
    | "SCHEDULE_CHANGE"
    | "REQUEST_UPDATE"
    | "LEAVE_UPDATE"
    | "PAYROLL"
    | "GENERAL";
  startDate?: string;
  endDate?: string;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type:
    | "SCHEDULE_CHANGE"
    | "REQUEST_UPDATE"
    | "LEAVE_UPDATE"
    | "PAYROLL"
    | "GENERAL";
  relatedId?: string;
}

export interface MarkNotificationsReadResponse {
  message: string;
  count: number;
}
