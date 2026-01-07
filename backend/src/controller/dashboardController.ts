import { Request, Response } from 'express';
import pool from '../db';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
        const now = new Date();
        
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1); 
        
        const nextWeekEnd = new Date(todayStart);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

        const todayResult = await pool.query(
            `SELECT COUNT(*) as count 
             FROM appointments 
             WHERE appointment_date >= $1 
             AND appointment_date < $2 
             AND status = 'scheduled'`,
            [todayStart, todayEnd]
        );
        const appointmentsToday = parseInt(todayResult.rows[0].count, 10);

        const upcomingResult = await pool.query(
            `SELECT COUNT(*) as count 
             FROM appointments 
             WHERE appointment_date >= $1 
             AND appointment_date < $2 
             AND status = 'scheduled'`,
            [todayStart, nextWeekEnd]
        );
        const upcomingAppointments = parseInt(upcomingResult.rows[0].count, 10);

        const revenueResult = await pool.query(
            `SELECT COALESCE(SUM(s.base_price), 0) as total_revenue
             FROM appointments a
             JOIN services s ON a.service_id = s.id
             WHERE a.appointment_date >= $1 
             AND a.appointment_date < $2 
             AND a.status = 'scheduled'`,
            [todayStart, nextWeekEnd]
        );
        const estimatedRevenue = parseFloat(revenueResult.rows[0].total_revenue) || 0;

        const nextClientResult = await pool.query(
            `SELECT 
                a.id,
                a.appointment_date,
                p.id as patient_id,
                p.first_name,
                p.last_name,
                p.skin_type,
                p.sensitivities,
                s.name as service_name
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             JOIN services s ON a.service_id = s.id
             WHERE a.appointment_date >= $1 
             AND a.status = 'scheduled'
             ORDER BY a.appointment_date ASC
             LIMIT 1`,
            [now]
        );

        let nextClient = null;
        if (nextClientResult.rows.length > 0) {
            const next = nextClientResult.rows[0];
            const appointmentDate = new Date(next.appointment_date);
            
            const timeString = appointmentDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            
            nextClient = {
                id: next.id,
                name: `${next.first_name} ${next.last_name}`,
                service: next.service_name,
                time: timeString,
                patientId: next.patient_id,
                skinType: next.skin_type || null,
                sensitivities: next.sensitivities || null
            };
        }

        res.json({
            appointmentsToday,
            upcomingAppointments,
            estimatedRevenue,
            nextClient
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

