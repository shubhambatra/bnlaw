import { Request, Response } from 'express';
import { db } from '../db/database';
import { CreateQueryBody, QueryRow, QueryStatus } from '../types';

// ── Validation ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidationResult =
  | { ok: true; data: CreateQueryBody }
  | { ok: false; fields: Record<string, string> };

function validateBody(body: unknown): ValidationResult {
  const b = body as Record<string, unknown>;
  const fields: Record<string, string> = {};

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  const caseType = b.caseType as string | undefined;
  const description = typeof b.description === 'string' ? b.description.trim() : '';

  if (name.length < 2) fields.name = 'Full name is required (minimum 2 characters).';
  if (!EMAIL_RE.test(email)) fields.email = 'A valid email address is required.';
  if (!caseType || !['fir', 'court', 'general'].includes(caseType))
    fields.caseType = "Case type must be 'fir', 'court', or 'general'.";

  if (caseType === 'fir') {
    const firNumber = typeof b.firNumber === 'string' ? b.firNumber.trim() : '';
    const firCity   = typeof b.firCity   === 'string' ? b.firCity.trim()   : '';
    if (!firNumber) fields.firNumber = 'FIR number is required.';
    if (!firCity)   fields.firCity   = 'FIR place (city) is required.';
  }

  if (caseType === 'court') {
    const courtCity  = typeof b.courtCity  === 'string' ? b.courtCity.trim()  : '';
    const caseNumber = typeof b.caseNumber === 'string' ? b.caseNumber.trim() : '';
    if (!courtCity)  fields.courtCity  = 'Court city is required.';
    if (!caseNumber) fields.caseNumber = 'Case number is required.';
  }

  if (description.length < 20)
    fields.description = 'Description must be at least 20 characters.';

  if (Object.keys(fields).length > 0) return { ok: false, fields };

  return {
    ok: true,
    data: {
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      caseType: caseType as CreateQueryBody['caseType'],
      firNumber:  typeof b.firNumber  === 'string' ? b.firNumber.trim()  || undefined : undefined,
      firCity:    typeof b.firCity    === 'string' ? b.firCity.trim()    || undefined : undefined,
      courtCity:  typeof b.courtCity  === 'string' ? b.courtCity.trim()  || undefined : undefined,
      caseNumber: typeof b.caseNumber === 'string' ? b.caseNumber.trim() || undefined : undefined,
      description,
    },
  };
}

// ── Prepared statements (created once, reused on every call) ─────────────────

const insertQuery = db.prepare(`
  INSERT INTO queries
    (name, email, phone, case_type, fir_number, fir_city, court_city, case_number, description)
  VALUES
    (@name, @email, @phone, @caseType, @firNumber, @firCity, @courtCity, @caseNumber, @description)
`);

const selectById = db.prepare('SELECT * FROM queries WHERE id = ?');

const selectAll  = db.prepare(
  'SELECT * FROM queries ORDER BY created_at DESC LIMIT ? OFFSET ?',
);
const selectByStatus = db.prepare(
  'SELECT * FROM queries WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
);
const selectByCaseType = db.prepare(
  'SELECT * FROM queries WHERE case_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
);
const selectByBoth = db.prepare(
  'SELECT * FROM queries WHERE status = ? AND case_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
);
const countAll = db.prepare('SELECT COUNT(*) AS count FROM queries');

const updateStatusStmt = db.prepare(
  'UPDATE queries SET status = ? WHERE id = ?',
);

// ── Handlers ─────────────────────────────────────────────────────────────────

export function createQuery(req: Request, res: Response): void {
  const result = validateBody(req.body);
  if (!result.ok) {
    res.status(400).json({ success: false, errors: result.fields });
    return;
  }

  const { data } = result;
  try {
    const info = insertQuery.run({
      name:        data.name,
      email:       data.email,
      phone:       data.phone        ?? null,
      caseType:    data.caseType,
      firNumber:   data.firNumber    ?? null,
      firCity:     data.firCity      ?? null,
      courtCity:   data.courtCity    ?? null,
      caseNumber:  data.caseNumber   ?? null,
      description: data.description,
    });

    const row = selectById.get(info.lastInsertRowid) as QueryRow;
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('[createQuery]', err);
    res.status(500).json({ success: false, error: 'Failed to save query.' });
  }
}

export function listQueries(req: Request, res: Response): void {
  const { status, caseType, limit = '50', offset = '0' } = req.query;
  const lim = Math.min(Math.max(Number(limit), 1), 100);
  const off = Math.max(Number(offset), 0);

  const validStatus   = ['pending', 'reviewed', 'resolved'].includes(status as string)   ? (status as string) : null;
  const validCaseType = ['fir', 'court', 'general'].includes(caseType as string) ? (caseType as string) : null;

  try {
    let rows: QueryRow[];
    if (validStatus && validCaseType) {
      rows = selectByBoth.all(validStatus, validCaseType, lim, off) as QueryRow[];
    } else if (validStatus) {
      rows = selectByStatus.all(validStatus, lim, off) as QueryRow[];
    } else if (validCaseType) {
      rows = selectByCaseType.all(validCaseType, lim, off) as QueryRow[];
    } else {
      rows = selectAll.all(lim, off) as QueryRow[];
    }

    const { count } = countAll.get() as { count: number };
    res.json({ success: true, total: count, data: rows });
  } catch (err) {
    console.error('[listQueries]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch queries.' });
  }
}

export function getQuery(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, error: 'Invalid id.' });
    return;
  }
  try {
    const row = selectById.get(id) as QueryRow | undefined;
    if (!row) {
      res.status(404).json({ success: false, error: 'Query not found.' });
      return;
    }
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('[getQuery]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch query.' });
  }
}

export function updateStatus(req: Request, res: Response): void {
  const id     = Number(req.params.id);
  const status = (req.body as { status?: unknown }).status;

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, error: 'Invalid id.' });
    return;
  }
  if (!status || !['pending', 'reviewed', 'resolved'].includes(status as string)) {
    res.status(400).json({
      success: false,
      error: "status must be 'pending', 'reviewed', or 'resolved'.",
    });
    return;
  }

  try {
    const result = updateStatusStmt.run(status as QueryStatus, id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Query not found.' });
      return;
    }
    const row = selectById.get(id) as QueryRow;
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('[updateStatus]', err);
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
}
