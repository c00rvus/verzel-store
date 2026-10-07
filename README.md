# Teste de QA da Verzel Store

Testes da funcionalidade de cupom de desconto e frete grátis, card VZS-142, versão documentada 2.3.0.

**Status:** 70 casos executados, com 63 aprovados e 7 reprovados. Interface: 27 aprovados e 3 reprovados; API: 36 aprovados e 4 reprovados. A especificação reúne 16 grupos e 32 definições Gherkin.

A sessão exploratória EXP-01 foi concluída sem novos defeitos. A automação reúne 9 testes críticos: 7 de interface e 2 de API. Os bugs de frete no subtotal de R$ 200,00 e de aceitação de seis unidades estão cobertos por regressão.

O escopo cobre carrinho, cupons, frete, checkout e contratos da API. O ambiente usa dados fictícios, carrinho separado por aba e pedidos sem armazenamento, cobrança, controle de estoque ou envio de e-mail. Login, cadastro, pagamento online, consulta de pedidos, carga, estresse e segurança ficam fora do escopo.

## Ambiente

- [Loja](https://verzel-store.qa-test-verzel-store.workers.dev/), [documentação](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) e [API](https://verzel-store.qa-test-verzel-store.workers.dev/api).

## Documentação

| Material | Local |
| --- | --- |
| Rastreabilidade dos critérios | [Cenários](docs/cenarios.md) |
| Especificações | [Arquivos Gherkin](docs/gherkin/) |
| Resultados e sessões exploratórias | [Execução](docs/execucao.md) |
| Defeitos reproduzidos | [Bugs](docs/bugs.md) |
| Índice de evidências | [Evidências](docs/evidencias.md) |
| Capturas e respostas da API | [Pasta de evidências](evidencias/) |
| Registro exclusivo de cada caso | [Registros individuais](evidencias/cenarios/) |
| Testes automatizados | [Pasta de testes](tests/) |

## Dashboard

Visualização estática dos resultados, bugs, evidências e código. A fonte fica em `dashboard/`; os dados refletem os registros existentes no momento da geração.

Na raiz do projeto:

```powershell
node dashboard/build.cjs
node dashboard/serve.cjs
```

Prévia em [http://127.0.0.1:4174/](http://127.0.0.1:4174/). Os comandos geram e servem os registros existentes, sem executar testes.

## Executar a automação

Requisitos: Node.js 22 ou superior, npm e acesso à internet. Na raiz do projeto:

```powershell
npm ci
npm run test:install
npm test
```

A suíte usa Chromium, dois processos em paralelo e a URL da loja. Cada teste começa com contexto isolado e dados fictícios. Não exige login, servidor local ou configuração de credenciais.

Para abrir o relatório com as etapas, capturas e respostas da API:

```powershell
npm run test:report
```

| Comando opcional | Uso |
| --- | --- |
| `npm run test:headed` | Executar com navegador visível e fechar ao finalizar |
| `npm run test:ui` | Abrir a interface do Playwright |
| `npm run test:list` | Listar os nove testes |

### Cobertura

| Teste | Fluxo | Cenários |
| --- | --- | --- |
| AUTO-001 | Normalizar, aplicar, remover e reaplicar cupom | CT-001, CT-002, CT-005 |
| AUTO-002 | Rejeitar cupom inexistente | CT-003 |
| AUTO-003 | Rejeitar cupom expirado | CT-004 |
| AUTO-004 | Manter frete grátis pelo subtotal antes do desconto | CT-007 |
| AUTO-005 | Conceder frete grátis no subtotal exato de R$ 200,00 | CT-006, CT-010; BUG-001 |
| AUTO-006 | Limitar cinco unidades e recalcular ao reduzir quantidade | CT-009, CT-010 |
| AUTO-007 | Bloquear CEP inválido, corrigir e confirmar pedido com cupom | CT-012, CT-013 |
| AUTO-008 | Rejeitar seis unidades na API de cálculo | CT-009-API-6C; BUG-002 |
| AUTO-009 | Rejeitar seis unidades na API de pedido | CT-009-API-6P; BUG-002 |

Os testes estão em [carrinho.spec.ts](tests/carrinho.spec.ts), [checkout.spec.ts](tests/checkout.spec.ts) e [limite-api.spec.ts](tests/limite-api.spec.ts). Os arquivos `.feature` são especificações; `npm test` executa os arquivos `.spec.ts`.

### Page Objects e locators

| Arquivo | Responsabilidade |
| --- | --- |
| [ProdutosPage](tests/pages/ProdutosPage.ts) | Catálogo, adicionar produtos e acessar o carrinho |
| [CarrinhoPage](tests/pages/CarrinhoPage.ts) | Cupons, quantidade, avisos e acesso ao checkout |
| [CheckoutPage](tests/pages/CheckoutPage.ts) | Dados do cliente e confirmação |
| [PedidoConfirmadoPage](tests/pages/PedidoConfirmadoPage.ts) | Pedido confirmado e carrinho vazio |
| [ResumoPedido](tests/pages/ResumoPedido.ts) | Locators e comparação dos quatro valores do resumo |

Locators conferidos no DOM: IDs dos campos, `aria-label` dos controles de quantidade, roles com nomes acessíveis e atributos `data-valor`. As páginas inspecionadas não possuem `data-testid`. Os locators e ações ficam em `tests/pages/`; os cenários e resultados esperados ficam nos specs. `helpers.ts` contém apenas o registro dos anexos.

### Testes de API

| Arquivo | Responsabilidade |
| --- | --- |
| [LojaApi](tests/api/LojaApi.ts) | Requisições de cálculo do carrinho e criação de pedidos |
| [dados](tests/api/dados.ts) | Itens, cliente fictício e resultados esperados |
| [validacoes](tests/api/validacoes.ts) | Validação das respostas e identificação dos defeitos conhecidos |

AUTO-008 e AUTO-009 são parametrizados em [limite-api.spec.ts](tests/limite-api.spec.ts), compartilhando os passos e mantendo resultados e evidências individuais. Execução: `npm test`.

### Resultados e bugs conhecidos

Execução de 07/10/2026: **6 aprovados e 3 falhas conhecidas esperadas**, sem falhas inesperadas. [Registro e evidências](docs/evidencias.md#ev-044--automação-playwright).

AUTO-005, AUTO-008 e AUTO-009 continuam verificando o resultado correto do requisito. `testInfo.fail` é aplicado somente quando a resposta corresponde ao defeito registrado. Comportamento diferente gera falha inesperada; após correção, o teste passa normalmente. O resumo aceito do Playwright inclui as falhas esperadas e não representa nove aprovações funcionais.

Cada teste de interface anexa capturas das etapas. Os testes de API anexam requisição e resposta. Relatórios são gerados em `playwright-report/` e `test-results/`; traces são mantidos em falhas inesperadas. A execução registrada está em [evidencias/automacao/](evidencias/automacao/).

Se a instalação ou as chamadas de API apresentarem erro de certificado no Windows, use Node.js 22.19 ou superior e execute no mesmo terminal:

```powershell
$env:NODE_USE_SYSTEM_CA='1'
npm run test:install
npm test
```

Essa opção usa os certificados confiáveis do sistema e mantém a validação HTTPS.

Referência: [documentação oficial do Playwright](https://playwright.dev/docs/intro).

## Uso de IA

Utilizei IA na análise dos requisitos, estruturação do projeto, elaboração de Gherkin, execução e organização dos testes manuais e de API, criação e execução da automação Playwright e revisão dos registros.
