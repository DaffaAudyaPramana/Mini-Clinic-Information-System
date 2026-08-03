import { Request, Response } from 'express';
import { pool } from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

export const getPoliAndDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const poliResult = await pool.query('SELECT * FROM poli ORDER BY name ASC');
    const doctorResult = await pool.query(`
      SELECT d.id, d.poli_id, d.specialization, u.name as doctor_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.is_active = true
      ORDER BY u.name ASC
    `);
    
    return (successResponse(res, {
      poli: poliResult.rows,
      doctors: doctorResult.rows
    }) as unknown) as void;
  } catch (error) {
    console.error('Error fetching poli & doctors:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;
    
    let query = `
      SELECT r.*, 
             p.name as patient_name, p.no_rm, 
             po.name as poli_name, 
             d.specialization, u.name as doctor_name,
             q.queue_number, q.status as queue_status, q.id as queue_id
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      JOIN poli po ON r.poli_id = po.id
      JOIN doctors d ON r.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN queues q ON q.registration_id = r.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    
    if (date) {
      queryParams.push(date);
      query += ` AND r.visit_date = $${queryParams.length}`;
    }
    
    if (status) {
      queryParams.push(status);
      query += ` AND r.status = $${queryParams.length}`;
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const result = await pool.query(query, queryParams);
    return (successResponse(res, result.rows) as unknown) as void;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patient_id, doctor_id, poli_id, payment_type, complaint } = req.body;

    if (!patient_id || !doctor_id || !poli_id || !payment_type) {
      return (errorResponse(res, 'Field patient_id, doctor_id, poli_id, dan payment_type wajib diisi', 400) as unknown) as void;
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Insert Registration
      const insertRegQuery = `
        INSERT INTO registrations (patient_id, doctor_id, poli_id, payment_type, complaint, status)
        VALUES ($1, $2, $3, $4, $5, 'check_in')
        RETURNING *
      `;
      const regResult = await client.query(insertRegQuery, [patient_id, doctor_id, poli_id, payment_type, complaint]);
      const registration = regResult.rows[0];

      // 2. Generate Queue Number
      const qResult = await client.query('SELECT generate_queue_number($1)', [poli_id]);
      const queue_number = qResult.rows[0].generate_queue_number;

      // 3. Insert Queue
      const insertQueueQuery = `
        INSERT INTO queues (registration_id, queue_number, status)
        VALUES ($1, $2, 'menunggu')
        RETURNING *
      `;
      const queueResult = await client.query(insertQueueQuery, [registration.id, queue_number]);

      await client.query('COMMIT');
      return (successResponse(res, {
        registration,
        queue: queueResult.rows[0],
        queue_number
      }, 'Pendaftaran kunjungan & Nomor Antrean berhasil dibuat', 201) as unknown) as void;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating registration:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateQuery = `
      UPDATE registrations
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [status, id]);
    
    if (result.rows.length === 0) {
      return (errorResponse(res, 'Registration not found', 404) as unknown) as void;
    }
    
    return (successResponse(res, result.rows[0], 'Registration status updated successfully') as unknown) as void;
  } catch (error) {
    console.error('Error updating registration status:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};
