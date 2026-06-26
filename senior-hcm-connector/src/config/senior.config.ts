import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  SENIOR_HCM_ENV: z.enum(['homolog', 'prod']).default('homolog'),

  SENIOR_HCM_HOMOLOG_BASE_URL: z.string().url(),
  SENIOR_HCM_HOMOLOG_TENANT: z.string().min(1),
  SENIOR_HCM_HOMOLOG_WSDL: z.string().url(),

  SENIOR_HCM_PROD_BASE_URL: z.string().url(),
  SENIOR_HCM_PROD_TENANT: z.string().min(1),
  SENIOR_HCM_PROD_WSDL: z.string().url(),

  SENIOR_HCM_USER: z.string().optional().default(''),
  SENIOR_HCM_PASSWORD: z.string().optional().default(''),
  SENIOR_HCM_ENCRYPTION: z.coerce.number().default(0),

  SENIOR_HCM_ALLOW_MUTATION: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  SENIOR_HCM_TLS_REJECT_UNAUTHORIZED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),

  PORT: z.coerce.number().default(3333),
});

const parsedEnv = envSchema.parse(process.env);

export type SeniorRuntimeEnv = 'homolog' | 'prod';

export interface SeniorHcmConfig {
  env: SeniorRuntimeEnv;
  baseUrl: string;
  tenant: string;
  wsdlUrl: string;
  user: string;
  password: string;
  encryption: number;
  allowMutation: boolean;
  tlsRejectUnauthorized: boolean;
}

export function getSeniorHcmConfig(): SeniorHcmConfig {
  const isProd = parsedEnv.SENIOR_HCM_ENV === 'prod';

  return {
    env: parsedEnv.SENIOR_HCM_ENV,
    baseUrl: isProd
      ? parsedEnv.SENIOR_HCM_PROD_BASE_URL
      : parsedEnv.SENIOR_HCM_HOMOLOG_BASE_URL,
    tenant: isProd
      ? parsedEnv.SENIOR_HCM_PROD_TENANT
      : parsedEnv.SENIOR_HCM_HOMOLOG_TENANT,
    wsdlUrl: isProd
      ? parsedEnv.SENIOR_HCM_PROD_WSDL
      : parsedEnv.SENIOR_HCM_HOMOLOG_WSDL,
    user: parsedEnv.SENIOR_HCM_USER,
    password: parsedEnv.SENIOR_HCM_PASSWORD,
    encryption: parsedEnv.SENIOR_HCM_ENCRYPTION,
    allowMutation: parsedEnv.SENIOR_HCM_ALLOW_MUTATION,
    tlsRejectUnauthorized: parsedEnv.SENIOR_HCM_TLS_REJECT_UNAUTHORIZED,
  };
}

export function getPublicSeniorStatus() {
  const config = getSeniorHcmConfig();

  return {
    env: config.env,
    baseUrl: config.baseUrl,
    tenant: config.tenant,
    wsdlUrl: config.wsdlUrl,
    userConfigured: Boolean(config.user),
    passwordConfigured: Boolean(config.password),
    encryption: config.encryption,
    allowMutation: config.allowMutation,
    tlsRejectUnauthorized: config.tlsRejectUnauthorized,
  };
}

export const appConfig = {
  port: parsedEnv.PORT,
};
