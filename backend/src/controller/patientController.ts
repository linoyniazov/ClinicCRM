import { Request, Response } from 'express';
import pool  from '../db';

interface CreatePatientDto {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    sensitivities?: string;
    medical_info?: Record<string, any>;
    address?: string;
    date_of_birth?: string;
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

export async function createPatient(req: Request, res: Response): Promise<void> {
    const body = req.body as CreatePatientDto;
    let { first_name, last_name, phone, email, sensitivities, medical_info, address, date_of_birth } = body;

    try {
        first_name = first_name?.trim();
        last_name = last_name?.trim();
        phone = phone?.trim();
        email = email?.trim()?.toLowerCase();

        if (!first_name || !last_name || !phone) {
            res.status(400).json({ error: 'First name, last name, and phone are required' });
            return;
        }

        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ error: 'Invalid phone format', details: { phone } });
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Invalid email format', details: { email } });
            return;
        }

        const query = `
            INSERT INTO patients (first_name, last_name, phone, email, address, date_of_birth, sensitivities, medical_info)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            first_name, 
            last_name, 
            phone, 
            email || null, 
            address || null, 
            date_of_birth || null,
            sensitivities || null,
            medical_info || {}
        ]);
        
        res.status(201).json(result.rows[0]);

    } catch (error: any) {
        console.error('Error creating patient:', error);
        
        if (error?.code === '23505') {
            const detail = String(error?.detail || '').toLowerCase();
            const field = detail.includes('phone') ? 'phone' : detail.includes('email') ? 'email' : 'unique field';
            res.status(409).json({ error: `Duplicate ${field}: A patient with this ${field} already exists.` });
            return;
        }

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

export async function updatePatient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    
    if (!Number.isInteger(idNum) || idNum <= 0) {
        res.status(400).json({ error: 'Invalid patient id' });
        return;
    }

    const body = req.body as Partial<CreatePatientDto>;
    const updates: Record<string, any> = {};

    if (body.first_name) updates.first_name = body.first_name.trim();
    if (body.last_name) updates.last_name = body.last_name.trim();
    if (body.phone) updates.phone = body.phone.trim();
    if (body.email) updates.email = body.email.trim().toLowerCase();
    if (body.address !== undefined) updates.address = body.address;
    if (body.sensitivities !== undefined) updates.sensitivities = body.sensitivities;
    if (body.medical_info !== undefined) updates.medical_info = body.medical_info;

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
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
    } catch (error: any) {
        console.error('Error updating patient:', error);
        if (error?.code === '23505') {
             res.status(409).json({ error: 'Duplicate field value (phone or email)' });
             return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getPatientHistory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const query = `
            SELECT th.*, s.name as treatment_name 
            FROM treatment_history th
            LEFT JOIN appointments a ON th.appointment_id = a.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE th.patient_id = $1
            ORDER BY th.treatment_date DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching patient history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getPatientImages(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM patient_images WHERE patient_id = $1 ORDER BY taken_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching patient images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function uploadPatientImage(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idNum = parseInt(id, 10);

    if (!Number.isInteger(idNum) || idNum <= 0) {
        res.status(400).json({ error: 'Invalid patient id' });
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const { image_type, notes } = req.body;
    
    if (!image_type || !['before', 'after', 'progress'].includes(image_type)) {
        res.status(400).json({ error: 'Invalid image_type. Must be: before, after, or progress' });
        return;
    }

    try {
        const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [idNum]);
        if (patientCheck.rows.length === 0) {
            res.status(404).json({ error: 'Patient not found' });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const query = `
            INSERT INTO patient_images (patient_id, image_url, image_type, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            idNum,
            imageUrl,
            image_type,
            notes || null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error uploading patient image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}