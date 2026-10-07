import { expect } from '@playwright/test';
import type { ResultadoApi } from './LojaApi';
import { erroQuantidadeMaxima } from './dados';

export function reproduziuBugQuantidade(resultado: ResultadoApi): boolean {
  const { statusHTTP, rota, resposta: dados } = resultado;
  const ehPedido = rota === '/api/pedidos';
  if (!ehPedido && rota !== '/api/carrinho/calcular') return false;

  const item = dados.itens?.[0];
  return statusHTTP === (ehPedido ? 201 : 200)
    && dados.itens?.length === 1
    && item?.produtoId === 'P005' && item.quantidade === 6
    && item.precoUnitario === 100 && item.total === 600
    && dados.subtotal === 600 && dados.desconto === 0 && dados.frete === 0
    && dados.freteGratis === true && dados.valorFaltanteFreteGratis === 0
    && dados.total === 600 && dados.cupom === null && !dados.erro
    && (ehPedido ? /^VZ-\d{6}$/.test(dados.numero ?? '') : dados.numero === undefined);
}

export function verificarErroDeQuantidade(resultado: ResultadoApi) {
  const dados = resultado.resposta;
  expect.soft(resultado.statusHTTP, 'Status HTTP').toBe(erroQuantidadeMaxima.statusHTTP);
  expect.soft(dados.erro?.codigo, 'Código de erro').toBe(erroQuantidadeMaxima.codigo);
  expect.soft(dados.erro?.campo, 'Campo com erro').toBe(erroQuantidadeMaxima.campo);
  expect.soft(dados.erro?.mensagem, 'Mensagem de erro').toMatch(/(?:5|cinco).*unidades.*produto/i);
  expect.soft(dados.numero, 'Ausência de pedido criado').toBeUndefined();
}
