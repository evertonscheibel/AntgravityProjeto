export interface SoapEnvelopeInput {
  operation: string;
  user: string;
  password: string;
  encryption: number;
  parametersXml: string;
}

export interface SoapCallInput {
  operation: string;
  parametersXml: string;
  soapAction?: string;
}

export interface SoapCallResult {
  status: number;
  statusText: string;
  rawXml: string;
  parsed?: unknown;
}

export interface WsdlFetchResult {
  status: number;
  statusText: string;
  url: string;
  preview: string;
  isWsdl: boolean;
}
