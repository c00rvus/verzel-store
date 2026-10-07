# Bugs

**Datas:** 06 e 07/10/2026. **Aplicação:** https://verzel-store.qa-test-verzel-store.workers.dev/. **Card / versão documentada:** VZS-142 / 2.3.0.

| ID | Título | Severidade / prioridade | Status |
| --- | --- | --- | --- |
| [BUG-001](#bug-001) | Frete cobrado em subtotal de R$ 200,00 | Alta / alta | Confirmado na UI e API de cálculo |
| [BUG-002](#bug-002) | API aceita seis unidades no cálculo e no pedido | Média / alta | Confirmado no cálculo e na criação de pedidos |

## BUG-001

**Requisito:** CA06 e CA08 — frete grátis para subtotal ≥ R$ 200,00, antes do desconto.

**Cenários:** CT-006, aumento em CT-010 e fronteira em CT-011.

**Ambiente:** Windows 11 26H2; Google Chrome 154.0.8037.98 no registro de 06/10 às 16:30, horário de Brasília (UTC-03:00); API via PowerShell.

**Dados:** carrinho vazio; P005 — Mochila Urbana 20L, R$ 100,00 por unidade.

**Passos:**

1. Adicionar uma mochila e aplicar BEMVINDO10.
2. Aumentar a quantidade para duas e conferir o resumo.
3. Remover o cupom e conferir novamente.

| Valor | Esperado com cupom | Obtido com cupom | Esperado sem cupom | Obtido sem cupom |
| --- | ---: | ---: | ---: | ---: |
| Subtotal | R$ 200,00 | R$ 200,00 | R$ 200,00 | R$ 200,00 |
| Desconto | R$ 20,00 | R$ 20,00 | R$ 0,00 | R$ 0,00 |
| Frete | Grátis | R$ 19,90 | Grátis | R$ 19,90 |
| Faltante | R$ 0,00 | R$ 0,00 | R$ 0,00 | R$ 0,00 |
| Total | R$ 180,00 | R$ 199,90 | R$ 200,00 | R$ 219,90 |

**API:** POST `/api/carrinho/calcular`, `Content-Type: application/json`:

```json
{"itens":[{"produtoId":"P005","quantidade":2}],"cupom":"BEMVINDO10"}
```

HTTP 200: `frete: 19.9`, `freteGratis: false`, `total: 199.9`. Sem o campo `cupom`, total `219.9`.

**Impacto:** acréscimo indevido de R$ 19,90 ao total.

**Reprodução:** UI ao aumentar de uma para duas, diminuir de cinco para duas e remover o cupom; API com e sem cupom. Subtotal R$ 209,90 com cupom apresentou frete grátis.

**Evidências:** [com cupom — revisão](../evidencias/revisao-ambiente/frete-subtotal-200-com-cupom.png), [sem cupom](../evidencias/CT-006-frete-200-sem-cupom.png), [API](../evidencias/revisao-ambiente/api-limite-frete.json) e [registro às 16:30](execucao.md).

**Reprodução em 07/10/2026:** CT-010-aumentar, às 10:18:19 em America/New_York. Uma mochila com cupom totalizava R$ 109,90; aumentar para duas manteve frete R$ 19,90 e total R$ 199,90, esperado R$ 180,00. Capturas [antes](../evidencias/execucao-2026-10-07/CT-010-aumentar-antes.png) e [depois](../evidencias/execucao-2026-10-07/CT-010-aumentar-depois.png).

**Comparativos próprios de CT-006 em 07/10/2026:** frete indevido confirmado às 11:19:59 sem cupom e 11:20:00 com cupom, em UTC-04:00.

| Caso | Antes | Depois | Registro |
| --- | --- | --- | --- |
| CT-006-UI-sem-cupom | [Captura](../evidencias/revisao-2026-10-07/CT-006-UI-sem-cupom-antes.png) | [Captura](../evidencias/revisao-2026-10-07/CT-006-UI-sem-cupom-depois.png) | [JSON](../evidencias/cenarios/CT-006-UI-sem-cupom/registro.json) |
| CT-006-UI-com-cupom | [Captura](../evidencias/revisao-2026-10-07/CT-006-UI-com-cupom-antes.png) | [Captura](../evidencias/revisao-2026-10-07/CT-006-UI-com-cupom-depois.png) | [JSON](../evidencias/cenarios/CT-006-UI-com-cupom/registro.json) |

Índice das etapas: [EV-038](evidencias.md#ev-038) e [EV-039](evidencias.md#ev-039).

**Causa:** não investigada.

## BUG-002

**Requisito:** CA10 — máximo de cinco unidades por produto na UI e API.

**Cenários:** CT-009-API-6C e CT-009-API-6P. **Ambiente:** PowerShell; timestamps UTC nas evidências.

**Passos:** enviar POST `/api/carrinho/calcular` com `Content-Type: application/json` e o corpo:

```json
{"itens":[{"produtoId":"P005","quantidade":6}]}
```

Para reproduzir na criação de pedido, enviar POST `/api/pedidos` com o mesmo cabeçalho e o corpo:

```json
{"itens":[{"produtoId":"P005","quantidade":6}],"cliente":{"nome":"Maria Silva","email":"maria@example.com","cep":"01310-100"}}
```

**Esperado em ambas as rotas:** HTTP 422; `erro.codigo: QUANTIDADE_MAXIMA_EXCEDIDA`; nenhum pedido criado.

| Rota | Data | Obtido |
| --- | --- | --- |
| `/api/carrinho/calcular` | 06/10/2026 | HTTP 200; seis unidades; subtotal R$ 600,00, frete zero e total R$ 600,00. |
| `/api/pedidos` | 07/10/2026, 10:15:22 America/New_York | HTTP 201; pedido VZ-056227 com seis unidades; subtotal R$ 600,00, frete zero e total R$ 600,00. |

**Impacto:** cálculo e criação de pedido aceitam quantidade acima do limite.

**Reprodução:** uma chamada com seis unidades em cada rota. Controles com cinco retornaram 200 no cálculo e 201 no pedido. A UI bloqueia a sexta unidade.

**Evidências:** [registro exclusivo do cálculo CT-009-API-6C](../evidencias/cenarios/CT-009-API-6C/registro.json), [registro exclusivo do pedido CT-009-API-6P](../evidencias/cenarios/CT-009-API-6P/registro.json) e [limite na UI](../evidencias/revisao-ambiente/quantidade-cinco-interface.png). Fontes históricas preservadas nas EV-004, EV-006 e EV-035.

**Causa:** não investigada.
