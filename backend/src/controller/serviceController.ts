import { Request, Response } from 'express';
import pool from '../db';

interface CreateServiceDto {
    name: string;
    duration_minutes: number;
    base_price: number;
}

export async function createService(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateServiceDto;
    const { name, duration_minutes, base_price } = body;

    try {
        if (!name || !duration_minutes || !base_price) {
            res.status(400).json({ error: 'Name, duration and price are required' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO services (name, duration_minutes, base_price) VALUES ($1, $2, $3) RETURNING *',
            [name, duration_minutes, base_price]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getServices(req: Request, res: Response): Promise<void> {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}