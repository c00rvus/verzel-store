# Registro de execução

**Situação:** 70 casos executados: 63 aprovados, 7 reprovados e nenhum bloqueado. Dois bugs confirmados.

| Camada | Casos | Aprovados | Reprovados |
| --- | ---: | ---: | ---: |
| UI | 30 | 27 | 3 |
| API | 40 | 36 | 4 |
| **Total** | **70** | **63** | **7** |

## Ambiente

| Campo | Registro |
| --- | --- |
| Datas | 06 e 07/10/2026 |
| Aplicação | https://verzel-store.qa-test-verzel-store.workers.dev/ |
| Card / versão documentada | VZS-142 / 2.3.0 |
| Navegador registrado em 06/10 | Google Chrome 154.0.8037.98 |
| Navegador informado para 07/10 | Google Chrome 154.0.8037.98 |
| Fuso das execuções manuais de 06/10 | Brasília — America/Sao_Paulo (UTC-03:00) |
| Fuso em 07/10 | America/New_York (UTC-04:00) |
| Sistema | Windows 11 26H2 |
| API | Chamadas HTTP pontuais via PowerShell; timestamps UTC nos anexos |

**Horários:** execuções manuais de 06/10 em horário de Brasília (UTC-03:00); 16:58 e 17:03 correspondem ao horário dos registros. Tabelas de API e UI de 07/10 em UTC-04:00; timestamps UTC nos anexos. Quando o horário da execução não foi registrado, consta o horário do registro.

**Contagem:** cada exemplo Gherkin conta uma vez. Reexecuções e evidências compartilhadas não acrescentam casos. CT-006-API-01/02 também cobrem a fronteira de CT-011.

**Valores:** subtotal / desconto / frete / total, em reais. Frete 0,00 significa grátis. Esperado permanece conforme os requisitos.

## UI — resultado de cada variação

| Caso | Dados / variação | Data e hora | Esperado | Obtido | Status | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| CT-001 | Cupom `"BEMVINDO10"` | 07/10 10:16:46 | 100,00 / 10,00 / 19,90 / 109,90 | 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-016](evidencias.md#ev-016) |
| CT-002-espacos_fim | Cupom `"BEMVINDO10  "` | 07/10 10:17:18 | 100,00 / 10,00 / 19,90 / 109,90 | 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-017](evidencias.md#ev-017) |
| CT-002-espacos_inicio | Cupom `"  BEMVINDO10"` | 07/10 10:16:47 | 100,00 / 10,00 / 19,90 / 109,90 | 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-017](evidencias.md#ev-017) |
| CT-002-letras_e_espacos | Cupom `"  BeMvInDo10  "` | 07/10 10:17:19 | 100,00 / 10,00 / 19,90 / 109,90 | 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-017](evidencias.md#ev-017) |
| CT-002-letras_mistas | "BeMvInDo10" | 06/10 15:15 | 100,00 / 10,00 / 19,90 / 109,90 | Cupom normalizado; valores corretos | Aprovado | [EV-008](evidencias.md#ev-008) |
| CT-002-minusculas | "bemvindo10" | 07/10 11:19:40 | 100,00 / 10,00 / 19,90 / 109,90 | Cupom normalizado; valores corretos | Aprovado | [EV-037](evidencias.md#ev-037) |
| CT-003-UI | Cupom `"NAOEXISTE"` | 07/10 10:17:49 | Cupom inválido. 100,00 / 0,00 / 19,90 / 119,90 | Cupom inválido. 100,00 / 0,00 / 19,90 / 119,90 | Aprovado | [EV-018](evidencias.md#ev-018) |
| CT-004-UI | Cupom `"VERAO2026"` | 07/10 10:17:52 | Cupom expirado. 100,00 / 0,00 / 19,90 / 119,90 | Cupom expirado. 100,00 / 0,00 / 19,90 / 119,90 | Aprovado | [EV-019](evidencias.md#ev-019) |
| CT-005 | P005 ×1; remover e reaplicar BEMVINDO10 | 06/10 16:05 | Remover: 100,00 / 0,00 / 19,90 / 119,90; reaplicar: 100,00 / 10,00 / 19,90 / 109,90 | Valores corretos; campo vazio ao remover; um cupom ativo ao reaplicar | Aprovado | [EV-010](evidencias.md#ev-010) |
| CT-006-UI-com-cupom | P005 ×2; BEMVINDO10 | 07/10 11:20:00 | 200,00 / 20,00 / 0,00 / 180,00 | 200,00 / 20,00 / 19,90 / 199,90; BUG-001 | Reprovado | [EV-039](evidencias.md#ev-039) |
| CT-006-UI-sem-cupom | P005 ×2; sem cupom | 07/10 11:19:59 | 200,00 / 0,00 / 0,00 / 200,00 | 200,00 / 0,00 / 19,90 / 219,90; BUG-001 | Reprovado | [EV-038](evidencias.md#ev-038) |
| CT-007-UI-camiseta-garrafas | P001 ×1 + P008 ×3; BEMVINDO10 | 07/10 11:21:14 | 209,90 / 20,99 / 0,00 / 188,91 | Valores corretos; frete grátis antes do desconto | Aprovado | [EV-041](evidencias.md#ev-041) |
| CT-007-UI-jaqueta | P007 ×1; BEMVINDO10 | 07/10 11:21:02 | 229,90 / 22,99 / 0,00 / 206,91 | Valores corretos; frete grátis | Aprovado | [EV-040](evidencias.md#ev-040) |
| CT-008-UI | P004 ×1 + P008 ×3; BEMVINDO10 | 07/10 11:21:32 | 199,90 / 19,99 / 19,90 / 199,81; faltante 0,10 | Valores e mensagem corretos | Aprovado | [EV-042](evidencias.md#ev-042) |
| CT-009-UI | P005: 4 → 5 unidades; sem cupom | 07/10 10:19:06 | 5 unidades; aumento bloqueado; 500,00 / 0,00 / 0,00 / 500,00 | 5 unidades; botão desabilitado; aviso de limite; valores corretos | Aprovado | [EV-020](evidencias.md#ev-020) |
| CT-010-adicionar-remover | P005 ×1 + P008 ×1; remover P008; BEMVINDO10 | 07/10 10:18:39 | Adicionar: 150,00 / 15,00 / 19,90 / 154,90; remover: 100,00 / 10,00 / 19,90 / 109,90 | Valores corretos nos dois estados; faltante 50,00 → 100,00 | Aprovado | [EV-023](evidencias.md#ev-023) |
| CT-010-aumentar | P005: 1 → 2; BEMVINDO10 | 07/10 10:18:19 | 200,00 / 20,00 / 0,00 / 180,00 | 200,00 / 20,00 / 19,90 / 199,90; BUG-001 | Reprovado | [EV-021](evidencias.md#ev-021) |
| CT-010-diminuir | P005: 2 → 1; BEMVINDO10 | 07/10 10:18:19 | 100,00 / 10,00 / 19,90 / 109,90 | 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-022](evidencias.md#ev-022) |
| CT-011-UI | P004 ×1 + P008 ×3; BEMVINDO10; duas casas decimais | 07/10 11:21:33 | Valores monetários com duas casas decimais | Preços, itens, resumo e faltante com duas casas decimais | Aprovado | [EV-043](evidencias.md#ev-043) |
| CT-012-UI-01 | sem cupom; CEP 01310-100 | 07/10 10:19:40 | Pedido VZ- + 6 dígitos; 100,00 / 0,00 / 19,90 / 119,90 | VZ-390663; valores preservados: 100,00 / 0,00 / 19,90 / 119,90 | Aprovado | [EV-024](evidencias.md#ev-024) |
| CT-012-UI-02 | sem cupom; CEP 01310100 | 07/10 10:20:08 | Pedido VZ- + 6 dígitos; 100,00 / 0,00 / 19,90 / 119,90 | VZ-121185; valores preservados: 100,00 / 0,00 / 19,90 / 119,90 | Aprovado | [EV-025](evidencias.md#ev-025) |
| CT-012-UI-03 | com BEMVINDO10; CEP 01310-100 | 07/10 10:20:10 | Pedido VZ- + 6 dígitos; 100,00 / 10,00 / 19,90 / 109,90 | VZ-828121; valores preservados: 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-026](evidencias.md#ev-026) |
| CT-012-UI-04 | com BEMVINDO10; CEP 01310100 | 07/10 10:20:36 | Pedido VZ- + 6 dígitos; 100,00 / 10,00 / 19,90 / 109,90 | VZ-245635; valores preservados: 100,00 / 10,00 / 19,90 / 109,90 | Aprovado | [EV-027](evidencias.md#ev-027) |
| CT-013-UI-cep-nove-digitos | CEP: "013101000" | 07/10 10:23:33 | Bloquear pedido; indicar campo inválido; permitir correção | Informe um CEP com 8 dígitos. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-031](evidencias.md#ev-031) |
| CT-013-UI-cep-sete-digitos | CEP: "0131010" | 07/10 10:23:30 | Bloquear pedido; indicar campo inválido; permitir correção | Informe um CEP com 8 dígitos. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-030](evidencias.md#ev-030) |
| CT-013-UI-cep-vazio | CEP vazio | 07/10 10:30:08 | Bloquear pedido; indicar campo inválido; permitir correção | Informe o CEP. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-034](evidencias.md#ev-034) |
| CT-013-UI-email-sem-arroba | E-mail: "maria.example.com" | 07/10 10:22:22 | Bloquear pedido; indicar campo inválido; permitir correção | Informe um e-mail válido. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-029](evidencias.md#ev-029) |
| CT-013-UI-email-vazio | E-mail vazio | 07/10 10:29:46 | Bloquear pedido; indicar campo inválido; permitir correção | Informe o e-mail. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-033](evidencias.md#ev-033) |
| CT-013-UI-nome-sem-sobrenome | Nome: "Maria" | 07/10 10:21:39 | Bloquear pedido; indicar campo inválido; permitir correção | Informe nome e sobrenome. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-028](evidencias.md#ev-028) |
| CT-013-UI-nome-vazio | Nome vazio | 07/10 10:25:03 | Bloquear pedido; indicar campo inválido; permitir correção | Informe o nome completo. Sem confirmação; campo corrigido e editável. | Aprovado | [EV-032](evidencias.md#ev-032) |

**CT-002:** os três casos com espaços foram preenchidos exatamente como os exemplos Gherkin em 07/10. Os registros de 06/10 com espaços em minúsculas permanecem na EV-009; quantidade de espaços não registrada. A entrada em minúsculas foi reexecutada em 07/10, com comparativo próprio na EV-037.

**Histórico CT-006 com cupom:** captura original de 16:30 indisponível; condição equivalente nas EV-001 e EV-021. O comparativo próprio da nova coleta está na EV-039.

**CT-013:** os sete casos bloquearam o pedido e permitiram editar o campo inválido. Na EXP-01, o reenvio após corrigir o CEP confirmou VZ-815848. E-mail e CEP vazios foram reexecutados para completar as capturas; horários anteriores preservados no JSON.

**Registros da rodada:** [UI](../evidencias/execucao-2026-10-07/ui-resultados.json) e [etapas das capturas](../evidencias/execucao-2026-10-07/ui-capturas.json).

## API — resultado de cada variação

Requisições, respostas, campos e mensagens completos nos anexos EV-002, EV-006 e EV-035. IDs antigos estão associados aos casos atuais abaixo.

| Caso | Requisição / dados | Data e hora | Esperado | Obtido | Status | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| CT-003-API-C | POST /api/carrinho/calcular; P005 ×1; INEXISTENTE | 06/10 14:07:11 | 200; 100,00 / 0,00 / 19,90 / 119,90; cupom rejeitado sem desconto | 200; 100,00 / 0,00 / 19,90 / 119,90; Cupom inválido. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-003-API-P | POST /api/pedidos; P005 ×1; INEXISTENTE; CEP 01310-100 | 06/10 14:07:11 | 422 CUPOM_INVALIDO | 422 CUPOM_INVALIDO; campo cupom; Cupom inválido. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-004-API-C | POST /api/carrinho/calcular; P005 ×1; VERAO2026 | 06/10 14:07:11 | 200; 100,00 / 0,00 / 19,90 / 119,90; cupom rejeitado sem desconto | 200; 100,00 / 0,00 / 19,90 / 119,90; Cupom expirado. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-004-API-P | POST /api/pedidos; P005 ×1; VERAO2026; CEP 01310-100 | 06/10 14:07:11 | 422 CUPOM_EXPIRADO | 422 CUPOM_EXPIRADO; campo cupom; Cupom expirado. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-006-API-01 | POST /api/carrinho/calcular; P005 ×2; BEMVINDO10 | 06/10 14:06:36 | 200; 200,00 / 20,00 / 0,00 / 180,00; frete grátis | 200; 200,00 / 20,00 / 19,90 / 199,90; freteGratis=false; BUG-001 | Reprovado | [EV-002](evidencias.md#ev-002) |
| CT-006-API-02 | POST /api/carrinho/calcular; P005 ×2 | 06/10 14:06:36 | 200; 200,00 / 0,00 / 0,00 / 200,00; frete grátis | 200; 200,00 / 0,00 / 19,90 / 219,90; freteGratis=false; BUG-001 | Reprovado | [EV-002](evidencias.md#ev-002) |
| CT-009-API-5C | POST /api/carrinho/calcular; P005 ×5 | 06/10 14:07:12 | 200; 500,00 / 0,00 / 0,00 / 500,00 | 200; 500,00 / 0,00 / 0,00 / 500,00; faltante 0,00 | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-009-API-5P | POST /api/pedidos; P005 ×5; CEP 01310-100 | 07/10 10:15:22 | 201; 500,00 / 0,00 / 0,00 / 500,00; número VZ- + 6 dígitos; criadoEm ISO8601 | 201; 500,00 / 0,00 / 0,00 / 500,00; VZ-771001; data e cliente corretos | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-009-API-6C | POST /api/carrinho/calcular; P005 ×6 | 06/10 14:07:12 | 422 QUANTIDADE_MAXIMA_EXCEDIDA | 200; 6 unidades; total 600,00; BUG-002 | Reprovado | [EV-006](evidencias.md#ev-006) |
| CT-009-API-6P | POST /api/pedidos; P005 ×6; CEP 01310-100 | 07/10 10:15:22 | 422 QUANTIDADE_MAXIMA_EXCEDIDA | 201; 6 unidades; total 600,00; VZ-056227; BUG-002 | Reprovado | [EV-035](evidencias.md#ev-035) |
| CT-011-API-01 | POST /api/carrinho/calcular; P004 ×1, P008 ×3; BEMVINDO10 | 06/10 14:07:12 | 200; 199,90 / 19,99 / 19,90 / 199,81 | 200; 199,90 / 19,99 / 19,90 / 199,81; faltante 0,10 | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-011-API-02 | POST /api/carrinho/calcular; P007 ×1; BEMVINDO10 | 07/10 10:15:22 | 200; 229,90 / 22,99 / 0,00 / 206,91 | 200; 229,90 / 22,99 / 0,00 / 206,91; faltante 0,00 | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-011-API-03 | POST /api/carrinho/calcular; P001 ×1, P008 ×3; BEMVINDO10 | 06/10 14:07:10 | 200; 209,90 / 20,99 / 0,00 / 188,91 | 200; 209,90 / 20,99 / 0,00 / 188,91; faltante 0,00 | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-012-API-01 | POST /api/pedidos; P005 ×1; BEMVINDO10; CEP 01310-100 | 06/10 14:07:12 | 201; 100,00 / 10,00 / 19,90 / 109,90; número VZ- + 6 dígitos; criadoEm ISO8601 | 201; 100,00 / 10,00 / 19,90 / 109,90; VZ-282055; data e cliente corretos | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-012-API-02 | POST /api/pedidos; P005 ×1; BEMVINDO10; CEP 01310100 | 06/10 14:07:12 | 201; 100,00 / 10,00 / 19,90 / 109,90; número VZ- + 6 dígitos; criadoEm ISO8601 | 201; 100,00 / 10,00 / 19,90 / 109,90; VZ-070557; data e cliente corretos | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-013-API-01 | POST /api/pedidos; cliente `{"nome":"Maria","email":"maria@example.com","cep":"01310-100"}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.nome: Informe nome e sobrenome. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-02 | POST /api/pedidos; cliente `{"nome":"Maria Silva","email":"invalido","cep":"01310-100"}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.email: Informe um e-mail válido. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-03 | POST /api/pedidos; cliente `{"nome":"Maria Silva","email":"maria@example.com","cep":"123"}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.cep: Informe um CEP com 8 dígitos. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-04 | POST /api/pedidos; cliente `{"nome":"","email":"maria@example.com","cep":"01310-100"}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.nome: Informe o nome completo. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-05 | POST /api/pedidos; cliente `{"nome":"Maria Silva","email":"","cep":"01310-100"}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.email: Informe o e-mail. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-06 | POST /api/pedidos; cliente `{"nome":"Maria Silva","email":"maria@example.com","cep":""}` | 07/10 10:15:23 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.cep: Informe o CEP. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-013-API-tres-campos | POST /api/pedidos; cliente `{"nome":"Maria","email":"invalido","cep":"123"}` | 06/10 14:07:12 | 422 DADOS_INVALIDOS | 422 DADOS_INVALIDOS; cliente.nome: Informe nome e sobrenome., cliente.email: Informe um e-mail válido., cliente.cep: Informe um CEP com 8 dígitos. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-014-API-P005 | GET /api/produtos/P005 | 06/10 14:07:10 | 200; P005, nome, preço 100,00, descrição e categoria | 200; campos consistentes com catálogo | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-014-API-P999 | GET /api/produtos/P999 | 06/10 14:07:11 | 404 PRODUTO_NAO_ENCONTRADO | 404 PRODUTO_NAO_ENCONTRADO; Produto P999 não encontrado. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-014-API-catalogo | GET /api/produtos | 06/10 14:07:10 | 200; catálogo com 8 produtos e campos documentados | 200; IDs, nomes, preços, descrições e categorias corretos | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-015-API-01 | POST /api/carrinho/calcular; `{}` | 07/10 10:15:23 | 422 ITENS_OBRIGATORIOS | 422 ITENS_OBRIGATORIOS; campo itens; Informe ao menos um item. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-02 | POST /api/carrinho/calcular; `{"itens":[]}` | 07/10 10:15:23 | 422 ITENS_OBRIGATORIOS | 422 ITENS_OBRIGATORIOS; campo itens; Informe ao menos um item. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-03 | POST /api/carrinho/calcular; `{"itens":[null]}` | 07/10 10:15:23 | 422 ITEM_INVALIDO | 422 ITEM_INVALIDO; campo itens[0]; Cada item deve ser um objeto com produtoId e quantidade. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-04 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P999","quantidade":1}]}` | 07/10 10:15:24 | 422 PRODUTO_NAO_ENCONTRADO | 422 PRODUTO_NAO_ENCONTRADO; campo itens[0].produtoId; Produto P999 não encontrado. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-05 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":1},{"produtoId":"P005","quantidade":1}]}` | 06/10 14:07:13 | 422 ITEM_DUPLICADO | 422 ITEM_DUPLICADO; campo itens[1].produtoId; O produto P005 aparece mais de uma vez. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-015-API-06 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":0}]}` | 06/10 14:07:13 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-015-API-07 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":-1}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-08 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":1.5}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-09 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":"abc"}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-10 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":null}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-11 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":true}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-015-API-12 | POST /api/carrinho/calcular; `{"itens":[{"produtoId":"P005","quantidade":"1"}]}` | 07/10 10:15:24 | 422 QUANTIDADE_INVALIDA | 422 QUANTIDADE_INVALIDA; campo itens[0].quantidade; A quantidade deve ser um número inteiro maior ou igual a 1. | Aprovado | [EV-035](evidencias.md#ev-035) |
| CT-016-API-json-invalido | POST /api/carrinho/calcular; `{"itens":` | 06/10 14:07:13 | 400 JSON_INVALIDO | 400 JSON_INVALIDO; O corpo da requisição deve ser um objeto JSON válido. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-016-API-metodo-invalido | GET /api/pedidos | 06/10 14:07:14 | 405 METODO_NAO_PERMITIDO | 405 METODO_NAO_PERMITIDO; O método GET não é permitido nesta rota. | Aprovado | [EV-006](evidencias.md#ev-006) |
| CT-016-API-rota-inexistente | GET /api/rota-inexistente | 06/10 14:07:13 | 404 ROTA_NAO_ENCONTRADA | 404 ROTA_NAO_ENCONTRADA; Rota não encontrada. | Aprovado | [EV-006](evidencias.md#ev-006) |

## Sessão exploratória EXP-01

**Objetivo:** verificar limpeza do cupom, isolamento do carrinho por aba e recuperação após erro no checkout.

**Data:** 07/10/2026. **Início:** 10:28:28. **Fim:** 10:30:09. **Duração:** 101 segundos (1 min 41 s). **Ambiente:** Windows, UTC-04:00.

| Ação | Resultado |
| --- | --- |
| Aplicar cupom, esvaziar e readicionar mochila | Cupom removido; total 119,90 após readicionar |
| Abrir nova aba e adicionar garrafa | Nova aba: total 69,90; original preserva mochila e total 119,90 |
| Rejeitar campos vazios, corrigir CEP e reenviar | Pedido VZ-815848 confirmado; total 119,90; carrinho vazio |

**Achados:** nenhum novo defeito. [EV-036](evidencias.md#ev-036) · [Registro completo](../evidencias/execucao-2026-10-07/exploratoria.json).

## Bugs confirmados

- BUG-001: frete indevido no subtotal exato de 200,00; cinco casos reprovados (3 UI e 2 API).
- BUG-002: seis unidades aceitas no cálculo e no pedido; dois casos API reprovados.

## Histórico das reexecuções de UI

A matriz apresenta a coleta mais recente dos sete casos reexecutados em 07/10/2026. Os registros anteriores de 06/10 permanecem abaixo, sem acrescentar casos à contagem. CT-008-UI e CT-011-UI compartilhavam a mesma captura do carrinho; os novos comparativos são próprios. Horários e limitações originais foram preservados.

| Caso | Data e hora original | Obtido original | Status | Evidência original |
| --- | --- | --- | --- | --- |
| CT-002-minusculas | 06/10 15:02 | Cupom normalizado; valores corretos | Aprovado | [EV-007](evidencias.md#ev-007) |
| CT-006-UI-sem-cupom | 06/10 16:30 | 200,00 / 0,00 / 19,90 / 219,90; BUG-001 | Reprovado | [EV-012](evidencias.md#ev-012) |
| CT-006-UI-com-cupom | 06/10 16:30 | 200,00 / 20,00 / 19,90 / 199,90; BUG-001 | Reprovado | [EV-011](evidencias.md#ev-011) |
| CT-007-UI-jaqueta | 06/10 16:39 | Valores corretos; frete grátis | Aprovado | [EV-013](evidencias.md#ev-013) |
| CT-007-UI-camiseta-garrafas | 06/10 16:58 | Valores corretos; frete grátis antes do desconto | Aprovado | [EV-014](evidencias.md#ev-014) |
| CT-008-UI | 06/10 17:03 | Valores e mensagem corretos | Aprovado | [EV-015](evidencias.md#ev-015) |
| CT-011-UI | 06/10 17:03 | Preços, itens, resumo e faltante com duas casas decimais | Aprovado | [EV-015](evidencias.md#ev-015) |

Coleta atual: EV-037 a EV-043. [Dados e timestamps UTC](../evidencias/revisao-2026-10-07/ui-complementos.json).

[Especificações](cenarios.md) · [Bugs](bugs.md) · [Evidências](evidencias.md)

## Automação Playwright

**Execução:** 07/10/2026, 13:32:20 a 13:32:43, America/New_York (UTC-04:00). **Duração:** 23,1 segundos.

**Ambiente:** Windows, Node.js 22.23.3, Playwright 1.63.0 e Chromium 153.0.8010.12. Um processo, sem repetição automática.

**Organização:** specs de carrinho, checkout e API. Quatro Page Objects e o componente `ResumoPedido` centralizam os locators conferidos no DOM.

**Resultado:** 9 testes; 6 aprovados, 3 falhas conhecidas esperadas, 0 falhas inesperadas e 0 ignorados. Os 70 casos manuais permanecem na matriz anterior.

| Teste | Fluxo | Resultado |
| --- | --- | --- |
| AUTO-001 | Aplicar cupom em minúsculas com espaços; remover e reaplicar | Aprovado |
| AUTO-002 | Rejeitar cupom inexistente | Aprovado |
| AUTO-003 | Rejeitar cupom expirado | Aprovado |
| AUTO-004 | Frete pelo subtotal de R$ 209,90; total R$ 188,91 após desconto | Aprovado |
| AUTO-005 | Frete no subtotal de R$ 200,00 com cupom | Falha conhecida: BUG-001; frete R$ 19,90 e total R$ 199,90; esperados grátis e R$ 180,00 |
| AUTO-006 | Limite de cinco unidades; recalcular para quatro | Aprovado |
| AUTO-007 | Bloquear CEP inválido; corrigir e confirmar pedido com valores e dados corretos | Aprovado |
| AUTO-008 | Rejeitar seis unidades na API de cálculo | Falha conhecida: BUG-002; HTTP 200; esperado 422 |
| AUTO-009 | Rejeitar seis unidades na API de pedido | Falha conhecida: BUG-002; HTTP 201; esperado 422, sem pedido criado |

As falhas conhecidas usam `testInfo.fail` somente após confirmar a assinatura do bug. As assertivas continuam exigindo o requisito correto. O Playwright aceita essas três falhas na execução, sem classificá-las aqui como aprovações funcionais.

`npm ci`, `npm run test:install` e `npm test` foram conferidos. A primeira tentativa apresentou erro de certificado nas duas chamadas de API; a execução final usou `NODE_USE_SYSTEM_CA=1`, mantendo HTTPS validado pelos certificados confiáveis do Windows. A solução está no README.

[EV-044: capturas e respostas por teste](evidencias.md#ev-044--automação-playwright) · [Registro da execução](../evidencias/automacao/2026-10-07/resultado.json).
