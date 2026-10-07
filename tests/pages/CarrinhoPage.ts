import { expect, type Locator, type Page } from '@playwright/test';
import { CheckoutPage } from './CheckoutPage';
import { ResumoPedido } from './ResumoPedido';

export class CarrinhoPage {
  readonly titulo: Locator;
  readonly campoCupom: Locator;
  readonly botaoAplicarCupom: Locator;
  readonly botaoRemoverCupom: Locator;
  readonly linkFinalizarCompra: Locator;
  readonly avisoFrete: Locator;
  readonly avisoLimite: Locator;
  readonly resumo: ResumoPedido;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Carrinho', exact: true });
    this.campoCupom = page.locator('#campo-cupom');
    this.botaoAplicarCupom = page.getByRole('button', { name: 'Aplicar cupom', exact: true });
    this.botaoRemoverCupom = page.getByRole('button', { name: 'Remover cupom', exact: true });
    this.linkFinalizarCompra = page.getByRole('link', { name: 'Finalizar compra', exact: true });
    this.avisoFrete = page.getByText(/^Faltam R\$/);
    this.avisoLimite = page.getByText('Limite de 5 unidades por produto.', { exact: false });
    this.resumo = new ResumoPedido(page);
  }

  mensagemCupom(texto: string) {
    return this.page.getByText(texto, { exact: true });
  }

  private seletorQuantidade(produto: string) {
    return this.page.getByRole('group', { name: `Quantidade de ${produto}`, exact: true });
  }

  quantidade(produto: string) {
    return this.seletorQuantidade(produto).locator('output');
  }

  botaoAumentar(produto: string) {
    return this.seletorQuantidade(produto)
      .getByRole('button', { name: `Aumentar quantidade de ${produto}`, exact: true });
  }

  botaoDiminuir(produto: string) {
    return this.seletorQuantidade(produto)
      .getByRole('button', { name: `Diminuir quantidade de ${produto}`, exact: true });
  }

  async aplicarCupom(cupom = 'BEMVINDO10') {
    await this.campoCupom.fill(cupom);
    await this.botaoAplicarCupom.click();
  }

  async removerCupom() {
    await this.botaoRemoverCupom.click();
  }

  async abrirCheckout() {
    await this.linkFinalizarCompra.click();
    const checkout = new CheckoutPage(this.page);
    await expect(checkout.titulo).toBeVisible();
    return checkout;
  }
}
