import { apiClient } from './client';
import type { Service } from './types';

export interface CreateServiceDto {
  name: string;
  duration_minutes: number;
  base_price: number;
}

export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get<Service[]>('/services');
  return response.data;
};

export const createService = async (serviceData: CreateServiceDto): Promise<Service> => {
  const response = await apiClient.post<Service>('/services', serviceData);
  return response.data;
};

export const updateService = async (id: number, serviceData: Partial<CreateServiceDto>): Promise<Service> => {
  const response = await apiClient.patch<Service>(`/services/${id}`, serviceData);
  return response.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await apiClient.delete(`/services/${id}`);
};
