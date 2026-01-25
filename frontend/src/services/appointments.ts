import { apiClient } from './client';
import type { Appointment } from './types';

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get<Appointment[]>('/appointments');
  return response.data;
};

export const createAppointment = async (appointment: {
  patient_id: number;
  service_id: number;
  appointment_date: string;
  treatment_notes?: string;
}): Promise<Appointment> => {
  const response = await apiClient.post<Appointment>('/appointments', appointment);
  return response.data;
};

export const updateAppointmentStatus = async (id: number, status: 'scheduled' | 'completed' | 'canceled'): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}/status`, { status });
  return response.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await apiClient.delete(`/appointments/${id}`);
};
