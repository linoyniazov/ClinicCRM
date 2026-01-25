import { Request, Response } from 'express';
import pool from '../db';

interface CreateAppointmentDto {
    patient_id: number;
    service_id: number;
    appointment_date: string;
    treatment_notes?: string;
}

export async function createAppointment(req: Request, res: Response): Promise<void> {
    const { patient_id, service_id, appointment_date, treatment_notes } = req.body as CreateAppointmentDto;

    try {
        if (!patient_id || !service_id || !appointment_date) {
            res.status(400).json({ error: 'Patient, Service and Date are required' });
            return;
        }

        const result = await pool.query(
            `INSERT INTO appointments (patient_id, service_id, appointment_date, treatment_notes) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [patient_id, service_id, appointment_date, treatment_notes || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getAppointments(req: Request, res: Response): Promise<void> {
    try {
        const query = `
            SELECT 
                a.id, 
                a.appointment_date, 
                a.status,
                a.treatment_notes,
                a.patient_id,
                a.service_id,
                p.first_name, 
                p.last_name, 
                p.phone,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                s.name as service_name, 
                s.duration_minutes, 
                s.base_price
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN services s ON a.service_id = s.id
            ORDER BY a.appointment_date ASC
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateAppointmentStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body; // 'scheduled', 'completed', 'canceled'

    try {
        const result = await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteAppointment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM appointments WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}