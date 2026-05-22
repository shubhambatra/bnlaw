import { Router } from 'express';
import { getActiveQuestions } from '../controllers/chatQuestionsController';
import {
  createSession,
  getSession,
  saveResponse,
  completeSessionHandler,
} from '../controllers/chatSessionsController';

const router = Router();

router.get('/questions', getActiveQuestions);
router.post('/sessions', createSession);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/respond', saveResponse);
router.post('/sessions/:id/complete', completeSessionHandler);

export default router;
