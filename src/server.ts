// ============================================================
// Server Entry Point — AI Financial Journey Copilot
// ============================================================
import { createApp } from './app';
import { env, getProviderStatus } from './config/env';

async function main() {
  const app = createApp();
  const port = env.PORT;

  app.listen(port, '0.0.0.0', () => {
    const providers = getProviderStatus();
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   AI Financial Journey Copilot — Backend Server     ║');
    console.log('║   Team NOVA — ClaimSahay                            ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🚀  Server running on http://localhost:${port}`);
    console.log(`  ❤️   Health:  http://localhost:${port}/health`);
    console.log(`  ✅  Ready:   http://localhost:${port}/ready`);
    console.log('');
    console.log('  Provider Status:');
    console.log(`    Database:              ${providers.postgres.mode}`);
    console.log(`    Azure OpenAI:          ${providers.azureOpenAI.mode}`);
    console.log(`    Document Intelligence: ${providers.documentIntelligence.mode}`);
    console.log(`    Azure AI Search:       ${providers.azureSearch.mode}`);
    console.log(`    Cognee:                ${providers.cognee.mode}`);
    console.log(`    n8n:                   ${providers.n8n.mode}`);
    console.log('');
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log('');
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
