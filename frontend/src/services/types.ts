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
    skinType: string | null;
    sensitivities: string | null;
  } | null;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  notes?: string;
  [key: string]: string | string[] | undefined;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  sensitivities?: string;
  skin_type?: string;
  medical_info?: MedicalInfo;
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

