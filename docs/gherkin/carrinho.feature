# language: pt
@ui
Funcionalidade: Cupom e frete no carrinho da Verzel Store
  Como cliente da loja
  Quero aplicar um cupom e acompanhar os valores do carrinho
  Para pagar o total calculado pelas regras da entrega VZS-142

  Contexto:
    Dado que acesso a Verzel Store em uma aba com carrinho vazio
    E que os produtos têm os preços documentados na versão "2.3.0"

  @CT-001 @CA01 @CA07 @CA09 @prioridade_alta
  Cenário: Aplicar dez por cento de desconto mantendo o frete integral
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho
    E que o resumo antes do cupom apresenta:
      | valor    | esperado  |
      | Subtotal | R$ 100,00 |
      | Desconto | R$ 0,00   |
      | Frete    | R$ 19,90  |
      | Total    | R$ 119,90 |
    Quando preencho "Cupom de desconto" com "BEMVINDO10"
    E aciono "Aplicar cupom"
    Então o resumo deve apresentar:
      | valor    | esperado  |
      | Subtotal | R$ 100,00 |
      | Desconto | R$ 10,00  |
      | Frete    | R$ 19,90  |
      | Total    | R$ 109,90 |
    E o carrinho deve informar que faltam "R$ 100,00" para o frete grátis

  @CT-002 @CA02 @prioridade_alta
  Esquema do Cenário: Normalizar letras e espaços externos no cupom - <variacao>
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho
    Quando preencho "Cupom de desconto" com o texto representado pelo JSON <cupom_json>
    E aciono "Aplicar cupom"
    Então o cupom "BEMVINDO10" deve estar aplicado uma única vez
    E o desconto deve ser "R$ 10,00"
    E o frete deve ser "R$ 19,90"
    E o total deve ser "R$ 109,90"

    Exemplos:
      | variacao | cupom_json        |
      | minusculas | "bemvindo10"    |
      | letras_mistas | "BeMvInDo10" |
      | espacos_inicio | "  BEMVINDO10" |
      | espacos_fim | "BEMVINDO10  " |
      | letras_e_espacos | "  BeMvInDo10  " |

  @CT-003 @CA03 @prioridade_alta
  Cenário: Informar um cupom inexistente na interface
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho sem cupom aplicado
    Quando preencho "Cupom de desconto" com "NAOEXISTE"
    E aciono "Aplicar cupom"
    Então devo ver a mensagem "Cupom inválido."
    E o desconto deve ser "R$ 0,00"
    E o total deve ser "R$ 119,90"
    E nenhum cupom deve ficar aplicado

  @CT-004 @CA04 @prioridade_alta
  Cenário: Informar o cupom expirado na interface
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho sem cupom aplicado
    Quando preencho "Cupom de desconto" com "VERAO2026"
    E aciono "Aplicar cupom"
    Então devo ver a mensagem "Cupom expirado."
    E o desconto deve ser "R$ 0,00"
    E o total deve ser "R$ 119,90"
    E nenhum cupom deve ficar aplicado

  @CT-005 @CA05 @CA09 @prioridade_alta
  Cenário: Remover e reaplicar o único cupom válido sem acumular descontos
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho e apliquei "BEMVINDO10"
    E que o total é "R$ 109,90"
    E que o formulário para aplicar outro cupom não está disponível enquanto há um cupom ativo
    Quando aciono "Remover cupom"
    Então o campo "Cupom de desconto" deve voltar a estar disponível
    E o desconto deve ser "R$ 0,00"
    E o total deve ser "R$ 119,90"
    Quando preencho "Cupom de desconto" com "BEMVINDO10"
    E aciono "Aplicar cupom"
    Então o cupom deve estar aplicado uma única vez
    E o desconto deve ser "R$ 10,00"
    E o frete deve ser "R$ 19,90"
    E o total deve ser "R$ 109,90"

  @CT-006 @CA01 @CA06 @CA08 @prioridade_alta
  Esquema do Cenário: Conceder frete grátis exatamente em duzentos reais - <variacao>
    Dado que adicionei duas unidades de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho
    Quando mantenho o carrinho na condição de cupom "<condicao>"
    Então o subtotal deve ser "R$ 200,00"
    E o desconto deve ser "<desconto>"
    E o frete deve ser exibido como "Grátis"
    E o total deve ser "<total>"
    E não deve ser informado um valor positivo faltante para frete grátis

    Exemplos:
      | variacao | condicao | desconto | total |
      | sem_cupom | sem cupom | R$ 0,00 | R$ 200,00 |
      | com_cupom | BEMVINDO10 aplicado | R$ 20,00 | R$ 180,00 |

  @CT-007 @CA06 @CA08 @prioridade_alta
  Cenário: Manter frete grátis acima de duzentos reais
    Dado que adicionei uma unidade de "Jaqueta Corta-Vento" ao carrinho
    E que abri o carrinho
    Quando aplico "BEMVINDO10"
    Então o resumo deve apresentar:
      | valor    | esperado  |
      | Subtotal | R$ 229,90 |
      | Desconto | R$ 22,99  |
      | Frete    | Grátis    |
      | Total    | R$ 206,91 |
    E não deve ser informado um valor positivo faltante para frete grátis

  @CT-007 @CA08 @prioridade_alta
  Cenário: Manter frete grátis quando o desconto reduz os produtos abaixo do limite
    Dado que adicionei os seguintes produtos ao carrinho:
      | produto | quantidade |
      | Camiseta Essencial | 1 |
      | Garrafa Térmica 750ml | 3 |
    E que abri o carrinho
    Quando aplico "BEMVINDO10"
    Então o subtotal deve ser "R$ 209,90"
    E o desconto deve ser "R$ 20,99"
    E o frete deve ser exibido como "Grátis"
    E o total deve ser "R$ 188,91"

  @CT-008 @CA07 @CA09 @prioridade_alta
  Cenário: Cobrar frete dez centavos abaixo do limite
    Dado que adicionei os seguintes produtos ao carrinho:
      | produto | quantidade |
      | Boné Aba Curva | 1 |
      | Garrafa Térmica 750ml | 3 |
    E que abri o carrinho
    Quando aplico "BEMVINDO10"
    Então o resumo deve apresentar:
      | valor    | esperado  |
      | Subtotal | R$ 199,90 |
      | Desconto | R$ 19,99  |
      | Frete    | R$ 19,90  |
      | Total    | R$ 199,81 |
    E o carrinho deve informar que faltam "R$ 0,10" para o frete grátis

  @CT-009 @CA10 @prioridade_alta
  Cenário: Impedir a sexta unidade pelo controle de quantidade do carrinho
    Dado que adicionei quatro unidades de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho sem cupom aplicado
    Quando aciono "Aumentar quantidade de Mochila Urbana 20L" uma vez
    Então a quantidade de "Mochila Urbana 20L" deve ser cinco
    E o botão "Aumentar quantidade de Mochila Urbana 20L" deve estar desabilitado
    E devo ver o aviso de limite de cinco unidades por produto
    E o subtotal deve ser "R$ 500,00"

  @CT-010 @CA01 @CA06 @CA07 @CA08 @prioridade_alta
  Cenário: Recalcular ao aumentar a quantidade até o limite de frete
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho e apliquei "BEMVINDO10"
    Quando aciono "Aumentar quantidade de Mochila Urbana 20L" uma vez
    Então a quantidade de "Mochila Urbana 20L" deve ser dois
    E o subtotal deve ser "R$ 200,00"
    E o desconto deve ser "R$ 20,00"
    E o frete deve ser exibido como "Grátis"
    E o total deve ser "R$ 180,00"
    E não deve ser informado um valor positivo faltante para frete grátis

  @CT-010 @CA01 @CA06 @CA07 @CA08 @prioridade_alta
  Cenário: Recalcular ao diminuir a quantidade abaixo do limite de frete
    Dado que adicionei duas unidades de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho e apliquei "BEMVINDO10"
    Quando aciono "Diminuir quantidade de Mochila Urbana 20L" uma vez
    Então a quantidade de "Mochila Urbana 20L" deve ser um
    E o subtotal deve ser "R$ 100,00"
    E o desconto deve ser "R$ 10,00"
    E o frete deve ser "R$ 19,90"
    E o carrinho deve informar que faltam "R$ 100,00" para o frete grátis
    E o total deve ser "R$ 109,90"

  @CT-010 @CA01 @CA07 @prioridade_alta
  Cenário: Recalcular ao adicionar e remover outro produto com cupom ativo
    Dado que adicionei uma unidade de "Mochila Urbana 20L" ao carrinho
    E que abri o carrinho e apliquei "BEMVINDO10"
    Quando volto à página "Produtos"
    E adiciono uma unidade de "Garrafa Térmica 750ml"
    E abro o carrinho
    Então o subtotal deve ser "R$ 150,00"
    E o desconto deve ser "R$ 15,00"
    E o frete deve ser "R$ 19,90"
    E o carrinho deve informar que faltam "R$ 50,00" para o frete grátis
    E o total deve ser "R$ 154,90"
    Quando aciono "Remover Garrafa Térmica 750ml do carrinho"
    Então o subtotal deve ser "R$ 100,00"
    E o desconto deve ser "R$ 10,00"
    E o frete deve ser "R$ 19,90"
    E o total deve ser "R$ 109,90"
    E o carrinho deve informar que faltam "R$ 100,00" para o frete grátis

  @CT-011 @CA11 @prioridade_media
  Cenário: Exibir valores monetários com duas casas decimais
    Dado que adicionei os seguintes produtos ao carrinho:
      | produto | quantidade |
      | Boné Aba Curva | 1 |
      | Garrafa Térmica 750ml | 3 |
    E que abri o carrinho
    Quando aplico "BEMVINDO10"
    Então os valores monetários devem usar duas casas decimais:
      | valor | esperado |
      | Subtotal | R$ 199,90 |
      | Desconto | R$ 19,99 |
      | Frete | R$ 19,90 |
      | Total | R$ 199,81 |
    E o valor faltante para frete grátis deve ser "R$ 0,10"
