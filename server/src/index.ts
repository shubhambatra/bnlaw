import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema } from './db/schema';
import { initChatSchema } from './db/chatSchema';
import queriesRouter from './routes/queries';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';

dotenv.config({ path: '../.env' });

const app  = express();
const PORT = process.env.PORT ?? 8000;
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Boot database
initSchema();
initChatSchema();

// Routes
app.use('/api/queries', queriesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback for unknown routes
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
});
