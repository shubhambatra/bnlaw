import { db } from './database';

export function initChatSchema(): void {
  // Tables are created in database.ts — only seed default questions here.
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM chat_questions').get() as { c: number };
  if (c === 0) {
    const ins = db.prepare(
      'INSERT INTO chat_questions (question_text, order_index, type) VALUES (@t, @o, @ty)',
    );
    db.transaction(() => {
      ins.run({ t: 'What is your full name?', o: 1, ty: 'text' });
      ins.run({ t: 'What is your email address?', o: 2, ty: 'email' });
      ins.run({ t: 'What is your phone number?', o: 3, ty: 'phone' });
      ins.run({ t: 'What type of legal matter do you need help with?', o: 4, ty: 'text' });
      ins.run({ t: 'Please briefly describe your situation.', o: 5, ty: 'text' });
    })();
  }
}
