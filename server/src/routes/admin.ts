import { Router, Request, Response } from 'express';
import {
  listAllQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
} from '../controllers/chatQuestionsController';
import { adminAuth, issueToken, revokeToken } from '../middleware/adminAuth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(503).json({ success: false, error: 'Admin access not configured.' });
    return;
  }
  if (!password || password !== adminPassword) {
    res.status(401).json({ success: false, error: 'Incorrect password.' });
    return;
  }

  const token = issueToken();
  res.json({ success: true, token });
});

router.post('/logout', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) revokeToken(auth.slice(7));
  res.json({ success: true });
});

// All routes below require a valid token
router.use(adminAuth);

router.get('/questions', listAllQuestions);
router.post('/questions', createQuestion);
router.patch('/questions/:id', updateQuestion);
router.delete('/questions/:id', removeQuestion);

export default router;
