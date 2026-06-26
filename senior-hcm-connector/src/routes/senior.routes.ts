import { Router } from 'express';
import { z } from 'zod';
import { getPublicSeniorStatus } from '../config/senior.config.js';
import { SeniorHcmClient } from '../integrations/senior-hcm/senior-hcm.client.js';
import { FichaBasicaService, fichaBasicaRawSchema } from '../integrations/senior-hcm/services/ficha-basica.service.js';
import { removeSensitiveKeys } from '../utils/sanitize.js';

export const seniorRouter = Router();

seniorRouter.get('/status', (_req, res) => {
  res.json({ ok: true, senior: getPublicSeniorStatus() });
});

seniorRouter.get('/wsdl', async (_req, res, next) => {
  try {
    const client = new SeniorHcmClient();
    const result = await client.fetchWsdl();
    res.status(result.status >= 200 && result.status < 500 ? 200 : 502).json(result);
  } catch (error) {
    next(error);
  }
});

seniorRouter.post('/soap/dry-run', async (req, res, next) => {
  try {
    const schema = z.object({
      operation: z.string().min(1).default('FichaBasica'),
      parametersXml: z.string().min(1).default('<parameters></parameters>'),
      soapAction: z.string().optional(),
    });

    const input = schema.parse(req.body ?? {});
    const client = new SeniorHcmClient();
    const envelope = client.buildEnvelope(input);

    res.json({
      ok: true,
      dryRun: true,
      operation: input.operation,
      envelopePreview: removeSensitiveKeys({ envelope }).envelope,
      envelope,
    });
  } catch (error) {
    next(error);
  }
});

seniorRouter.post('/ficha-basica/dry-run', async (req, res, next) => {
  try {
    const input = fichaBasicaRawSchema.partial().parse(req.body ?? {});
    const service = new FichaBasicaService();
    const envelope = service.buildDryRun(input);
    res.json({ ok: true, dryRun: true, envelope });
  } catch (error) {
    next(error);
  }
});

seniorRouter.post('/ficha-basica/enviar-raw', async (req, res, next) => {
  try {
    const input = fichaBasicaRawSchema.parse(req.body ?? {});
    const service = new FichaBasicaService();
    const result = await service.enviarRaw(input);
    res.status(result.status >= 200 && result.status < 500 ? 200 : 502).json(removeSensitiveKeys(result));
  } catch (error) {
    next(error);
  }
});
