export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// VibePulse Specific Types
export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}
export interface Expert {
  id: string;
  name: string;
  avatarUrl: string;
}
export interface Ticket {
  id: string;
  viberQuery: string;
  platform: string;
  issueType: string;
  status: TicketStatus;
  expertId: string;
  createdAt: string; // ISO 8601 string
  resolvedAt?: string; // ISO 8601 string
  satisfactionScore: number; // 1-5
  expertResponse?: string;
  resolutionNotes?: string;
}
export interface DashboardMetrics {
  vibersHelped: {
    value: number;
    change: number;
  };
  avgResolutionTime: {
    value: number; // in minutes
    change: number;
  };
  satisfactionRate: {
    value: number; // percentage
    change: number;
  };
  activeExperts: {
    value: number;
    change: number;
  };
}
export interface TrendDataPoint {
  name: string;
  count: number;
}
export interface OverTimeDataPoint {
  date: string;
  created: number;
  resolved: number;
}
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}