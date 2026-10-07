import { expect, type APIRequestContext } from '@playwright/test';
import type { Carrinho, Pedido } from './dados';

type DadosCarrinho = {
  itens?: { produtoId: string; quantidade: number; precoUnitario: number; total: number }[];
  subtotal?: number;
  desconto?: number;
  frete?: number;
  freteGratis?: boolean;
  valorFaltanteFreteGratis?: number;
  total?: number;
  cupom?: unknown;
  numero?: string;
  erro?: { codigo: string; campo: string; mensagem: string };
};

export type ResultadoApi = {
  metodo: 'POST';
  rota: string;
  requisicao: Carrinho | Pedido;
  statusHTTP: number;
  resposta: DadosCarrinho;
};

export class LojaApi {
  constructor(private readonly request: APIRequestContext) {}

  calcularCarrinho(carrinho: Carrinho) {
    return this.post('/api/carrinho/calcular', carrinho);
  }

  criarPedido(pedido: Pedido) {
    return this.post('/api/pedidos', pedido);
  }

  private async post(rota: string, requisicao: Carrinho | Pedido): Promise<ResultadoApi> {
    const resposta = await this.request.post(rota, { data: requisicao });
    expect(resposta.headers()['content-type'], 'Formato JSON da resposta')
      .toContain('application/json');

    return {
      metodo: 'POST',
      rota,
      requisicao,
      statusHTTP: resposta.status(),
      resposta: await resposta.json(),
    };
  }
}
