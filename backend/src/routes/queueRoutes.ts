import { Router } from 'express';
import {
  getQueues,
  createQueue,
  updateQueueStatus
} from '../controllers/queueController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getQueues);
router.post('/', authorizeRole(['administrator', 'petugas_pendaftaran']), createQueue);
router.put('/:id/status', authorizeRole(['administrator', 'petugas_pendaftaran', 'dokter']), updateQueueStatus);

export default router;
