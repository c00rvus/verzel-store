import { expect, type Locator, type Page } from '@playwright/test';

export type ValoresResumo = { subtotal: string; desconto: string; frete: string; total: string };

export class ResumoPedido {
  readonly subtotal: Locator;
  readonly desconto: Locator;
  readonly frete: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    const resumo = page.locator('section[aria-labelledby="titulo-resumo"]');
    this.subtotal = resumo.locator('[data-valor="subtotal"]');
    this.desconto = resumo.locator('[data-valor="desconto"]');
    this.frete = resumo.locator('[data-valor="frete"]');
    this.total = resumo.locator('[data-valor="total"]');
  }

  async conferir(esperado: ValoresResumo) {
    for (const campo of Object.keys(esperado) as (keyof ValoresResumo)[]) {
      await expect(this[campo], campo).toHaveText(esperado[campo]);
    }
  }
}
