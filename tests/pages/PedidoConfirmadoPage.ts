import { type Locator, type Page } from '@playwright/test';
import { ResumoPedido } from './ResumoPedido';

export class PedidoConfirmadoPage {
  readonly titulo: Locator;
  readonly carrinhoVazio: Locator;
  readonly resumo: ResumoPedido;

  constructor(page: Page) {
    this.titulo = page.getByRole('heading', { level: 1 });
    this.carrinhoVazio = page.getByRole('link', { name: 'Carrinho 0 itens no carrinho', exact: true });
    this.resumo = new ResumoPedido(page);
  }
}
