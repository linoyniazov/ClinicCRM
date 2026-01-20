import { apiClient } from './client';

export interface TreatmentRecord {
    id: number;
    treatment_type: string;
    treatment_date: string;
    notes: string;
    treatment_name?: string; 
}
export interface PatientImage {
    id: number;
    image_url: string;
    image_type: 'before' | 'after' | 'progress';
    taken_at: string;
    notes?: string;
}
export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    address?: string;
    date_of_birth?: string;
    sensitivities?: string;
    medical_info?: Record<string, unknown>;
    created_at?: string;
}
export interface CreatePatientDto {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    sensitivities?: string;
    medical_info?: Record<string, unknown>;
    address?: string;
    date_of_birth?: string;
}

export const getPatients = async (): Promise<Patient[]> => {
    const response = await apiClient.get<Patient[]>('/patients');
    return response.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
};

export const createPatient = async (patientData: CreatePatientDto): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/patients', patientData);
    return response.data;
};

export const getPatientHistory = async (id: string): Promise<TreatmentRecord[]> => {
    const response = await apiClient.get<TreatmentRecord[]>(`/patients/${id}/history`);
    return response.data;
};

export const getPatientImages = async (id: string): Promise<PatientImage[]> => {
    const response = await apiClient.get<PatientImage[]>(`/patients/${id}/images`);
    return response.data;
};

