import { test, expect } from '@playwright/test';
import { ProdutosPage } from './pages/ProdutosPage';
import { registrarTela } from './helpers';

const mochila = 'Mochila Urbana 20L';
const semCupom = { subtotal: 'R$ 100,00', desconto: 'R$ 0,00', frete: 'R$ 19,90', total: 'R$ 119,90' };
const comCupom = { ...semCupom, desconto: '- R$ 10,00', total: 'R$ 109,90' };

test.beforeEach(async ({ page }) => {
  const produtos = new ProdutosPage(page);
  await produtos.abrir();
  await expect(produtos.carrinhoVazio).toBeVisible();
});

test('AUTO-001 | CT-001, CT-002, CT-005 | Aplicar, remover e reaplicar cupom', async ({ page }, info) => {
  const produtos = new ProdutosPage(page);
  await produtos.adicionarProduto(mochila);
  const carrinho = await produtos.abrirCarrinho();
  await carrinho.resumo.conferir(semCupom);
  await registrarTela(page, info, '01-antes-do-cupom');

  await carrinho.aplicarCupom('  bemvindo10  ');
  await carrinho.resumo.conferir(comCupom);
  await expect(carrinho.avisoFrete).toBeVisible();
  await expect(carrinho.avisoFrete).toHaveText('Faltam R$ 100,00 para o frete grátis.');
  await expect(carrinho.campoCupom).toHaveCount(0);
  await expect(carrinho.botaoRemoverCupom).toHaveCount(1);
  await registrarTela(page, info, '02-cupom-normalizado');

  await carrinho.removerCupom();
  await carrinho.resumo.conferir(semCupom);
  await expect(carrinho.campoCupom).toBeVisible();
  await registrarTela(page, info, '03-cupom-removido');

  await carrinho.aplicarCupom();
  await carrinho.resumo.conferir(comCupom);
  await expect(carrinho.botaoRemoverCupom).toHaveCount(1);
  await registrarTela(page, info, '04-cupom-reaplicado');
});

for (const caso of [
  { id: 'AUTO-002', ct: 'CT-003', cupom: 'NAOEXISTE', mensagem: 'Cupom inválido.' },
  { id: 'AUTO-003', ct: 'CT-004', cupom: 'VERAO2026', mensagem: 'Cupom expirado.' },
]) {
  test(`${caso.id} | ${caso.ct} | Rejeitar ${caso.cupom}`, async ({ page }, info) => {
    const produtos = new ProdutosPage(page);
    await produtos.adicionarProduto(mochila);

    const carrinho = await produtos.abrirCarrinho();
    await carrinho.resumo.conferir(semCupom);
    await registrarTela(page, info, '01-antes-do-cupom');
    await carrinho.aplicarCupom(caso.cupom);
    await expect(carrinho.mensagemCupom(caso.mensagem)).toBeVisible();
    await carrinho.resumo.conferir(semCupom);
    await expect(carrinho.botaoRemoverCupom).toHaveCount(0);
    await registrarTela(page, info, '02-cupom-rejeitado');
  });
}

test('AUTO-004 | CT-007 | Calcular frete antes do desconto', async ({ page }, info) => {
  const produtos = new ProdutosPage(page);
  await produtos.adicionarProduto('Camiseta Essencial');
  await produtos.adicionarProduto('Garrafa Térmica 750ml', 3);

  const carrinho = await produtos.abrirCarrinho();
  await carrinho.resumo.conferir({ subtotal: 'R$ 209,90', desconto: 'R$ 0,00', frete: 'Grátis', total: 'R$ 209,90' });
  await registrarTela(page, info, '01-antes-do-cupom');
  await carrinho.aplicarCupom();
  await carrinho.resumo.conferir({ subtotal: 'R$ 209,90', desconto: '- R$ 20,99', frete: 'Grátis', total: 'R$ 188,91' });
  await expect(carrinho.avisoFrete).toHaveCount(0);
  await registrarTela(page, info, '02-frete-gratis-apos-desconto');
});

test('AUTO-005 | CT-006, CT-010 | Frete grátis no subtotal de R$ 200,00', async ({ page }, info) => {
  const produtos = new ProdutosPage(page);
  await produtos.adicionarProduto(mochila);

  const carrinho = await produtos.abrirCarrinho();
  await carrinho.aplicarCupom();
  await carrinho.resumo.conferir(comCupom);
  await registrarTela(page, info, '01-uma-unidade-com-cupom');
  await carrinho.botaoAumentar(mochila).click();

  await expect(carrinho.resumo.subtotal).toHaveText('R$ 200,00');
  await expect(carrinho.resumo.desconto).toHaveText('- R$ 20,00');
  await expect(carrinho.quantidade(mochila)).toHaveText('2');
  await registrarTela(page, info, '02-duas-unidades-com-cupom');

  const frete = (await carrinho.resumo.frete.innerText()).trim();
  const total = (await carrinho.resumo.total.innerText()).trim();
  for (const aviso of await carrinho.avisoFrete.allTextContents()) {
    expect(aviso).toMatch(/^Faltam\s+R\$\s*0,00\s+para o frete grátis\.$/);
  }
  // Só a assinatura já confirmada do bug é tratada como falha conhecida.
  info.fail(frete === 'R$ 19,90' && total === 'R$ 199,90', 'BUG-001: frete cobrado no subtotal de R$ 200,00.');
  expect.soft(frete, 'Frete no subtotal de R$ 200,00').toBe('Grátis');
  expect.soft(total, 'Total no subtotal de R$ 200,00').toBe('R$ 180,00');
});

test('AUTO-006 | CT-009, CT-010 | Limitar cinco unidades e recalcular quantidade', async ({ page }, info) => {
  const produtos = new ProdutosPage(page);
  await produtos.adicionarProduto(mochila, 4);

  const carrinho = await produtos.abrirCarrinho();
  await carrinho.aplicarCupom();
  await carrinho.resumo.conferir({ subtotal: 'R$ 400,00', desconto: '- R$ 40,00', frete: 'Grátis', total: 'R$ 360,00' });
  await registrarTela(page, info, '01-quatro-unidades');
  const aumentar = carrinho.botaoAumentar(mochila);
  const quantidade = carrinho.quantidade(mochila);
  await aumentar.click();
  await expect(quantidade).toHaveText('5');
  await expect(aumentar).toBeDisabled();
  await expect(carrinho.avisoLimite).toBeVisible();
  
  await carrinho.resumo.conferir({ subtotal: 'R$ 500,00', desconto: '- R$ 50,00', frete: 'Grátis', total: 'R$ 450,00' });
  await registrarTela(page, info, '02-limite-cinco-unidades');
  await carrinho.botaoDiminuir(mochila).click();
  await expect(quantidade).toHaveText('4');
  await expect(aumentar).toBeEnabled();
  await carrinho.resumo.conferir({ subtotal: 'R$ 400,00', desconto: '- R$ 40,00', frete: 'Grátis', total: 'R$ 360,00' });
  await registrarTela(page, info, '03-quantidade-recalculada');
});
