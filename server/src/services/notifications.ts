import nodemailer from 'nodemailer';

export interface ResponseEntry {
  question: string;
  answer: string;
}

function buildText(sessionId: string, responses: ResponseEntry[], timestamp: string): string {
  const lines = responses
    .map((r, i) => `${i + 1}. ${r.question}\n   → ${r.answer}`)
    .join('\n\n');
  return `New chat submission\nSession: ${sessionId}\nTime: ${timestamp}\n\n${lines}`;
}

async function notifyEmail(
  sessionId: string,
  responses: ResponseEntry[],
  timestamp: string,
): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !NOTIFY_EMAIL) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: NOTIFY_EMAIL,
    subject: `New chat query — ${new Date(timestamp).toLocaleString()}`,
    text: buildText(sessionId, responses, timestamp),
  });
}

async function notifyTelegram(
  sessionId: string,
  responses: ResponseEntry[],
  timestamp: string,
): Promise<void> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = buildText(sessionId, responses, timestamp);
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });
}

export async function sendNotifications(
  sessionId: string,
  responses: ResponseEntry[],
  timestamp: string,
): Promise<void> {
  const results = await Promise.allSettled([
    notifyEmail(sessionId, responses, timestamp),
    notifyTelegram(sessionId, responses, timestamp),
  ]);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notifications] channel ${i} failed:`, r.reason);
    }
  });
}
