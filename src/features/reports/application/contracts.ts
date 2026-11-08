import type { ReportStatus } from "../domain/report";

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
}
export interface ReportDto {
  id: string;
  title: string;
  description: string;
  category: CategoryDto;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  locationPrecision: "approximate";
  createdAt: string;
  updatedAt: string;
  version: number;
}
export interface ReportEventDto {
  id: string;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  createdAt: string;
}
export interface ReportDetailDto extends ReportDto {
  events: ReportEventDto[];
}
export interface ReportListDto {
  items: ReportDto[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}
export interface StatsDto {
  total: number;
  byCategory: { name: string; count: number }[];
  byStatus: { status: ReportStatus; count: number }[];
  monthly: { month: string; count: number }[];
}
