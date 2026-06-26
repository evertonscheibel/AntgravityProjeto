import { z } from 'zod';
import { getSeniorHcmConfig } from '../../../config/senior.config.js';
import { SeniorHcmClient } from '../senior-hcm.client.js';
import { buildEmptyParametersXml } from '../senior-hcm.xml.js';

export const fichaBasicaRawSchema = z.object({
  parametersXml: z.string().min(1).default(buildEmptyParametersXml()),
  soapAction: z.string().optional(),
});

export type FichaBasicaRawInput = z.infer<typeof fichaBasicaRawSchema>;

export class FichaBasicaService {
  constructor(private readonly client = new SeniorHcmClient()) {}

  buildDryRun(input: Partial<FichaBasicaRawInput> = {}) {
    const payload = fichaBasicaRawSchema.parse({
      parametersXml: input.parametersXml ?? buildEmptyParametersXml(),
      soapAction: input.soapAction,
    });

    return this.client.buildEnvelope({
      operation: 'FichaBasica',
      parametersXml: payload.parametersXml,
      soapAction: payload.soapAction,
    });
  }

  async enviarRaw(input: FichaBasicaRawInput) {
    const config = getSeniorHcmConfig();

    if (!config.allowMutation) {
      throw new Error(
        'Chamada real bloqueada. Defina SENIOR_HCM_ALLOW_MUTATION=true somente após confirmar com a Senior que a operação/payload é seguro.'
      );
    }

    const payload = fichaBasicaRawSchema.parse(input);

    return this.client.callSoap({
      operation: 'FichaBasica',
      parametersXml: payload.parametersXml,
      soapAction: payload.soapAction,
    });
  }
}
