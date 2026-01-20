import { apiClient } from './client';
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

