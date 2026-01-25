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

export async function updateService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const body = req.body as Partial<CreateServiceDto>;
    const { name, duration_minutes, base_price } = body;

    try {
        if (!name && !duration_minutes && base_price === undefined) {
            res.status(400).json({ error: 'At least one field is required for update' });
            return;
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (duration_minutes !== undefined) {
            updates.push(`duration_minutes = $${paramIndex++}`);
            values.push(duration_minutes);
        }
        if (base_price !== undefined) {
            updates.push(`base_price = $${paramIndex++}`);
            values.push(base_price);
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}