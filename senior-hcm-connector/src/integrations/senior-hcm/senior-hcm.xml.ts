import { SoapEnvelopeInput } from './senior-hcm.types.js';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function buildSeniorSoapEnvelope(input: SoapEnvelopeInput): string {
  const operation = input.operation.trim();

  if (!/^[A-Za-z0-9_]+$/.test(operation)) {
    throw new Error('Nome de operação SOAP inválido. Use apenas letras, números e underline.');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.senior.com.br">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:${operation}>
      <user>${escapeXml(input.user)}</user>
      <password>${escapeXml(input.password)}</password>
      <encryption>${input.encryption}</encryption>
      ${input.parametersXml}
    </ser:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export function buildEmptyParametersXml(): string {
  return '<parameters></parameters>';
}
