import { test } from '@playwright/test';
import { LojaApi } from './api/LojaApi';
import { carrinhoComSeisUnidades, pedidoComSeisUnidades, erroQuantidadeMaxima } from './api/dados';
import { reproduziuBugQuantidade, verificarErroDeQuantidade } from './api/validacoes';
import { registrarJSON } from './helpers';

const cenarios = [
  {
    titulo: 'AUTO-008 | CT-009-API-6C | Rejeitar seis unidades em /api/carrinho/calcular',
    executar: (api: LojaApi) => api.calcularCarrinho(carrinhoComSeisUnidades()),
  },
  {
    titulo: 'AUTO-009 | CT-009-API-6P | Rejeitar seis unidades em /api/pedidos',
    executar: (api: LojaApi) => api.criarPedido(pedidoComSeisUnidades()),
  },
];

for (const cenario of cenarios) {
  test(cenario.titulo, async ({ request }, info) => {
    const api = new LojaApi(request);
    const resultado = await cenario.executar(api);
    await registrarJSON(info, 'requisicao-resposta', { ...resultado, esperado: erroQuantidadeMaxima });
    info.fail(reproduziuBugQuantidade(resultado), 'BUG-002: API aceita seis unidades por produto.');
    verificarErroDeQuantidade(resultado);
  });
}
