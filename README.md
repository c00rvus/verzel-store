# QA · Verzel Store

Testes de carrinho, cupons, frete e checkout na interface e na API. Card **VZS-142**, versão **2.3.0**.

## Entregas

| Material | Arquivo |
| --- | --- |
| Cenários e rastreabilidade dos requisitos | [cenarios.md](docs/cenarios.md) |
| Especificações Gherkin | [docs/gherkin/](docs/gherkin/) |
| Resultados manuais e sessão exploratória | [execucao.md](docs/execucao.md) |
| Relatório de bugs | [bugs.md](docs/bugs.md) |
| Evidências da execução | [evidencias.md](docs/evidencias.md) |
| Automação Playwright | [tests/](tests/) |

Ambiente: [loja](https://verzel-store.qa-test-verzel-store.workers.dev/) e [documentação](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao).

## Resultados

| Testes manuais e exploratórios | Executados | Aprovados | Reprovados |
| --- | ---: | ---: | ---: |
| Interface | 30 | 27 | 3 |
| API | 40 | 36 | 4 |
| **Total** | **70** | **63** | **7** |

**2 bugs confirmados.** Automação: **9 testes**, com **6 aprovados e 3 falhas conhecidas esperadas**, sem falhas inesperadas na execução registrada de 07/10/2026.

## Dashboard

[Acessar dashboard](https://c00rvus.github.io/verzel-store/) — resultados, bugs, evidências e código dos testes, sem instalação.

![Tela inicial do dashboard](docs/assets/dashboard-inicio.jpg)

## Estrutura do projeto

Principais pastas e arquivos:

```text
verzel-store/
├── .github/
│   └── workflows/
│       └── dashboard.yml
├── dashboard/
│   ├── lib/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── build.cjs
│   └── serve.cjs
├── docs/
│   ├── assets/
│   │   └── dashboard-inicio.jpg
│   ├── gherkin/
│   │   ├── api.feature
│   │   ├── carrinho.feature
│   │   └── checkout.feature
│   ├── bugs.md
│   ├── cenarios.md
│   ├── evidencias.md
│   └── execucao.md
├── evidencias/
│   ├── automacao/
│   ├── cenarios/
│   ├── execucao-2026-10-07/
│   ├── revisao-2026-10-07/
│   └── revisao-ambiente/
├── tests/
│   ├── api/
│   │   ├── dados.ts
│   │   ├── LojaApi.ts
│   │   └── validacoes.ts
│   ├── pages/
│   │   ├── CarrinhoPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── PedidoConfirmadoPage.ts
│   │   ├── ProdutosPage.ts
│   │   └── ResumoPedido.ts
│   ├── carrinho.spec.ts
│   ├── checkout.spec.ts
│   ├── limite-api.spec.ts
│   └── helpers.ts
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md
```

## Executar a automação

Requisitos: **Node.js 22+**, npm e acesso à internet. Na raiz do projeto:

```powershell
npm ci
npm run test:install
npm test
```

Os testes usam Chromium, dois processos em paralelo e contextos isolados. Não exigem login, credenciais ou servidor local.

```powershell
npm run test:report
```

O relatório inclui etapas, capturas e respostas da API. Para acompanhar a execução, use `npm run test:headed` ou `npm run test:ui`.

### Organização dos testes

- [carrinho.spec.ts](tests/carrinho.spec.ts): cupons, frete, quantidade e recálculo.
- [checkout.spec.ts](tests/checkout.spec.ts): CEP inválido e confirmação de pedido com cupom.
- [limite-api.spec.ts](tests/limite-api.spec.ts): limite de quantidade no cálculo e na criação de pedidos.

As ações e locators ficam em `tests/pages/`; o cliente, os dados e as validações da API ficam em `tests/api/`. `npm test` executa os arquivos `.spec.ts`; os `.feature` documentam os cenários.

### Bugs conhecidos

AUTO-005 reproduz o **BUG-001**; AUTO-008 e AUTO-009 reproduzem o **BUG-002**. Os testes mantêm a validação do requisito e marcam a falha como esperada apenas quando o comportamento corresponde ao bug registrado. Falhas esperadas aceitas pelo Playwright não são aprovações funcionais.

Se ocorrer erro de certificado no Windows, use Node.js 22.19+ e execute `$env:NODE_USE_SYSTEM_CA='1'` no mesmo terminal antes de repetir os comandos.

## Dashboard local (opcional)

```powershell
node dashboard/build.cjs
node dashboard/serve.cjs
```

Abra [http://127.0.0.1:4174/](http://127.0.0.1:4174/). O dashboard exibe os registros existentes; esses comandos não executam testes.

## Uso de IA

Conduzi o projeto e coordenei o uso do Codex ao longo das etapas. Defini as prioridades, solicitei as atividades e revisei as entregas, orientando ajustes na documentação, nos testes e na apresentação dos resultados. Na automação, determinei que o foco deveria estar nos fluxos principais e críticos, com uma estrutura simples para ser lida e compreendida

Executei pessoalmente parte dos testes manuais, incluindo variações de cupons, remoção e reaplicação do desconto e condições de frete grátis. Informei os comportamentos e valores observados, os horários, o navegador utilizado e as capturas correspondentes para compor os registros de execução e as evidências.

Também direcionei a organização técnica da automação: solicitei a separação em Page Objects, a utilização de locators existentes nas páginas, a organização do cliente, dos dados e das validações da API e a parametrização de testes semelhantes. Orientei a execução em paralelo, investiguei problemas de duração e comportamento dos testes, identifiquei o problema e solicitei ajuste ao modelo.

O Codex foi utilizado na análise da documentação, elaboração dos cenários em Gherkin, execução de parte dos testes de interface e API, organização das evidências, documentação dos bugs e geração e refatoração do código Playwright. Também criou o dashboard e auxiliou na publicação no GitHub Pages.

Revisei a apresentação das entregas e solicitei melhorias para facilitar a avaliação, como evidências isoladas por cenário, comparação de antes e depois, destaque dos bugs, visualização do código e um README objetivo com instruções de execução e estrutura de pastas.
