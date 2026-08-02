import { Request, Response } from 'express';
import { pool } from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const metrics = {
      total_patients: 0,
      today_registrations: 0,
      today_completed: 0,
      poli_stats: [] as any[]
    };

    // Total Patients
    const patientResult = await pool.query('SELECT COUNT(*) FROM patients');
    metrics.total_patients = parseInt(patientResult.rows[0].count);

    // Today's Registrations
    const regResult = await pool.query('SELECT COUNT(*) FROM registrations WHERE visit_date = $1', [today]);
    metrics.today_registrations = parseInt(regResult.rows[0].count);

    // Today's Completed
    const compResult = await pool.query("SELECT COUNT(*) FROM registrations WHERE visit_date = $1 AND status = 'selesai'", [today]);
    metrics.today_completed = parseInt(compResult.rows[0].count);

    // Poli Stats today
    const poliResult = await pool.query(`
      SELECT p.name, COUNT(r.id) as count
      FROM poli p
      LEFT JOIN registrations r ON p.id = r.poli_id AND r.visit_date = $1
      GROUP BY p.name
    `, [today]);
    metrics.poli_stats = poliResult.rows.map(row => ({ name: row.name, count: parseInt(row.count) }));

    return (successResponse(res, metrics) as unknown) as void;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};
