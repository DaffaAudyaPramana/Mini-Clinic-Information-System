import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

// Protect all patient routes with authentication
router.use(authenticate);

// Only allow admin and petugas pendaftaran to manage patients
router.use(authorizeRole(['administrator', 'petugas_pendaftaran']));

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
