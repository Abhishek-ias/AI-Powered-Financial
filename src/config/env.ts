// ============================================================
// Environment Configuration — AI Financial Journey Copilot
// ============================================================
import { z } from 'zod';
import path from 'path';

const boolStr = z.string().transform(v => v === 'true').default('false');

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().default('file:./dev.db'),

  // Azure OpenAI
  ENABLE_AZURE_OPENAI: boolStr,
  AZURE_OPENAI_ENDPOINT: z.string().default(''),
  AZURE_OPENAI_API_KEY: z.string().default(''),
  AZURE_OPENAI_DEPLOYMENT: z.string().default('gpt-4o'),
  AZURE_OPENAI_API_VERSION: z.string().default('2024-08-01-preview'),

  // Azure Document Intelligence
  ENABLE_AZURE_DOCUMENT_INTELLIGENCE: boolStr,
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: z.string().default(''),
  AZURE_DOCUMENT_INTELLIGENCE_API_KEY: z.string().default(''),

  // Azure AI Search
  ENABLE_AZURE_SEARCH: boolStr,
  AZURE_SEARCH_ENDPOINT: z.string().default(''),
  AZURE_SEARCH_API_KEY: z.string().default(''),
  AZURE_SEARCH_INDEX: z.string().default('policies'),

  // Cognee
  ENABLE_COGNEE: boolStr,
  COGNEE_API_URL: z.string().default('http://localhost:8000'),
  COGNEE_API_KEY: z.string().default(''),

  // n8n
  ENABLE_N8N: boolStr,
  N8N_BASE_URL: z.string().default('http://localhost:5678'),
  N8N_API_KEY: z.string().default(''),

  // Feature Flags
  ENABLE_LENDING: boolStr,
  ENABLE_FINTECH: boolStr,
  ENABLE_CROSS_DOMAIN: boolStr,
  ENABLE_VOICE: boolStr,
  ENABLE_MULTILINGUAL: boolStr,
  ENABLE_PROACTIVE: boolStr,
  ENABLE_FRAUD: boolStr,

  // Mock Flags
  USE_MOCK_DOCUMENT_AI: boolStr,
  USE_MOCK_SEARCH: boolStr,
  USE_MOCK_MEMORY: boolStr,
  USE_MOCK_WORKFLOW: boolStr,
  MOCK_INSURER: boolStr,
  MOCK_LENDER: boolStr,
  MOCK_FINTECH: boolStr,

  // Upload
  MAX_FILE_SIZE_MB: z.string().default('20').transform(Number),
  UPLOAD_DIR: z.string().default('./uploads'),

  // Auth
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),

  // Frontend Deployment URL for CORS
  FRONTEND_URL: z.string().default(''),
});

function loadEnv() {
  // Load .env file manually for simplicity (no dotenv dependency)
  try {
    const fs = require('fs');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // Strip quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Ignore .env load errors
  }
}

loadEnv();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

export function getProviderStatus() {
  const isSqlite = env.DATABASE_URL.startsWith('file:');
  return {
    postgres: {
      status: env.DATABASE_URL ? 'CONFIGURED' : 'MISSING',
      mode: isSqlite ? 'SQLITE' : 'POSTGRESQL',
      isLive: !isSqlite,
    },
    azureOpenAI: {
      status: env.ENABLE_AZURE_OPENAI && env.AZURE_OPENAI_API_KEY ? 'READY' : 'MOCK',
      mode: env.ENABLE_AZURE_OPENAI ? 'LIVE' : 'MOCK',
      isLive: Boolean(env.ENABLE_AZURE_OPENAI && env.AZURE_OPENAI_API_KEY),
    },
    documentIntelligence: {
      status: env.ENABLE_AZURE_DOCUMENT_INTELLIGENCE && env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY ? 'READY' : 'MOCK',
      mode: env.USE_MOCK_DOCUMENT_AI ? 'MOCK' : 'LIVE',
      isLive: !env.USE_MOCK_DOCUMENT_AI,
    },
    azureSearch: {
      status: env.ENABLE_AZURE_SEARCH && env.AZURE_SEARCH_API_KEY ? 'READY' : 'MOCK',
      mode: env.USE_MOCK_SEARCH ? 'MOCK' : 'LIVE',
      isLive: !env.USE_MOCK_SEARCH,
    },
    cognee: {
      status: env.ENABLE_COGNEE && env.COGNEE_API_KEY ? 'READY' : 'MOCK',
      mode: env.USE_MOCK_MEMORY ? 'MOCK' : 'LIVE',
      isLive: !env.USE_MOCK_MEMORY,
    },
    n8n: {
      status: env.ENABLE_N8N && env.N8N_API_KEY ? 'READY' : 'MOCK',
      mode: env.USE_MOCK_WORKFLOW ? 'MOCK' : 'LIVE',
      isLive: !env.USE_MOCK_WORKFLOW,
    },
    mockInsurer: {
      status: 'READY',
      mode: 'MOCK',
      isLive: false,
    },
    mockLender: {
      status: 'READY',
      mode: 'MOCK',
      isLive: false,
    },
    mockFintech: {
      status: 'READY',
      mode: 'MOCK',
      isLive: false,
    },
  };
}

export function getFeatureFlags() {
  return {
    azureOpenAI: env.ENABLE_AZURE_OPENAI,
    documentIntelligence: env.ENABLE_AZURE_DOCUMENT_INTELLIGENCE,
    azureSearch: env.ENABLE_AZURE_SEARCH,
    cognee: env.ENABLE_COGNEE,
    n8n: env.ENABLE_N8N,
    lending: env.ENABLE_LENDING,
    fintech: env.ENABLE_FINTECH,
    crossDomain: env.ENABLE_CROSS_DOMAIN,
    mockDocumentAI: env.USE_MOCK_DOCUMENT_AI,
    mockSearch: env.USE_MOCK_SEARCH,
    mockMemory: env.USE_MOCK_MEMORY,
    mockWorkflow: env.USE_MOCK_WORKFLOW,
    mockInsurer: env.MOCK_INSURER,
    mockLender: env.MOCK_LENDER,
    mockFintech: env.MOCK_FINTECH,
  };
}
