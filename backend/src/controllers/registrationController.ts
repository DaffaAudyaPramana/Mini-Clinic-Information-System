import { Request, Response } from 'express';
import { pool } from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
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
    
    const insertQuery = `
      INSERT INTO registrations (patient_id, doctor_id, poli_id, payment_type, complaint)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [patient_id, doctor_id, poli_id, payment_type, complaint]);
    return (successResponse(res, result.rows[0], 'Registration created successfully', 201) as unknown) as void;
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
