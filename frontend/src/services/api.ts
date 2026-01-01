import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions
export interface DashboardStats {
  appointmentsToday: number;
  upcomingAppointments: number;
  estimatedRevenue: number;
  nextClient: {
    id: number;
    name: string;
    service: string;
    time: string;
    patientId: number;
  } | null;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  sensitivities?: string;
  medical_info?: Record<string, any>;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  base_price: string;
}

export interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
  first_name: string;
  last_name: string;
  phone: string;
  service_name: string;
  duration_minutes: number;
  base_price: string;
}

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
  return response.data;
};

// Patients API
export const getPatients = async (): Promise<Patient[]> => {
  const response = await apiClient.get<Patient[]>('/api/patients');
  return response.data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> => {
  const response = await apiClient.post<Patient>('/api/patients', patient);
  return response.data;
};

// Services API
export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get<Service[]>('/api/services');
  return response.data;
};

export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const response = await apiClient.post<Service>('/api/services', service);
  return response.data;
};

// Appointments API
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

export const updateAppointmentStatus = async (
  id: number,
  status: string
): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/api/appointments/${id}/status`, { status });
  return response.data;
};

export default apiClient;

