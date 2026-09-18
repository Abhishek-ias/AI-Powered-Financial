// ============================================================
// Express App — AI Financial Journey Copilot
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errors';
import { rateLimiter } from './middleware/rateLimiter';
import { getProviderStatus, getFeatureFlags } from './config/env';
import apiRoutes from './routes/api';
import prisma from './config/database';

export function createApp() {
  const app = express();

  // ---- Security ----
  app.use(helmet());
  app.use(cors());

  // ---- Parsing ----
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ---- Request ID ----
  app.use(requestIdMiddleware);

  // ---- Logging (structured, no secrets) ----
  app.use(morgan(':method :url :status :response-time ms'));

  // ---- Rate Limiting ----
  app.use('/api', rateLimiter(60 * 1000, 200)); // 200 req/min per user

  // ---- Health ----
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      project: 'AI Financial Journey Copilot — ClaimSahay',
      team: 'NOVA',
    });
  });

  // ---- Readiness ----
  app.get('/ready', async (_req, res) => {
    const providers = getProviderStatus();
    const flags = getFeatureFlags();

    let dbStatus = 'UNKNOWN';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'READY';
    } catch {
      dbStatus = 'UNAVAILABLE';
    }

    res.json({
      status: dbStatus === 'READY' ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      providers: {
        database: { status: dbStatus, mode: providers.postgres.mode },
        azureOpenAI: { status: providers.azureOpenAI.status, mode: providers.azureOpenAI.mode },
        documentIntelligence: { status: providers.documentIntelligence.status, mode: providers.documentIntelligence.mode },
        azureSearch: { status: providers.azureSearch.status, mode: providers.azureSearch.mode },
        cognee: { status: providers.cognee.status, mode: providers.cognee.mode },
        n8n: { status: providers.n8n.status, mode: providers.n8n.mode },
      },
      featureFlags: flags,
    });
  });

  // ---- API Routes ----
  app.use('/api', apiRoutes);

  // ---- 404 ----
  app.use(notFoundHandler);

  // ---- Error Handler ----
  app.use(errorHandler);

  return app;
}
