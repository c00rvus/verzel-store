import { test, expect } from '@playwright/test';
import { ProdutosPage } from './pages/ProdutosPage';
import { PedidoConfirmadoPage } from './pages/PedidoConfirmadoPage';
import { registrarTela, registrarJSON } from './helpers';

test('AUTO-007 | CT-012, CT-013 | Corrigir CEP e concluir pedido com cupom', async ({ page }, info) => {
  const produtos = new ProdutosPage(page);
  await produtos.abrir();
  await expect(produtos.carrinhoVazio).toBeVisible();
  await produtos.adicionarProduto('Mochila Urbana 20L');
  const carrinho = await produtos.abrirCarrinho();
  const comCupom = { subtotal: 'R$ 100,00', desconto: '- R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' };
  await carrinho.aplicarCupom();
  await carrinho.resumo.conferir(comCupom);
  const checkout = await carrinho.abrirCheckout();
  await checkout.resumo.conferir(comCupom);
  await checkout.preencherCliente({ nome: 'Maria Silva', email: 'maria@example.com', cep: '0131010' });
  await registrarTela(page, info, '01-checkout-antes-de-confirmar');
  await checkout.confirmarPedido();
  await expect(checkout.erroCEP).toBeVisible();
  await expect(checkout.erroCEP).toHaveText('Informe um CEP com 8 dígitos.');
  await expect(page).toHaveURL(/\/checkout$/);
  await registrarTela(page, info, '02-cep-invalido-rejeitado');

  await checkout.cep.fill('01310-100');
  await registrarTela(page, info, '03-cep-corrigido');
  const [resposta] = await Promise.all([
    page.waitForResponse(r => new URL(r.url()).pathname === '/api/pedidos' && r.request().method() === 'POST'),
    checkout.confirmarPedido(),
  ]);
  const pedido = await resposta.json();
  await registrarJSON(info, 'pedido-confirmado', { requisicao: resposta.request().postDataJSON(), statusHTTP: resposta.status(), resposta: pedido });
  expect(resposta.status()).toBe(201);
  expect(pedido).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
  expect(pedido.numero).toMatch(/^VZ-\d{6}$/);
  expect(pedido.cliente).toMatchObject({ nome: 'Maria Silva', email: 'maria@example.com' });
  expect(pedido.cliente.cep).toMatch(/^\d{5}-?\d{3}$/);
  expect(pedido.cliente.cep.replace(/\D/g, '')).toBe('01310100');
  expect(pedido.cupom).toMatchObject({ codigo: 'BEMVINDO10', aplicado: true });
  expect(pedido.criadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
  expect(Number.isFinite(Date.parse(pedido.criadoEm))).toBe(true);

  const confirmado = new PedidoConfirmadoPage(page);
  await expect(page).toHaveURL(/\/pedido-confirmado$/);
  await expect(confirmado.titulo).toHaveText(`Pedido ${pedido.numero}`);
  await confirmado.resumo.conferir(comCupom);
  await expect(confirmado.carrinhoVazio).toBeVisible();
  await registrarTela(page, info, '04-pedido-confirmado');
});
