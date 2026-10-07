import { type Locator, type Page } from '@playwright/test';
import { ResumoPedido } from './ResumoPedido';

export class CheckoutPage {
  readonly titulo: Locator;
  readonly nome: Locator;
  readonly email: Locator;
  readonly cep: Locator;
  readonly erroCEP: Locator;
  readonly botaoConfirmarPedido: Locator;
  readonly resumo: ResumoPedido;

  constructor(page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Finalizar compra', exact: true });
    this.nome = page.locator('#campo-nome');
    this.email = page.locator('#campo-email');
    this.cep = page.locator('#campo-cep');
    this.erroCEP = page.locator('#campo-cep-erro');
    this.botaoConfirmarPedido = page.getByRole('button', { name: 'Confirmar pedido', exact: true });
    this.resumo = new ResumoPedido(page);
  }

  async preencherCliente(cliente: { nome: string; email: string; cep: string }) {
    await this.nome.fill(cliente.nome);
    await this.email.fill(cliente.email);
    await this.cep.fill(cliente.cep);
  }

  async confirmarPedido() {
    await this.botaoConfirmarPedido.click();
  }
}
