import express from 'express';
import {
  getPermits,
  getPermitById,
  createPermit,
  updatePermit,
  deletePermit,
} from '../controllers/permitController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getPermits);
router.get('/:id', getPermitById);
router.post('/', authMiddleware, createPermit);
router.put('/:id', authMiddleware, updatePermit);
router.delete('/:id', authMiddleware, deletePermit);

export default router;
