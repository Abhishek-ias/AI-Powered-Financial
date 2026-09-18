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

    const liveProviders: string[] = [];
    const mockProviders: string[] = [];

    for (const [key, val] of Object.entries(providers)) {
      if (val.isLive) {
        liveProviders.push(key);
      } else {
        mockProviders.push(key);
      }
    }

    res.json({
      status: dbStatus === 'READY' ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      providerSummary: {
        totalProviders: Object.keys(providers).length,
        liveCount: liveProviders.length,
        mockCount: mockProviders.length,
        liveProviders,
        mockProviders,
      },
      providers: {
        database: { status: dbStatus, mode: providers.postgres.mode, isLive: providers.postgres.isLive },
        azureOpenAI: { status: providers.azureOpenAI.status, mode: providers.azureOpenAI.mode, isLive: providers.azureOpenAI.isLive },
        documentIntelligence: { status: providers.documentIntelligence.status, mode: providers.documentIntelligence.mode, isLive: providers.documentIntelligence.isLive },
        azureSearch: { status: providers.azureSearch.status, mode: providers.azureSearch.mode, isLive: providers.azureSearch.isLive },
        cognee: { status: providers.cognee.status, mode: providers.cognee.mode, isLive: providers.cognee.isLive },
        n8n: { status: providers.n8n.status, mode: providers.n8n.mode, isLive: providers.n8n.isLive },
        mockInsurer: { status: providers.mockInsurer.status, mode: providers.mockInsurer.mode, isLive: false },
        mockLender: { status: providers.mockLender.status, mode: providers.mockLender.mode, isLive: false },
        mockFintech: { status: providers.mockFintech.status, mode: providers.mockFintech.mode, isLive: false },
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
