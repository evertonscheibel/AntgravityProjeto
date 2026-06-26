# Teste no SoapUI

Use este roteiro antes de desenvolver chamadas reais no backend.

## 1. Criar projeto SOAP

1. Abrir SoapUI.
2. Clicar em `File > New SOAP Project`.
3. Nome sugerido: `Senior HCM Rubi FichaBasica`.
4. WSDL inicial de homologação:

```text
https://webh01.seniorcloud.com.br:30301/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

5. Confirmar se o SoapUI carrega operações e bindings.

## 2. Verificar operação

A operação esperada é similar a:

```text
FichaBasica
```

A estrutura comum deve conter:

```xml
<user>usuario_sgu</user>
<password>senha_sgu</password>
<encryption>0</encryption>
<parameters>
  <!-- campos conforme documentação -->
</parameters>
```

## 3. Testar somente homologação

Não execute testes em produção até confirmar com a Senior se o payload altera dados.

## 4. Resultado esperado

Um retorno SOAP pode conter campos como:

```xml
<erroExecucao></erroExecucao>
<numEmp>...</numEmp>
<numCad>...</numCad>
```

Se `erroExecucao` vier preenchido, tratar como falha funcional.

## 5. Erros comuns

### 503 no WSDL

Possíveis causas:

- WSDL errado.
- Prefixo errado: `sapiens` em vez de `rubi`.
- Serviço não publicado.
- Bloqueio no F5/gateway.

### Falha de autenticação

Possíveis causas:

- Usuário SGU sem permissão.
- Senha incorreta.
- Conta expirada.
- Valor de `encryption` incorreto.

### Erro funcional no retorno SOAP

Possíveis causas:

- Campo obrigatório ausente.
- Empresa/cadastro inválido.
- Operação usada para finalidade incorreta.

## 6. Depois do SoapUI

Após validar a chamada no SoapUI, copiar o XML funcional e adaptar em:

```text
src/integrations/senior-hcm/services/ficha-basica.service.ts
```
