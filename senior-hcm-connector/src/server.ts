import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { appConfig } from './config/senior.config.js';
import { seniorRouter } from './routes/senior.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'senior-hcm-connector' });
});

app.use('/senior', seniorRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: 'Payload inválido.',
      details: error.flatten(),
    });
  }

  const message = error instanceof Error ? error.message : 'Erro interno inesperado.';

  return res.status(500).json({
    ok: false,
    error: message,
  });
});

app.listen(appConfig.port, () => {
  console.log(`Senior HCM Connector rodando em http://localhost:${appConfig.port}`);
});
