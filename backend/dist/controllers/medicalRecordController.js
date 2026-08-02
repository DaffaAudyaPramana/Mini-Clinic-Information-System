"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientHistory = exports.createMedicalRecord = void 0;
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const createMedicalRecord = async (req, res) => {
    try {
        const { registration_id, subjective, blood_pressure, temperature, weight, height, diagnosis, treatment_plan, actions, // array of { action_name, notes }
        prescription_items // array of { medicine_name, dosage, quantity, instructions }
         } = req.body;
        // Check if registration exists and is in correct state
        const regResult = await db_1.pool.query('SELECT * FROM registrations WHERE id = $1', [registration_id]);
        if (regResult.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Registration not found', 404);
        }
        const client = await db_1.pool.connect();
        try {
            await client.query('BEGIN');
            // 1. Create Medical Record (SOAP)
            const recordQuery = `
        INSERT INTO medical_records (
          registration_id, subjective, blood_pressure, temperature, weight, height, diagnosis, treatment_plan
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
            const recordResult = await client.query(recordQuery, [
                registration_id, subjective, blood_pressure, temperature, weight, height, diagnosis, treatment_plan
            ]);
            const recordId = recordResult.rows[0].id;
            // 2. Insert Medical Actions if any
            if (actions && Array.isArray(actions) && actions.length > 0) {
                for (const action of actions) {
                    await client.query('INSERT INTO medical_actions (medical_record_id, action_name, notes) VALUES ($1, $2, $3)', [recordId, action.action_name, action.notes]);
                }
            }
            // 3. Insert Prescriptions if any
            if (prescription_items && Array.isArray(prescription_items) && prescription_items.length > 0) {
                const presResult = await client.query('INSERT INTO prescriptions (medical_record_id) VALUES ($1) RETURNING *', [recordId]);
                const presId = presResult.rows[0].id;
                for (const item of prescription_items) {
                    await client.query('INSERT INTO prescription_items (prescription_id, medicine_name, dosage, quantity, instructions) VALUES ($1, $2, $3, $4, $5)', [presId, item.medicine_name, item.dosage, item.quantity, item.instructions]);
                }
            }
            // 4. Update Registration status to 'selesai'
            await client.query("UPDATE registrations SET status = 'selesai' WHERE id = $1", [registration_id]);
            // Update Queue status to 'selesai'
            await client.query("UPDATE queues SET status = 'selesai' WHERE registration_id = $1", [registration_id]);
            await client.query('COMMIT');
            return (0, response_1.successResponse)(res, { medical_record_id: recordId }, 'Medical record created successfully', 201);
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
        console.error('Error creating medical record:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.createMedicalRecord = createMedicalRecord;
const getPatientHistory = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const query = `
      SELECT 
        mr.id as record_id, mr.subjective, mr.diagnosis, mr.treatment_plan, mr.created_at,
        r.visit_date, r.complaint,
        po.name as poli_name,
        d.specialization, u.name as doctor_name
      FROM medical_records mr
      JOIN registrations r ON mr.registration_id = r.id
      JOIN poli po ON r.poli_id = po.id
      JOIN doctors d ON r.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE r.patient_id = $1
      ORDER BY r.visit_date DESC
    `;
        const result = await db_1.pool.query(query, [patient_id]);
        return (0, response_1.successResponse)(res, result.rows);
    }
    catch (error) {
        console.error('Error fetching patient history:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error');
    }
};
exports.getPatientHistory = getPatientHistory;
