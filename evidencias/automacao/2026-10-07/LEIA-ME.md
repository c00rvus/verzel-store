# Execução automatizada

9 testes: 6 aprovados, 3 falhas conhecidas esperadas, 0 falhas inesperadas.

[Resumo e metadados](resultado.json). Cada pasta reúne apenas as evidências do respectivo teste.

| Teste | Fluxo | Resultado | Evidência |
| --- | --- | --- | --- |
| AUTO-001 | Aplicar, remover e reaplicar cupom | Aprovado | [Registro](AUTO-001/registro.json) |
| AUTO-002 | Rejeitar NAOEXISTE | Aprovado | [Registro](AUTO-002/registro.json) |
| AUTO-003 | Rejeitar VERAO2026 | Aprovado | [Registro](AUTO-003/registro.json) |
| AUTO-004 | Calcular frete antes do desconto | Aprovado | [Registro](AUTO-004/registro.json) |
| AUTO-005 | Frete grátis no subtotal de R$ 200,00 | Falha conhecida: BUG-001 | [Registro](AUTO-005/registro.json) |
| AUTO-006 | Limitar cinco unidades e recalcular quantidade | Aprovado | [Registro](AUTO-006/registro.json) |
| AUTO-007 | Corrigir CEP e concluir pedido com cupom | Aprovado | [Registro](AUTO-007/registro.json) |
| AUTO-008 | Rejeitar seis unidades em /api/carrinho/calcular | Falha conhecida: BUG-002 | [Registro](AUTO-008/registro.json) |
| AUTO-009 | Rejeitar seis unidades em /api/pedidos | Falha conhecida: BUG-002 | [Registro](AUTO-009/registro.json) |
