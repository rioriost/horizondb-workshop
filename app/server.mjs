import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { InputError, runAgent, validateBrief } from './agent.mjs';

const directory = dirname(fileURLToPath(import.meta.url));

export function createApp(pool) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`
        SELECT current_database() AS database,
          count(*) AS products,
          count(*) FILTER (WHERE embedding IS NOT NULL AND vector_dims(embedding) = 1536) AS embedded,
          to_regnamespace('workshop_style') IS NOT NULL AS graph_ready
        FROM workshop.products
      `);
      const ready = Number(rows[0].products) === 18 && Number(rows[0].embedded) === 18 && rows[0].graph_ready;
      res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'incomplete', db: true, ...rows[0] });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/design-room', async (req, res, next) => {
    let client;
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new InputError('A JSON room brief is required.');
      }
      const brief = validateBrief(req.body);
      client = await pool.connect();
      await client.query('SET search_path = ag_catalog, public');
      res.json(await runAgent(client, brief));
    } catch (error) {
      next(error);
    } finally {
      client?.release();
    }
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));
  app.use(express.static(resolve(directory, 'dist')));
  app.get('*', (_req, res) => res.sendFile(resolve(directory, 'dist/index.html')));
  app.use((error, _req, res, _next) => {
    console.error('Zava workshop request failed:', error);
    const badRequest = error instanceof InputError || error.status === 400;
    res.status(badRequest ? 400 : 500).json({
      error: badRequest ? error.message : 'Database or AI request failed. Inspect server logs and workshop setup.',
    });
  });
  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const name of ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD']) {
    if (!process.env[name]) throw new Error(`Missing required setting ${name}.`);
  }
  const pool = new pg.Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
    max: 4,
    connectionTimeoutMillis: 15000,
    ssl: {
      rejectUnauthorized: true,
      ca: readFileSync(process.env.PGSSLROOTCERT || resolve(directory, 'certs/roots.pem'), 'utf8'),
    },
  });
  const port = Number(process.env.PORT || 3001);
  const server = createApp(pool).listen(port, '0.0.0.0', () => {
    console.log(`Zava workshop listening on port ${port}; text-only design brief, live HorizonDB queries.`);
  });
  process.on('SIGTERM', () => server.close(() => pool.end()));
}
