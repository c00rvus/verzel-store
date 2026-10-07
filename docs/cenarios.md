# Cenários de teste

Especificação em Gherkin dos 16 grupos CT-001 a CT-016: **32 definições e 70 casos com exemplos expandidos**. Os 70 casos foram executados; resultados em [execução](execucao.md).

## Arquivos dos cenários

| Arquivo | Conteúdo | Definições | Casos com exemplos expandidos |
| --- | --- | ---: | ---: |
| [Carrinho](gherkin/carrinho.feature) | Cupons, frete, quantidade, atualização e apresentação monetária | 14 | 19 |
| [Checkout](gherkin/checkout.feature) | Dados válidos e inválidos do cliente na interface | 2 | 11 |
| [API](gherkin/api.feature) | Catálogo, cálculos, pedidos e contratos de erro | 16 | 40 |
| **Total** | **16 grupos de cenários** | **32** | **70** |

## Critérios de aceite

| ID | Descrição |
| --- | --- |
| CA01 | Aplicar 10% de desconto sobre os produtos com `BEMVINDO10`. |
| CA02 | Aceitar minúsculas, letras misturadas e espaços externos no cupom. |
| CA03 | Mostrar “Cupom inválido.” sem conceder desconto. |
| CA04 | Mostrar “Cupom expirado.” para `VERAO2026`, sem desconto. |
| CA05 | Manter apenas um cupom ativo e permitir remoção e reaplicação. |
| CA06 | Conceder frete grátis no subtotal de R$ 200,00 ou acima. |
| CA07 | Cobrar R$ 19,90 abaixo de R$ 200,00 e informar o valor faltante. |
| CA08 | Calcular a condição de frete pelo subtotal antes do desconto. |
| CA09 | Aplicar desconto somente aos produtos, mantendo o frete integral. |
| CA10 | Limitar a cinco unidades por produto na interface e na API. |
| CA11 | Conferir a precisão dos valores e apresentar duas casas decimais. |

## Rastreabilidade

| ID | Objetivo | Critérios / escopo | Arquivos |
| --- | --- | --- | --- |
| CT-001 | Aplicar desconto de 10% sem descontar o frete | CA01, CA07, CA09 | [Carrinho](gherkin/carrinho.feature) |
| CT-002 | Normalizar letras e espaços externos do cupom | CA02 | [Carrinho](gherkin/carrinho.feature) |
| CT-003 | Rejeitar cupom inexistente na interface, no cálculo e no pedido | CA03, API | [Carrinho](gherkin/carrinho.feature), [API](gherkin/api.feature) |
| CT-004 | Rejeitar cupom expirado na interface, no cálculo e no pedido | CA04, API | [Carrinho](gherkin/carrinho.feature), [API](gherkin/api.feature) |
| CT-005 | Remover e reaplicar o único cupom válido sem acumular descontos | CA05, CA09 | [Carrinho](gherkin/carrinho.feature) |
| CT-006 | Conceder frete grátis em subtotal exatamente R$ 200,00, com e sem cupom | CA01, CA06, CA08 | [Carrinho](gherkin/carrinho.feature), [API](gherkin/api.feature) |
| CT-007 | Conceder frete grátis acima do limite, inclusive quando o desconto reduz os produtos abaixo de R$ 200,00 | CA06, CA08 | [Carrinho](gherkin/carrinho.feature) |
| CT-008 | Cobrar frete abaixo do limite e informar o faltante | CA07, CA09 | [Carrinho](gherkin/carrinho.feature) |
| CT-009 | Permitir cinco unidades por produto e impedir seis | CA10 | [Carrinho](gherkin/carrinho.feature), [API](gherkin/api.feature) |
| CT-010 | Recalcular ao adicionar, remover, aumentar ou diminuir produtos | CA01, CA06, CA07, CA08 | [Carrinho](gherkin/carrinho.feature) |
| CT-011 | Conferir precisão dos cálculos e exibição monetária | CA11 | [Carrinho](gherkin/carrinho.feature), [API](gherkin/api.feature) |
| CT-012 | Confirmar pedido válido e preservar os valores | Checkout, API | [Checkout](gherkin/checkout.feature), [API](gherkin/api.feature) |
| CT-013 | Rejeitar dados inválidos do cliente | Checkout, API | [Checkout](gherkin/checkout.feature), [API](gherkin/api.feature) |
| CT-014 | Consultar catálogo, produto existente e produto inexistente | API | [API](gherkin/api.feature) |
| CT-015 | Rejeitar itens malformados, duplicados e quantidades inválidas | API | [API](gherkin/api.feature) |
| CT-016 | Rejeitar JSON inválido, rota inexistente e método não permitido | API | [API](gherkin/api.feature) |

## Convenções de execução

- Cada linha de `Exemplos` é um caso independente, identificado pelo CT e pela variação.
- No CT-002, interpretar `cupom_json` como uma string JSON antes de preencher o campo. As aspas não fazem parte do cupom; os espaços dentro delas fazem.

Os arquivos `.feature` são especificações. A automação contém nove testes Playwright em [tests/](../tests/), com comandos e cobertura no [README](../README.md#executar-a-automação).

## Limitações

- Apenas BEMVINDO10 é válido: remoção e reaplicação cobertas; troca entre dois cupons válidos não verificável.
- Desempate do arredondamento não definido; preços e desconto disponíveis não geram meio centavo.

Referência de linguagem: [Gherkin no Cucumber](https://cucumber.io/docs/gherkin/reference/).
