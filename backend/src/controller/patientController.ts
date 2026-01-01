import { Request, Response } from 'express';
import pool from '../db';

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
    let { first_name, last_name, phone, email, sensitivities, medical_info } = body;
    try {
        // normalize & basic validation
        first_name = first_name?.trim();
        last_name = last_name?.trim();
        phone = phone?.trim();
        email = email?.trim()?.toLowerCase();

        if (!first_name || !last_name || !phone) {
            res.status(400).json({ error: 'first_name, last_name and phone are required' });
            return;
        }

        // optional simple format checks
        const phoneRegex = /^\+?\d{9,15}$/; // simple international digits check
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ error: 'Invalid phone format', details: { phone } });
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Invalid email format', details: { email } });
            return;
        }

        const result = await pool.query(
            'INSERT INTO patients (first_name, last_name, phone, email, sensitivities, medical_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, phone, email ?? null, sensitivities ?? null, medical_info ?? {}]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating patient:', error);
        if ((error as any)?.code === '23505') {
            const detail = String((error as any)?.detail || '').toLowerCase();
            const field = detail.includes('phone') ? 'phone' : detail.includes('email') ? 'email' : 'unique field';
            res.status(409).json({ error: `Duplicate ${field}` });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (!Number.isInteger(idNum) || idNum <= 0) {
        res.status(400).json({ error: 'Invalid patient id' });
        return;
    }

    const body = req.body as Partial<CreatePatientDto>;
    // normalize & basic validation for fields being updated
    const first_name = body.first_name?.trim();
    const last_name = body.last_name?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const sensitivities = body.sensitivities ?? null;
    const medical_info = body.medical_info ?? null;

    if (phone) {
        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ error: 'Invalid phone format', details: { phone } });
            return;
        }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Invalid email format', details: { email } });
        return;
    }
    try {
        const result = await pool.query(
            'UPDATE patients SET first_name = $1, last_name = $2, phone = $3, email = $4, sensitivities = $5, medical_info = $6 WHERE id = $7 RETURNING *',
            [first_name, last_name, phone, email, sensitivities, medical_info, idNum]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Patient not found' });
            return;
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating patient:', error);
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

export async function getPatientById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (!Number.isInteger(idNum) || idNum <= 0) {
        res.status(400).json({ error: 'Invalid patient id' });
        return;
    }
    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [idNum]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Patient not found' });
            return;
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching patient by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
