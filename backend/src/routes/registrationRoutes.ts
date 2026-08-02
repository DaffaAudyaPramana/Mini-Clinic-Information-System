import { Router } from 'express';
import {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus
} from '../controllers/registrationController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// Registration can be viewed and managed by petugas_pendaftaran
router.get('/', getRegistrations);
router.post('/', authorizeRole(['administrator', 'petugas_pendaftaran']), createRegistration);
router.put('/:id/status', authorizeRole(['administrator', 'petugas_pendaftaran', 'dokter']), updateRegistrationStatus);

export default router;
