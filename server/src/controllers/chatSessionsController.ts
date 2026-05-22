import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../db/database';
import { ChatQuestion, ChatResponse, ChatSession } from '../types';
import { sendNotifications, ResponseEntry } from '../services/notifications';

const selectActiveQuestions = db.prepare(
  'SELECT * FROM chat_questions WHERE active = 1 ORDER BY order_index ASC',
);
const selectSession = db.prepare('SELECT * FROM chat_sessions WHERE id = ?');
const insertSession = db.prepare(
  'INSERT INTO chat_sessions (id) VALUES (?)',
);
const selectResponses = db.prepare(
  'SELECT * FROM chat_responses WHERE session_id = ? ORDER BY created_at ASC',
);
const insertResponse = db.prepare(
  'INSERT INTO chat_responses (session_id, question_id, response_text) VALUES (?, ?, ?)',
);
const advanceSession = db.prepare(
  "UPDATE chat_sessions SET current_question_order = ?, updated_at = datetime('now') WHERE id = ?",
);
const completeSession = db.prepare(
  "UPDATE chat_sessions SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
);
const selectQuestionById = db.prepare('SELECT * FROM chat_questions WHERE id = ?');

export function createSession(_req: Request, res: Response): void {
  const id = randomUUID();
  try {
    insertSession.run(id);
    const questions = selectActiveQuestions.all() as ChatQuestion[];
    res.status(201).json({ success: true, data: { sessionId: id, questions } });
  } catch (err) {
    console.error('[createSession]', err);
    res.status(500).json({ success: false, error: 'Failed to create session.' });
  }
}

export function getSession(req: Request, res: Response): void {
  const { id } = req.params;
  try {
    const session = selectSession.get(id) as ChatSession | undefined;
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found.' });
      return;
    }
    const questions = selectActiveQuestions.all() as ChatQuestion[];
    const responses = selectResponses.all(id) as ChatResponse[];
    res.json({ success: true, data: { session, questions, responses } });
  } catch (err) {
    console.error('[getSession]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch session.' });
  }
}

export function saveResponse(req: Request, res: Response): void {
  const { id } = req.params;
  const { question_id, response_text } = req.body as {
    question_id?: unknown;
    response_text?: unknown;
  };

  if (!Number.isInteger(question_id) || (question_id as number) < 1) {
    res.status(400).json({ success: false, error: 'question_id must be a positive integer.' });
    return;
  }
  if (typeof response_text !== 'string' || response_text.trim() === '') {
    res.status(400).json({ success: false, error: 'response_text is required.' });
    return;
  }

  try {
    const session = selectSession.get(id) as ChatSession | undefined;
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found.' });
      return;
    }
    if (session.status === 'completed') {
      res.status(409).json({ success: false, error: 'Session already completed.' });
      return;
    }

    const question = selectQuestionById.get(question_id as number) as ChatQuestion | undefined;
    if (!question) {
      res.status(404).json({ success: false, error: 'Question not found.' });
      return;
    }

    insertResponse.run(id, question_id as number, response_text.trim());
    advanceSession.run(question.order_index, id);

    const questions = selectActiveQuestions.all() as ChatQuestion[];
    const nextQuestion =
      questions.find((q) => q.order_index > question.order_index) ?? null;

    res.json({ success: true, data: { nextQuestion, allDone: nextQuestion === null } });
  } catch (err) {
    console.error('[saveResponse]', err);
    res.status(500).json({ success: false, error: 'Failed to save response.' });
  }
}

export async function completeSessionHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const session = selectSession.get(id) as ChatSession | undefined;
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found.' });
      return;
    }
    if (session.status === 'completed') {
      res.json({ success: true });
      return;
    }

    completeSession.run(id);

    const responses = selectResponses.all(id) as ChatResponse[];
    const entries: ResponseEntry[] = responses.map((r) => {
      const q = selectQuestionById.get(r.question_id) as ChatQuestion | undefined;
      return { question: q?.question_text ?? `Question ${r.question_id}`, answer: r.response_text };
    });

    await sendNotifications(id, entries, new Date().toISOString());

    res.json({ success: true });
  } catch (err) {
    console.error('[completeSession]', err);
    res.status(500).json({ success: false, error: 'Failed to complete session.' });
  }
}
