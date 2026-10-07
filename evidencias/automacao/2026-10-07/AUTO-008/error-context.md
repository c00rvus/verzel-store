# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: limite-api.spec.ts >> AUTO-008 | CT-009-API-6C | Rejeitar seis unidades em /api/carrinho/calcular
- Location: tests\limite-api.spec.ts:9:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 422
Received: 200
```

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "QUANTIDADE_MAXIMA_EXCEDIDA"
Received: undefined
```

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "itens[0].quantidade"
Received: undefined
```

```
TypeError: expect(received).toMatch(expected)

Matcher error: received value must be a string

Received has value: undefined
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { registrarJSON } from './helpers';
  3  | 
  4  | for (const caso of [
  5  |   { id: 'AUTO-008', ct: 'CT-009-API-6C', rota: '/api/carrinho/calcular', statusBug: 200, cliente: undefined },
  6  |   { id: 'AUTO-009', ct: 'CT-009-API-6P', rota: '/api/pedidos', statusBug: 201,
  7  |     cliente: { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' } },
  8  | ]) {
  9  |   test(`${caso.id} | ${caso.ct} | Rejeitar seis unidades em ${caso.rota}`, async ({ request }, info) => {
  10 |     const corpo = { itens: [{ produtoId: 'P005', quantidade: 6 }], ...(caso.cliente ? { cliente: caso.cliente } : {}) };
  11 |     const resposta = await request.post(caso.rota, { data: corpo });
  12 |     expect(resposta.headers()['content-type']).toContain('application/json');
  13 |     const dados = await resposta.json();
  14 |     await registrarJSON(info, 'requisicao-resposta', {
  15 |       metodo: 'POST', rota: caso.rota, requisicao: corpo,
  16 |       esperado: { statusHTTP: 422, codigo: 'QUANTIDADE_MAXIMA_EXCEDIDA' },
  17 |       statusHTTP: resposta.status(), resposta: dados,
  18 |     });
  19 |     const bugConfirmado = resposta.status() === caso.statusBug && dados.itens?.length === 1
  20 |       && dados.itens[0].produtoId === 'P005' && dados.itens[0].quantidade === 6
  21 |       && dados.itens[0].precoUnitario === 100 && dados.itens[0].total === 600
  22 |       && dados.subtotal === 600 && dados.desconto === 0 && dados.frete === 0
  23 |       && dados.freteGratis === true && dados.valorFaltanteFreteGratis === 0
  24 |       && dados.total === 600 && dados.cupom === null && !dados.erro
  25 |       && (caso.statusBug === 201 ? /^VZ-\d{6}$/.test(dados.numero) : dados.numero === undefined);
  26 |     info.fail(bugConfirmado, 'BUG-002: API aceita seis unidades por produto.');
  27 |     expect.soft(resposta.status()).toBe(422);
  28 |     expect.soft(dados.erro?.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  29 |     expect.soft(dados.erro?.campo).toBe('itens[0].quantidade');
> 30 |     expect.soft(dados.erro?.mensagem).toMatch(/(?:5|cinco).*unidades.*produto/i);
     |                                       ^ TypeError: expect(received).toMatch(expected)
  31 |     expect.soft(dados.numero).toBeUndefined();
  32 |   });
  33 | }
  34 | 
```