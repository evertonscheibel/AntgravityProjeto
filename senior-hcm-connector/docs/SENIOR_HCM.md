# Senior HCM WebServices - Frizelo

## Decisão técnica

A Senior informou que a Frizelo não deve usar as APIs REST Senior X para este caso, pois não possui a rotina/painel de gestão necessário. Como o ambiente utiliza módulos XT, a integração deve ser realizada via **WebServices HCM**.

## Ambientes informados

### Homologação

```text
Servidor: VMAPLH01SEN
Tenant: FRIZE_21827_H
Base URL: https://webh01.seniorcloud.com.br:30301
```

### Produção

```text
Servidor: VMAPLP01SEN
Tenant: FRIZE_21827_P
Base URL: https://webp01.seniorcloud.com.br:30421
```

## Serviço inicial

```text
com.senior.g5.rh.fp.fichaBasica
```

A documentação aponta que o WSDL correto é do **Rubi**, não do Sapiens.

### WSDL homologação

```text
https://webh01.seniorcloud.com.br:30301/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

### WSDL produção

```text
https://webp01.seniorcloud.com.br:30421/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

## Erro corrigido

Foi testado inicialmente o path abaixo:

```text
/g5-senior-services/sapiens_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

Esse path é incorreto para o serviço da documentação HCM/Rubi. O correto é:

```text
/g5-senior-services/rubi_Synccom_senior_g5_rh_fp_fichaBasica?wsdl
```

## Testes de rede já realizados

DNS e porta foram validados a partir da rede da Frizelo:

```text
webh01.seniorcloud.com.br -> 159.60.137.78
webp01.seniorcloud.com.br -> 159.60.137.78

Test-NetConnection webh01.seniorcloud.com.br -Port 30301 -> True
Test-NetConnection webp01.seniorcloud.com.br -Port 30421 -> True
```

## Autenticação

A documentação do WebService mostra campos comuns:

```xml
<user>...</user>
<password>...</password>
<encryption>0</encryption>
<parameters>...</parameters>
```

O usuário deve ser um usuário técnico do SGU, com validade e permissões controladas. Não usar credenciais pessoais no código.

## Pendências antes de produção

1. Confirmar com a Senior se `FichaBasica` é consulta, alteração ou ambos.
2. Confirmar payload seguro para homologação.
3. Confirmar valor correto do parâmetro `encryption`.
4. Confirmar usuário técnico definitivo.
5. Criar matriz de permissões por ferramenta do LLM.
6. Filtrar dados sensíveis antes de retornar ao LLM.
