import { Router } from 'express';
import {
  createMedicalRecord,
  getPatientHistory
} from '../controllers/medicalRecordController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// Only doctors can create medical records
router.post('/', authorizeRole(['administrator', 'dokter']), createMedicalRecord);

// Doctors and admins can view patient history
router.get('/patient/:patient_id', authorizeRole(['administrator', 'dokter']), getPatientHistory);

export default router;
