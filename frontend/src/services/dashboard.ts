import { apiClient } from './client';
import type { DashboardStats } from './api/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
  return response.data;
};

