# language: pt
@checkout @planejado
Funcionalidade: Confirmar um pedido com os dados do cliente
  Como cliente da Verzel Store
  Quero informar meus dados e confirmar os valores da compra
  Para concluir um pedido com pagamento na entrega.

  Todos os dados de cliente usados nos exemplos são fictícios.

  Contexto:
    Dado que acesso a Verzel Store em uma aba com o carrinho vazio
    E adiciono 1 unidade de "Mochila Urbana 20L" de código "P005" e preço de R$ 100,00
    E abro o carrinho

  @CT-012 @ui @prioridade_alta
  Esquema do Cenário: Concluir a compra com dados válidos e preservar os valores do carrinho - <variacao>
    Dado que o carrinho está <condicao_cupom>
    Quando acesso "Finalizar compra"
    Então vejo a página "Finalizar compra"
    E o resumo da compra apresenta os valores:
      | Campo    | Valor      |
      | Subtotal | R$ 100,00  |
      | Desconto | <desconto> |
      | Frete    | R$ 19,90   |
      | Total    | <total>    |
    Quando preencho "Nome completo" com "Maria Silva"
    E preencho "E-mail" com "maria@example.com"
    E preencho "CEP" com "<cep>"
    E aciono "Confirmar pedido"
    Então a compra é confirmada
    E vejo um número de pedido com o prefixo "VZ-" seguido de exatamente 6 dígitos
    E os valores confirmados do pedido correspondem ao resumo da compra

    Exemplos:
      | variacao | condicao_cupom | cep | desconto | total |
      | CT-012-UI-01 | sem cupom aplicado | 01310-100 | R$ 0,00 | R$ 119,90 |
      | CT-012-UI-02 | sem cupom aplicado | 01310100 | R$ 0,00 | R$ 119,90 |
      | CT-012-UI-03 | com "BEMVINDO10" aplicado | 01310-100 | R$ 10,00 | R$ 109,90 |
      | CT-012-UI-04 | com "BEMVINDO10" aplicado | 01310100 | R$ 10,00 | R$ 109,90 |

  @CT-013 @ui @prioridade_alta
  Esquema do Cenário: Impedir a confirmação quando um dado obrigatório do cliente é inválido - <caso>
    Dado que o carrinho está sem cupom aplicado
    E acesso "Finalizar compra"
    Quando preencho os dados do cliente:
      | Campo         | Valor   |
      | Nome completo | <nome>  |
      | E-mail        | <email> |
      | CEP           | <cep>   |
    E aciono "Confirmar pedido"
    Então o pedido não é confirmado
    E a interface indica que o campo "<campo_invalido>" precisa ser corrigido
    E posso corrigir os dados para tentar confirmar o pedido novamente

    Exemplos:
      | caso                | nome        | email              | cep       | campo_invalido |
      | Nome sem sobrenome  | Maria       | maria@example.com  | 01310-100 | Nome completo  |
      | E-mail sem arroba   | Maria Silva | maria.example.com  | 01310-100 | E-mail         |
      | CEP com 7 dígitos   | Maria Silva | maria@example.com  | 0131010   | CEP            |
      | CEP com 9 dígitos   | Maria Silva | maria@example.com  | 013101000 | CEP            |
      | Nome vazio          |             | maria@example.com  | 01310-100 | Nome completo  |
      | E-mail vazio        | Maria Silva |                    | 01310-100 | E-mail         |
      | CEP vazio           | Maria Silva | maria@example.com  |           | CEP            |
