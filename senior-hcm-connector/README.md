# Senior HCM Connector

Base backend para integração com **Senior HCM XT / WebServices Rubi SOAP**, preparada para uso por Codex, Antigravity ou outro LLM por meio de ferramentas controladas.

## Contexto

A Senior confirmou que, para o ambiente da Frizelo, o caminho correto não é a API REST Senior X (`api.senior.com.br`). Como a empresa utiliza módulos XT, a integração deve ser feita via WebServices HCM de cada módulo.

Serviço inicial escolhido:

```text
com.senior.g5.rh.fp.fichaBasica
```

WSDL Rubi síncrono de homologação:

```text
https://webh01.seniorcloud.com.br:30301/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

WSDL Rubi síncrono de produção:

```text
https://webp01.seniorcloud.com.br:30421/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

## Regras de segurança

- Não commitar `.env`.
- Não colocar usuário/senha SGU em prompt de LLM.
- Não usar usuário pessoal para integração definitiva.
- Usar usuário técnico SGU com validade e permissões controladas.
- Começar em homologação.
- Manter `SENIOR_HCM_ALLOW_MUTATION=false` até validar exatamente quais operações são apenas consulta e quais alteram dados.

## Instalação

```bash
cd senior-hcm-connector
npm install
cp .env.example .env
npm run dev
```

A API local sobe em:

```text
http://localhost:3333
```

## Endpoints locais

```http
GET /health
GET /senior/status
GET /senior/wsdl
POST /senior/soap/dry-run
POST /senior/ficha-basica/enviar-raw
```

### `GET /senior/wsdl`

Valida se o WSDL configurado responde.

### `POST /senior/soap/dry-run`

Gera o envelope SOAP localmente sem enviar para a Senior.

Exemplo:

```json
{
  "operation": "FichaBasica",
  "parametersXml": "<parameters></parameters>"
}
```

### `POST /senior/ficha-basica/enviar-raw`

Envia chamada SOAP para a Senior. Por segurança, fica bloqueado enquanto `SENIOR_HCM_ALLOW_MUTATION=false`.

## Para Codex

Leia primeiro:

```text
docs/CODEX_PROMPT.md
```

Objetivo inicial do Codex:

1. Validar carregamento do WSDL Rubi.
2. Importar o contrato SOAP.
3. Confirmar assinatura da operação `FichaBasica`.
4. Ajustar `parametersXml` conforme documentação oficial.
5. Criar testes com mock XML.
6. Só habilitar chamada real depois de confirmar se a operação é segura para consulta.

## Observação crítica

O serviço `fichaBasica` pode estar relacionado a manutenção/alteração da ficha básica. Não execute chamadas reais em produção sem confirmação da Senior sobre a operação e payload.
