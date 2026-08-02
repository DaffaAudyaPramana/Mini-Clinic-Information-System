"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegistrationStatus = exports.createRegistration = exports.getRegistrations = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getRegistrations = async (req, res) => {
    try {
        const { date, status } = req.query;
        let query = `
      SELECT r.*, 
             p.name as patient_name, p.no_rm, 
             po.name as poli_name, 
             d.specialization, u.name as doctor_name
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      JOIN poli po ON r.poli_id = po.id
      JOIN doctors d ON r.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
        const queryParams = [];
        if (date) {
            queryParams.push(date);
            query += ` AND r.visit_date = $${queryParams.length}`;
        }
        if (status) {
            queryParams.push(status);
            query += ` AND r.status = $${queryParams.length}`;
        }
        query += ' ORDER BY r.created_at DESC';
        const result = await db_1.pool.query(query, queryParams);
        return (0, response_1.successResponse)(res, result.rows);
    }
    catch (error) {
        console.error('Error fetching registrations:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getRegistrations = getRegistrations;
const createRegistration = async (req, res) => {
    try {
        const { patient_id, doctor_id, poli_id, payment_type, complaint } = req.body;
        const insertQuery = `
      INSERT INTO registrations (patient_id, doctor_id, poli_id, payment_type, complaint)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await db_1.pool.query(insertQuery, [patient_id, doctor_id, poli_id, payment_type, complaint]);
        return (0, response_1.successResponse)(res, result.rows[0], 'Registration created successfully', 201);
    }
    catch (error) {
        console.error('Error creating registration:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.createRegistration = createRegistration;
const updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updateQuery = `
      UPDATE registrations
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
        const result = await db_1.pool.query(updateQuery, [status, id]);
        if (result.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Registration not found', 404);
        }
        return (0, response_1.successResponse)(res, result.rows[0], 'Registration status updated successfully');
    }
    catch (error) {
        console.error('Error updating registration status:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.updateRegistrationStatus = updateRegistrationStatus;
