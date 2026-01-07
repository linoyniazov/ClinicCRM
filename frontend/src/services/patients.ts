import { apiClient } from './client';
import type { Patient } from './api/types';

export const getPatients = async (): Promise<Patient[]> => {
  const response = await apiClient.get<Patient[]>('/api/patients');
  return response.data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> => {
  const response = await apiClient.post<Patient>('/api/patients', patient);
  return response.data;
};

