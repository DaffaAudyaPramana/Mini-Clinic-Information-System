import { Request, Response } from 'express';
import { pool } from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

export const getPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = 'SELECT * FROM patients';
    const queryParams: any[] = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR nik = $2 OR no_rm = $3';
      queryParams.push(`%${search}%`, search, search);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit as string), offset);
    
    const result = await pool.query(query, queryParams);
    
    const countQuery = search 
      ? 'SELECT COUNT(*) FROM patients WHERE name ILIKE $1 OR nik = $2 OR no_rm = $3'
      : 'SELECT COUNT(*) FROM patients';
    
    const countParams = search ? [`%${search}%`, search, search] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return (successResponse(res, {
      patients: result.rows,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    }) as unknown) as void;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return (errorResponse(res, 'Patient not found', 404) as unknown) as void;
    }
    
    return (successResponse(res, result.rows[0]) as unknown) as void;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nik, name, gender, birth_date, phone, address } = req.body;
    
    // Check NIK unique
    const nikCheck = await pool.query('SELECT id FROM patients WHERE nik = $1', [nik]);
    if (nikCheck.rows.length > 0) {
      return (errorResponse(res, 'NIK already exists', 400) as unknown) as void;
    }

    // Use transaction for generating no_rm and inserting patient
    const client = await pool.connect();
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
      return (successResponse(res, result.rows[0], 'Patient created successfully', 201) as unknown) as void;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating patient:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nik, name, gender, birth_date, phone, address } = req.body;
    
    // Check NIK unique if NIK is being updated
    if (nik) {
      const nikCheck = await pool.query('SELECT id FROM patients WHERE nik = $1 AND id != $2', [nik, id]);
      if (nikCheck.rows.length > 0) {
        return (errorResponse(res, 'NIK already exists for another patient', 400) as unknown) as void;
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
    
    const result = await pool.query(updateQuery, [nik, name, gender, birth_date, phone, address, id]);
    
    if (result.rows.length === 0) {
      return (errorResponse(res, 'Patient not found', 404) as unknown) as void;
    }
    
    return (successResponse(res, result.rows[0], 'Patient updated successfully') as unknown) as void;
  } catch (error) {
    console.error('Error updating patient:', error);
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check for existing registrations before delete if restricted
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return (errorResponse(res, 'Patient not found', 404) as unknown) as void;
    }
    
    return (successResponse(res, null, 'Patient deleted successfully') as unknown) as void;
  } catch (error: any) {
    console.error('Error deleting patient:', error);
    if (error.code === '23503') { // Foreign key violation
       return (errorResponse(res, 'Cannot delete patient: Patient has existing registrations', 400) as unknown) as void;
    }
    return (errorResponse(res, 'Internal server error') as unknown) as void;
  }
};
