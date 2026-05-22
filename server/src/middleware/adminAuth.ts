import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

const validTokens = new Set<string>();

export function issueToken(): string {
  const token = randomBytes(32).toString('hex');
  validTokens.add(token);
  return token;
}

export function revokeToken(token: string): void {
  validTokens.delete(token);
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }
  const token = auth.slice(7);
  if (!validTokens.has(token)) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }
  next();
}
