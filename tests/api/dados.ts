export type ItemCarrinho = {
  produtoId: string;
  quantidade: number;
};

export type Cliente = {
  nome: string;
  email: string;
  cep: string;
};

export type Carrinho = { itens: ItemCarrinho[] };
export type Pedido = Carrinho & { cliente: Cliente };

export const erroQuantidadeMaxima = {
  statusHTTP: 422,
  codigo: 'QUANTIDADE_MAXIMA_EXCEDIDA',
  campo: 'itens[0].quantidade',
} as const;

export function carrinhoComSeisUnidades(): Carrinho {
  return { itens: [{ produtoId: 'P005', quantidade: 6 }] };
}

export function pedidoComSeisUnidades(): Pedido {
  return {
    ...carrinhoComSeisUnidades(),
    cliente: { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' },
  };
}
