import { type Page, type TestInfo } from '@playwright/test';

export async function registrarTela(page: Page, info: TestInfo, etapa: string) {
  await info.attach(etapa, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

export async function registrarJSON(info: TestInfo, nome: string, dados: unknown) {
  await info.attach(nome, { body: JSON.stringify(dados, null, 2), contentType: 'application/json' });
}
