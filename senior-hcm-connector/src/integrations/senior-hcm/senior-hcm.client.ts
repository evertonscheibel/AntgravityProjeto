import https from 'node:https';
import axios, { AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { getSeniorHcmConfig, SeniorHcmConfig } from '../../config/senior.config.js';
import { buildSeniorSoapEnvelope } from './senior-hcm.xml.js';
import { SoapCallInput, SoapCallResult, WsdlFetchResult } from './senior-hcm.types.js';

export class SeniorHcmClient {
  private readonly config: SeniorHcmConfig;
  private readonly http: AxiosInstance;

  constructor(config: SeniorHcmConfig = getSeniorHcmConfig()) {
    this.config = config;
    this.http = axios.create({
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: config.tlsRejectUnauthorized,
      }),
      validateStatus: () => true,
    });
  }

  async fetchWsdl(): Promise<WsdlFetchResult> {
    const response = await this.http.get<string>(this.config.wsdlUrl, {
      responseType: 'text',
      headers: {
        Accept: 'text/xml, application/xml, text/plain, */*',
      },
    });

    const text = String(response.data ?? '');

    return {
      status: response.status,
      statusText: response.statusText,
      url: this.config.wsdlUrl,
      preview: text.slice(0, 4000),
      isWsdl: text.includes('definitions') || text.includes('wsdl:'),
    };
  }

  buildEnvelope(input: SoapCallInput): string {
    return buildSeniorSoapEnvelope({
      operation: input.operation,
      user: this.config.user,
      password: this.config.password,
      encryption: this.config.encryption,
      parametersXml: input.parametersXml,
    });
  }

  async callSoap(input: SoapCallInput): Promise<SoapCallResult> {
    if (!this.config.user || !this.config.password) {
      throw new Error('SENIOR_HCM_USER e SENIOR_HCM_PASSWORD precisam estar configurados no .env.');
    }

    const endpointUrl = this.config.wsdlUrl.replace(/\?wsdl$/i, '');
    const envelope = this.buildEnvelope(input);

    const response = await this.http.post<string>(endpointUrl, envelope, {
      responseType: 'text',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: input.soapAction ?? '',
      },
    });

    const rawXml = String(response.data ?? '');
    let parsed: unknown;

    try {
      parsed = await parseStringPromise(rawXml, {
        explicitArray: false,
        ignoreAttrs: false,
        trim: true,
      });
    } catch {
      parsed = undefined;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      rawXml,
      parsed,
    };
  }
}
