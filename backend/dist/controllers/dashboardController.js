"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getDashboardMetrics = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const metrics = {
            total_patients: 0,
            today_registrations: 0,
            today_completed: 0,
            poli_stats: []
        };
        // Total Patients
        const patientResult = await db_1.pool.query('SELECT COUNT(*) FROM patients');
        metrics.total_patients = parseInt(patientResult.rows[0].count);
        // Today's Registrations
        const regResult = await db_1.pool.query('SELECT COUNT(*) FROM registrations WHERE visit_date = $1', [today]);
        metrics.today_registrations = parseInt(regResult.rows[0].count);
        // Today's Completed
        const compResult = await db_1.pool.query("SELECT COUNT(*) FROM registrations WHERE visit_date = $1 AND status = 'selesai'", [today]);
        metrics.today_completed = parseInt(compResult.rows[0].count);
        // Poli Stats today
        const poliResult = await db_1.pool.query(`
      SELECT p.name, COUNT(r.id) as count
      FROM poli p
      LEFT JOIN registrations r ON p.id = r.poli_id AND r.visit_date = $1
      GROUP BY p.name
    `, [today]);
        metrics.poli_stats = poliResult.rows.map(row => ({ name: row.name, count: parseInt(row.count) }));
        return (0, response_1.successResponse)(res, metrics);
    }
    catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
