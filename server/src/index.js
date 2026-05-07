import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import { seedMenuIfEmpty } from './seed.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { setIO } from './lib/socket.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 5000;

const validateEnv = () => {
  const required = ['MONGO_URI'];
  const missingRequired = required.filter((key) => !process.env[key]);

  // We allow COOKIE_SECRET as fallback for backwards compatibility.
  const hasJwtSecret = Boolean(process.env.JWT_SECRET || process.env.COOKIE_SECRET);
  if (!hasJwtSecret) missingRequired.push('JWT_SECRET (or COOKIE_SECRET fallback)');

  if (missingRequired.length) {
    throw new Error(`Missing required env vars: ${missingRequired.join(', ')}`);
  }

  const optionalGroups = [
    {
      name: 'SMTP/Email',
      keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL', 'EMAIL_FROM']
    },
    {
      name: 'Stripe',
      keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
    },
    {
      name: 'PayPal',
      keys: ['PAYPAL_CLIENT_ID', 'PAYPAL_SECRET']
    }
  ];

  for (const group of optionalGroups) {
    const missing = group.keys.filter((key) => !process.env[key]);
    if (missing.length) {
      console.warn(`[env] Optional ${group.name} config incomplete. Missing: ${missing.join(', ')}`);
    }
  }
};

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/restaurant', restaurantRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  // Try to find the dist folder in a few common locations
  const possiblePaths = [
    path.join(__dirname, '../../client/dist'),
    path.join(process.cwd(), '../client/dist'),
    path.join(process.cwd(), 'client/dist'),
    path.join(__dirname, '../client/dist')
  ];
  
  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    validateEnv();
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
