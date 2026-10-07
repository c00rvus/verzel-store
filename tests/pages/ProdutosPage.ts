import { expect, type Locator, type Page } from '@playwright/test';
import { CarrinhoPage } from './CarrinhoPage';

export class ProdutosPage {
  readonly titulo: Locator;
  readonly linkCarrinho: Locator;
  readonly carrinhoVazio: Locator;

  constructor(private readonly page: Page) {
    this.titulo = page.locator('#titulo-vitrine');
    this.linkCarrinho = page.getByRole('link', { name: /^Carrinho/ });
    this.carrinhoVazio = page.getByRole('link', { name: 'Carrinho 0 itens no carrinho', exact: true });
  }

  async abrir() {
    await this.page.goto('/');
    await expect(this.titulo).toBeVisible();
  }

  async adicionarProduto(nome: string, quantidade = 1) {
    const adicionar = this.page.getByRole('article', { name: nome, exact: true })
      .getByRole('button', { name: 'Adicionar ao carrinho', exact: true });
    for (let unidade = 0; unidade < quantidade; unidade++) await adicionar.click();
  }

  async abrirCarrinho() {
    await this.linkCarrinho.click();
    const carrinho = new CarrinhoPage(this.page);
    await expect(carrinho.titulo).toBeVisible();
    return carrinho;
  }
}
