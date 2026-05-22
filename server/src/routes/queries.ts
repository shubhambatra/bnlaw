import { Router } from 'express';
import {
  createQuery,
  listQueries,
  getQuery,
  updateStatus,
} from '../controllers/queriesController';

const router = Router();

router.post('/',            createQuery);   // Submit a new query
router.get('/',             listQueries);   // List queries (with optional filters)
router.get('/:id',          getQuery);      // Get single query by id
router.patch('/:id/status', updateStatus);  // Update status (admin)

export default router;
