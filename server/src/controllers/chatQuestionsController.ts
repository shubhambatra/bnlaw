import { Request, Response } from 'express';
import { db } from '../db/database';
import { ChatQuestion, QuestionType } from '../types';

const VALID_TYPES: QuestionType[] = ['text', 'dropdown', 'number', 'email', 'phone'];

const selectActive = db.prepare(
  'SELECT * FROM chat_questions WHERE active = 1 ORDER BY order_index ASC',
);
const selectAll = db.prepare('SELECT * FROM chat_questions ORDER BY order_index ASC');
const selectById = db.prepare('SELECT * FROM chat_questions WHERE id = ?');
const insertQuestion = db.prepare(`
  INSERT INTO chat_questions (question_text, order_index, type, options, required)
  VALUES (@question_text, @order_index, @type, @options, @required)
`);
const updateQuestionStmt = db.prepare(`
  UPDATE chat_questions
  SET question_text = @question_text,
      order_index   = @order_index,
      type          = @type,
      options       = @options,
      required      = @required,
      active        = @active
  WHERE id = @id
`);
const deleteQuestion = db.prepare('DELETE FROM chat_questions WHERE id = ?');
const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), 0) AS m FROM chat_questions');

export function getActiveQuestions(_req: Request, res: Response): void {
  const rows = selectActive.all() as ChatQuestion[];
  res.json({ success: true, data: rows });
}

export function listAllQuestions(_req: Request, res: Response): void {
  const rows = selectAll.all() as ChatQuestion[];
  res.json({ success: true, data: rows });
}

export function createQuestion(req: Request, res: Response): void {
  const b = req.body as Record<string, unknown>;
  const question_text = typeof b.question_text === 'string' ? b.question_text.trim() : '';
  const type = b.type as QuestionType | undefined;
  const options =
    Array.isArray(b.options) && b.options.length > 0 ? JSON.stringify(b.options) : null;
  const required = b.required === false ? 0 : 1;

  if (!question_text) {
    res.status(400).json({ success: false, error: 'question_text is required.' });
    return;
  }
  if (!type || !VALID_TYPES.includes(type)) {
    res.status(400).json({ success: false, error: `type must be one of: ${VALID_TYPES.join(', ')}.` });
    return;
  }
  if (type === 'dropdown' && !options) {
    res.status(400).json({ success: false, error: 'options array is required for dropdown type.' });
    return;
  }

  const { m } = maxOrder.get() as { m: number };
  const order_index = typeof b.order_index === 'number' ? b.order_index : m + 1;

  try {
    const info = insertQuestion.run({ question_text, order_index, type, options, required });
    const row = selectById.get(info.lastInsertRowid) as ChatQuestion;
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('[createQuestion]', err);
    res.status(500).json({ success: false, error: 'Failed to create question.' });
  }
}

export function updateQuestion(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, error: 'Invalid id.' });
    return;
  }

  const existing = selectById.get(id) as ChatQuestion | undefined;
  if (!existing) {
    res.status(404).json({ success: false, error: 'Question not found.' });
    return;
  }

  const b = req.body as Record<string, unknown>;
  const question_text =
    typeof b.question_text === 'string' ? b.question_text.trim() : existing.question_text;
  const type = (b.type as QuestionType | undefined) ?? existing.type;
  const order_index =
    typeof b.order_index === 'number' ? b.order_index : existing.order_index;
  const options =
    Array.isArray(b.options) && b.options.length > 0
      ? JSON.stringify(b.options)
      : existing.options;
  const required = b.required === false ? 0 : b.required === true ? 1 : existing.required;
  const active = b.active === false ? 0 : b.active === true ? 1 : existing.active;

  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ success: false, error: `type must be one of: ${VALID_TYPES.join(', ')}.` });
    return;
  }

  try {
    updateQuestionStmt.run({ id, question_text, order_index, type, options, required, active });
    const row = selectById.get(id) as ChatQuestion;
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('[updateQuestion]', err);
    res.status(500).json({ success: false, error: 'Failed to update question.' });
  }
}

export function removeQuestion(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, error: 'Invalid id.' });
    return;
  }
  try {
    const result = deleteQuestion.run(id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Question not found.' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[removeQuestion]', err);
    res.status(500).json({ success: false, error: 'Failed to delete question.' });
  }
}
