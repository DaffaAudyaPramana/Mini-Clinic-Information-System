"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueues = exports.updateQueueStatus = exports.createQueue = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const createQueue = async (req, res) => {
    try {
        const { registration_id } = req.body;
        // Get poli_id from registration
        const regResult = await db_1.pool.query('SELECT poli_id, status FROM registrations WHERE id = $1', [registration_id]);
        if (regResult.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Registration not found', 404);
        }
        if (regResult.rows[0].status !== 'menunggu') {
            return (0, response_1.errorResponse)(res, 'Registration is already checked in or processed', 400);
        }
        const poli_id = regResult.rows[0].poli_id;
        const client = await db_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Update registration status
            await client.query("UPDATE registrations SET status = 'check_in' WHERE id = $1", [registration_id]);
            // Generate queue number
            const qResult = await client.query('SELECT generate_queue_number($1)', [poli_id]);
            const queue_number = qResult.rows[0].generate_queue_number;
            // Insert into queues
            const insertQuery = `
        INSERT INTO queues (registration_id, queue_number)
        VALUES ($1, $2)
        RETURNING *
      `;
            const result = await client.query(insertQuery, [registration_id, queue_number]);
            await client.query('COMMIT');
            return (0, response_1.successResponse)(res, result.rows[0], 'Queue created successfully', 201);
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
        console.error('Error creating queue:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.createQueue = createQueue;
const updateQueueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'menunggu', 'dipanggil', 'diperiksa', 'selesai'
        let updateQuery = 'UPDATE queues SET status = $1';
        const queryParams = [status, id];
        if (status === 'dipanggil') {
            updateQuery += ', called_at = NOW()';
        }
        updateQuery += ' WHERE id = $2 RETURNING *';
        const client = await db_1.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(updateQuery, queryParams);
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return (0, response_1.errorResponse)(res, 'Queue not found', 404);
            }
            // Sync registration status
            const registration_id = result.rows[0].registration_id;
            let regStatus = 'check_in';
            if (status === 'diperiksa')
                regStatus = 'pemeriksaan';
            if (status === 'selesai')
                regStatus = 'selesai';
            await client.query('UPDATE registrations SET status = $1 WHERE id = $2', [regStatus, registration_id]);
            await client.query('COMMIT');
            return (0, response_1.successResponse)(res, result.rows[0], 'Queue status updated successfully');
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
        console.error('Error updating queue status:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.updateQueueStatus = updateQueueStatus;
const getQueues = async (req, res) => {
    try {
        const { date, poli_id, status } = req.query;
        let query = `
      SELECT q.*, p.name as patient_name, po.name as poli_name
      FROM queues q
      JOIN registrations r ON q.registration_id = r.id
      JOIN patients p ON r.patient_id = p.id
      JOIN poli po ON r.poli_id = po.id
      WHERE 1=1
    `;
        const queryParams = [];
        if (date) {
            queryParams.push(date);
            query += ` AND q.queue_date = $${queryParams.length}`;
        }
        if (poli_id) {
            queryParams.push(poli_id);
            query += ` AND r.poli_id = $${queryParams.length}`;
        }
        if (status) {
            queryParams.push(status);
            query += ` AND q.status = $${queryParams.length}`;
        }
        query += ' ORDER BY q.created_at ASC';
        const result = await db_1.pool.query(query, queryParams);
        return (0, response_1.successResponse)(res, result.rows);
    }
    catch (error) {
        console.error('Error fetching queues:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getQueues = getQueues;
