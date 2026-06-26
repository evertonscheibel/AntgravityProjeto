# Prompt para Codex / Antigravity

Você está trabalhando no projeto `senior-hcm-connector`, um backend Node.js + TypeScript para integração com WebServices SOAP Senior HCM XT/Rubi.

## Contexto de negócio

A Frizelo usa Senior HCM XT no ambiente Cloud Senior SIRIUS. A Senior informou que as APIs REST Senior X não são aplicáveis ao contrato atual. O consumo deve ser feito por WebServices HCM dos módulos.

Serviço inicial:

```text
com.senior.g5.rh.fp.fichaBasica
```

WSDL homologação:

```text
https://webh01.seniorcloud.com.br:30301/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

WSDL produção:

```text
https://webp01.seniorcloud.com.br:30421/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

## Restrições obrigatórias

1. Não commitar `.env`.
2. Não gravar senha em código, teste ou documentação.
3. Não imprimir senha em log.
4. Não liberar operação real enquanto `SENIOR_HCM_ALLOW_MUTATION=false`.
5. Assumir que `fichaBasica` pode alterar dados até prova contrária.
6. Trabalhar primeiro em homologação.
7. Transformar XML em JSON somente depois de filtrar dados sensíveis.

## Tarefas iniciais

1. Validar se `GET /senior/wsdl` retorna o WSDL Rubi.
2. Ajustar client SOAP se a Senior exigir SOAPAction específica.
3. Criar parsing robusto para `erroExecucao`.
4. Criar DTOs para retorno padronizado:

```ts
interface SeniorOperationResult<T> {
  ok: boolean;
  status: number;
  erroExecucao?: string;
  data?: T;
  rawXml?: string;
}
```

5. Criar serviço seguro para consulta, se a Senior confirmar qual operação é apenas leitura.
6. Criar ferramenta para LLM apenas após o conector estar validado.

## Endpoints atuais

```http
GET /health
GET /senior/status
GET /senior/wsdl
POST /senior/soap/dry-run
POST /senior/ficha-basica/dry-run
POST /senior/ficha-basica/enviar-raw
```

## Resultado esperado do MVP

Um backend que permita ao LLM chamar funções controladas como:

```text
consultar_colaborador_senior
consultar_status_senior
validar_wsdl_senior
```

O LLM nunca deve receber usuário, senha, token, WSDL com segredo ou XML bruto com dados sensíveis.
