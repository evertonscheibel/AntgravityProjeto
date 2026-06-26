import { describe, expect, it } from 'vitest';
import { buildSeniorSoapEnvelope } from '../src/integrations/senior-hcm/senior-hcm.xml.js';

const envelope = buildSeniorSoapEnvelope({
  operation: 'FichaBasica',
  user: 'usuario.teste',
  password: 'senha<&>teste',
  encryption: 0,
  parametersXml: '<parameters></parameters>',
});

describe('Senior HCM SOAP envelope', () => {
  it('gera envelope SOAP com operação FichaBasica', () => {
    expect(envelope).toContain('<ser:FichaBasica>');
    expect(envelope).toContain('<parameters></parameters>');
  });

  it('escapa caracteres sensíveis no XML', () => {
    expect(envelope).toContain('senha&lt;&amp;&gt;teste');
  });
});
