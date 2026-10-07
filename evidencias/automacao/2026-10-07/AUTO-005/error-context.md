# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: carrinho.spec.ts >> AUTO-005 | CT-006, CT-010 | Frete grátis no subtotal de R$ 200,00
- Location: tests\carrinho.spec.ts:72:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="frete"]')
Expected: "Grátis"
Received: "R$ 19,90"
Timeout:  5000ms

Call log:
  - Expect "soft toHaveText" locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="frete"]') with timeout 5000ms
  - waiting for locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="frete"]')
    14 × locator resolved to <dd data-valor="frete">R$ 19,90</dd>
       - unexpected value "R$ 19,90"

```

```yaml
- definition: R$ 19,90
```

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="total"]')
Expected: "R$ 180,00"
Received: "R$ 199,90"
Timeout:  5000ms

Call log:
  - Expect "soft toHaveText" locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="total"]') with timeout 5000ms
  - waiting for locator('section[aria-labelledby="titulo-resumo"]').locator('[data-valor="total"]')
    14 × locator resolved to <dd data-valor="total">R$ 199,90</dd>
       - unexpected value "R$ 199,90"

```

```yaml
- definition: R$ 199,90
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { ProdutosPage } from './pages/ProdutosPage';
  3   | import { registrarTela } from './helpers';
  4   | 
  5   | const mochila = 'Mochila Urbana 20L';
  6   | const semCupom = { subtotal: 'R$ 100,00', desconto: 'R$ 0,00', frete: 'R$ 19,90', total: 'R$ 119,90' };
  7   | const comCupom = { ...semCupom, desconto: '- R$ 10,00', total: 'R$ 109,90' };
  8   | 
  9   | test.beforeEach(async ({ page }) => {
  10  |   const produtos = new ProdutosPage(page);
  11  |   await produtos.abrir();
  12  |   await expect(produtos.carrinhoVazio).toBeVisible();
  13  | });
  14  | 
  15  | test('AUTO-001 | CT-001, CT-002, CT-005 | Aplicar, remover e reaplicar cupom', async ({ page }, info) => {
  16  |   const produtos = new ProdutosPage(page);
  17  |   await produtos.adicionarProduto(mochila);
  18  |   const carrinho = await produtos.abrirCarrinho();
  19  |   await carrinho.resumo.conferir(semCupom);
  20  |   await registrarTela(page, info, '01-antes-do-cupom');
  21  | 
  22  |   await carrinho.aplicarCupom('  bemvindo10  ');
  23  |   await carrinho.resumo.conferir(comCupom);
  24  |   await expect(carrinho.avisoFrete).toBeVisible();
  25  |   await expect(carrinho.avisoFrete).toHaveText('Faltam R$ 100,00 para o frete grátis.');
  26  |   await expect(carrinho.campoCupom).toHaveCount(0);
  27  |   await expect(carrinho.botaoRemoverCupom).toHaveCount(1);
  28  |   await registrarTela(page, info, '02-cupom-normalizado');
  29  | 
  30  |   await carrinho.removerCupom();
  31  |   await carrinho.resumo.conferir(semCupom);
  32  |   await expect(carrinho.campoCupom).toBeVisible();
  33  |   await registrarTela(page, info, '03-cupom-removido');
  34  | 
  35  |   await carrinho.aplicarCupom();
  36  |   await carrinho.resumo.conferir(comCupom);
  37  |   await expect(carrinho.botaoRemoverCupom).toHaveCount(1);
  38  |   await registrarTela(page, info, '04-cupom-reaplicado');
  39  | });
  40  | 
  41  | for (const caso of [
  42  |   { id: 'AUTO-002', ct: 'CT-003', cupom: 'NAOEXISTE', mensagem: 'Cupom inválido.' },
  43  |   { id: 'AUTO-003', ct: 'CT-004', cupom: 'VERAO2026', mensagem: 'Cupom expirado.' },
  44  | ]) {
  45  |   test(`${caso.id} | ${caso.ct} | Rejeitar ${caso.cupom}`, async ({ page }, info) => {
  46  |     const produtos = new ProdutosPage(page);
  47  |     await produtos.adicionarProduto(mochila);
  48  |     const carrinho = await produtos.abrirCarrinho();
  49  |     await carrinho.resumo.conferir(semCupom);
  50  |     await registrarTela(page, info, '01-antes-do-cupom');
  51  |     await carrinho.aplicarCupom(caso.cupom);
  52  |     await expect(carrinho.mensagemCupom(caso.mensagem)).toBeVisible();
  53  |     await carrinho.resumo.conferir(semCupom);
  54  |     await expect(carrinho.botaoRemoverCupom).toHaveCount(0);
  55  |     await registrarTela(page, info, '02-cupom-rejeitado');
  56  |   });
  57  | }
  58  | 
  59  | test('AUTO-004 | CT-007 | Calcular frete antes do desconto', async ({ page }, info) => {
  60  |   const produtos = new ProdutosPage(page);
  61  |   await produtos.adicionarProduto('Camiseta Essencial');
  62  |   await produtos.adicionarProduto('Garrafa Térmica 750ml', 3);
  63  |   const carrinho = await produtos.abrirCarrinho();
  64  |   await carrinho.resumo.conferir({ subtotal: 'R$ 209,90', desconto: 'R$ 0,00', frete: 'Grátis', total: 'R$ 209,90' });
  65  |   await registrarTela(page, info, '01-antes-do-cupom');
  66  |   await carrinho.aplicarCupom();
  67  |   await carrinho.resumo.conferir({ subtotal: 'R$ 209,90', desconto: '- R$ 20,99', frete: 'Grátis', total: 'R$ 188,91' });
  68  |   await expect(carrinho.avisoFrete).toHaveCount(0);
  69  |   await registrarTela(page, info, '02-frete-gratis-apos-desconto');
  70  | });
  71  | 
  72  | test('AUTO-005 | CT-006, CT-010 | Frete grátis no subtotal de R$ 200,00', async ({ page }, info) => {
  73  |   const produtos = new ProdutosPage(page);
  74  |   await produtos.adicionarProduto(mochila);
  75  |   const carrinho = await produtos.abrirCarrinho();
  76  |   await carrinho.aplicarCupom();
  77  |   await carrinho.resumo.conferir(comCupom);
  78  |   await registrarTela(page, info, '01-uma-unidade-com-cupom');
  79  |   await carrinho.botaoAumentar(mochila).click();
  80  |   await expect(carrinho.resumo.subtotal).toHaveText('R$ 200,00');
  81  |   await expect(carrinho.resumo.desconto).toHaveText('- R$ 20,00');
  82  |   await expect(carrinho.quantidade(mochila)).toHaveText('2');
  83  |   await registrarTela(page, info, '02-duas-unidades-com-cupom');
  84  | 
  85  |   const frete = (await carrinho.resumo.frete.innerText()).trim();
  86  |   const total = (await carrinho.resumo.total.innerText()).trim();
  87  |   for (const aviso of await carrinho.avisoFrete.allTextContents()) {
  88  |     expect(aviso).toMatch(/^Faltam\s+R\$\s*0,00\s+para o frete grátis\.$/);
  89  |   }
  90  |   // Só a assinatura já confirmada do bug é tratada como falha conhecida.
  91  |   info.fail(frete === 'R$ 19,90' && total === 'R$ 199,90', 'BUG-001: frete cobrado no subtotal de R$ 200,00.');
  92  |   await expect.soft(carrinho.resumo.frete).toHaveText('Grátis');
> 93  |   await expect.soft(carrinho.resumo.total).toHaveText('R$ 180,00');
      |                                            ^ Error: expect(locator).toHaveText(expected) failed
  94  | });
  95  | 
  96  | test('AUTO-006 | CT-009, CT-010 | Limitar cinco unidades e recalcular quantidade', async ({ page }, info) => {
  97  |   const produtos = new ProdutosPage(page);
  98  |   await produtos.adicionarProduto(mochila, 4);
  99  |   const carrinho = await produtos.abrirCarrinho();
  100 |   await carrinho.aplicarCupom();
  101 |   await carrinho.resumo.conferir({ subtotal: 'R$ 400,00', desconto: '- R$ 40,00', frete: 'Grátis', total: 'R$ 360,00' });
  102 |   await registrarTela(page, info, '01-quatro-unidades');
  103 |   const aumentar = carrinho.botaoAumentar(mochila);
  104 |   const quantidade = carrinho.quantidade(mochila);
  105 |   await aumentar.click();
  106 |   await expect(quantidade).toHaveText('5');
  107 |   await expect(aumentar).toBeDisabled();
  108 |   await expect(carrinho.avisoLimite).toBeVisible();
  109 |   await carrinho.resumo.conferir({ subtotal: 'R$ 500,00', desconto: '- R$ 50,00', frete: 'Grátis', total: 'R$ 450,00' });
  110 |   await registrarTela(page, info, '02-limite-cinco-unidades');
  111 |   await carrinho.botaoDiminuir(mochila).click();
  112 |   await expect(quantidade).toHaveText('4');
  113 |   await expect(aumentar).toBeEnabled();
  114 |   await carrinho.resumo.conferir({ subtotal: 'R$ 400,00', desconto: '- R$ 40,00', frete: 'Grátis', total: 'R$ 360,00' });
  115 |   await registrarTela(page, info, '03-quantidade-recalculada');
  116 | });
  117 | 
```