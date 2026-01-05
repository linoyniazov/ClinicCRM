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

    const updates: Record<string, any> = {};
    if (typeof body.first_name === 'string') updates.first_name = body.first_name.trim();
    if (typeof body.last_name === 'string') updates.last_name = body.last_name.trim();
    if (typeof body.phone === 'string') updates.phone = body.phone.trim();
    if (typeof body.email === 'string') updates.email = body.email.trim().toLowerCase();
    if (body.sensitivities !== undefined) updates.sensitivities = body.sensitivities;
    if (body.medical_info !== undefined) updates.medical_info = body.medical_info;

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    if (updates.phone) {
        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(updates.phone)) {
            res.status(400).json({ error: 'Invalid phone format', details: { phone: updates.phone } });
            return;
        }
    }
    if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
            res.status(400).json({ error: 'Invalid email format', details: { email: updates.email } });
            return;
        }
    }
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
    }
    values.push(idNum);

    const sql = `UPDATE patients SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;

    try {
        const result = await pool.query(sql, values);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Patient not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
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
