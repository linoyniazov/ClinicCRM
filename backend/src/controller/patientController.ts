import { Request, Response } from 'express';
import pool from '../db';

// DTO for create patient request body
interface CreatePatientDto {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    sensitivities?: string;
    medical_info?: Record<string, any>;
}

export async function createPatient(req: Request, res: Response): Promise<void> {
    const body = req.body as CreatePatientDto;
    const { first_name, last_name, phone, email, sensitivities, medical_info } = body;
    try {
        // basic required fields check
        if (!first_name || !last_name || !phone) {
            res.status(400).json({ error: 'first_name, last_name and phone are required' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO patients (first_name, last_name, phone, email, sensitivities, medical_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, phone, email ?? null, sensitivities ?? null, medical_info ?? {}]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating patient:', error);
        // unique violations / validation
        if ((error as any)?.code === '23505') {
            const detail = String((error as any)?.detail || '').toLowerCase();
            const field = detail.includes('phone') ? 'phone' : detail.includes('email') ? 'email' : 'unique field';
            res.status(409).json({ error: `Duplicate ${field}` });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getPatients(req: Request, res: Response): Promise<void> {
    try {
        const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

