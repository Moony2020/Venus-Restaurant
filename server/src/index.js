import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { seedMenuIfEmpty } from './seed.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { setIO } from './lib/socket.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});

setIO(io);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'venus-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
    await mongoose.connect(process.env.MONGO_URI);
    await seedMenuIfEmpty();
    console.log('MongoDB connected and menu seeded');

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

start();
