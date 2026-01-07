import { apiClient } from './api/client';
import type { Appointment } from './api/types';

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get<Appointment[]>('/api/appointments');
  return response.data;
};

export const createAppointment = async (appointment: {
  patient_id: number;
  service_id: number;
  appointment_date: string;
}): Promise<Appointment> => {
  const response = await apiClient.post<Appointment>('/api/appointments', appointment);
  return response.data;
};

