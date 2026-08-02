"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getPatients = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const getPatients = async (req, res) => {
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let query = 'SELECT * FROM patients';
        const queryParams = [];
        if (search) {
            query += ' WHERE name ILIKE $1 OR nik = $2 OR no_rm = $3';
            queryParams.push(`%${search}%`, search, search);
        }
        query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(parseInt(limit), offset);
        const result = await db_1.pool.query(query, queryParams);
        const countQuery = search
            ? 'SELECT COUNT(*) FROM patients WHERE name ILIKE $1 OR nik = $2 OR no_rm = $3'
            : 'SELECT COUNT(*) FROM patients';
        const countParams = search ? [`%${search}%`, search, search] : [];
        const countResult = await db_1.pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        return (0, response_1.successResponse)(res, {
            patients: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching patients:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getPatients = getPatients;
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Patient not found', 404);
        }
        return (0, response_1.successResponse)(res, result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching patient:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getPatientById = getPatientById;
const createPatient = async (req, res) => {
    try {
        const { nik, name, gender, birth_date, phone, address } = req.body;
        // Check NIK unique
        const nikCheck = await db_1.pool.query('SELECT id FROM patients WHERE nik = $1', [nik]);
        if (nikCheck.rows.length > 0) {
            return (0, response_1.errorResponse)(res, 'NIK already exists', 400);
        }
        // Use transaction for generating no_rm and inserting patient
        const client = await db_1.pool.connect();
        try {
            await client.query('BEGIN');
            const noRmResult = await client.query('SELECT generate_no_rm()');
            const no_rm = noRmResult.rows[0].generate_no_rm;
            const insertQuery = `
        INSERT INTO patients (no_rm, nik, name, gender, birth_date, phone, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
            const result = await client.query(insertQuery, [no_rm, nik, name, gender, birth_date, phone, address]);
            await client.query('COMMIT');
            return (0, response_1.successResponse)(res, result.rows[0], 'Patient created successfully', 201);
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error creating patient:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.createPatient = createPatient;
const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nik, name, gender, birth_date, phone, address } = req.body;
        // Check NIK unique if NIK is being updated
        if (nik) {
            const nikCheck = await db_1.pool.query('SELECT id FROM patients WHERE nik = $1 AND id != $2', [nik, id]);
            if (nikCheck.rows.length > 0) {
                return (0, response_1.errorResponse)(res, 'NIK already exists for another patient', 400);
            }
        }
        const updateQuery = `
      UPDATE patients
      SET nik = COALESCE($1, nik),
          name = COALESCE($2, name),
          gender = COALESCE($3, gender),
          birth_date = COALESCE($4, birth_date),
          phone = COALESCE($5, phone),
          address = COALESCE($6, address)
      WHERE id = $7
      RETURNING *
    `;
        const result = await db_1.pool.query(updateQuery, [nik, name, gender, birth_date, phone, address, id]);
        if (result.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Patient not found', 404);
        }
        return (0, response_1.successResponse)(res, result.rows[0], 'Patient updated successfully');
    }
    catch (error) {
        console.error('Error updating patient:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.updatePatient = updatePatient;
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        // Check for existing registrations before delete if restricted
        const result = await db_1.pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Patient not found', 404);
        }
        return (0, response_1.successResponse)(res, null, 'Patient deleted successfully');
    }
    catch (error) {
        console.error('Error deleting patient:', error);
        if (error.code === '23503') { // Foreign key violation
            return (0, response_1.errorResponse)(res, 'Cannot delete patient: Patient has existing registrations', 400);
        }
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.deletePatient = deletePatient;
