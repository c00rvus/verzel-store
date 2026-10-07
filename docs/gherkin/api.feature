# language: pt
@API @VZS-142
Funcionalidade: Contratos da API da Verzel Store
  Como pessoa responsável pela qualidade
  Quero verificar as respostas e validações dos endpoints documentados
  Para conferir catálogo, cálculos e criação de pedidos com dados fictícios

  # Valores monetários no JSON são números. 100, 100.0 e 100.00 são equivalentes;
  # a apresentação com duas casas decimais pertence aos cenários da interface.

  Contexto:
    Dado que a URL base da API é "https://verzel-store.qa-test-verzel-store.workers.dev"
    E que o corpo das requisições POST é enviado com "Content-Type: application/json"

  @Cupom
  Esquema do Cenário: Calcular carrinho com cupom rejeitado - <variacao>
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":1}],"cupom":"<cupom>"}
      """
    Quando envio uma requisição POST para "/api/carrinho/calcular"
    Então o status HTTP deve ser 200
    E o resumo monetário da resposta deve conter os seguintes números:
      | campo                       | valor  |
      | subtotal                    | 100.00 |
      | desconto                    | 0.00   |
      | frete                       | 19.90  |
      | valorFaltanteFreteGratis     | 100.00 |
      | total                       | 119.90 |
    E "cupom.aplicado" deve ser falso
    E "cupom.mensagem" deve ser "<mensagem>"

    @CT-003 @CA03
    Exemplos: Cupom inexistente
      | variacao     | cupom       | mensagem        |
      | CT-003-API-C | INEXISTENTE | Cupom inválido. |

    @CT-004 @CA04
    Exemplos: Cupom expirado
      | variacao     | cupom       | mensagem        |
      | CT-004-API-C | VERAO2026   | Cupom expirado. |

  @Cupom
  Esquema do Cenário: Rejeitar pedido com cupom inválido ou expirado - <variacao>
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":1}],"cupom":"<cupom>","cliente":{"nome":"Maria Silva","email":"maria@example.com","cep":"01310-100"}}
      """
    Quando envio uma requisição POST para "/api/pedidos"
    Então o status HTTP deve ser 422
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "<codigo>"
    E "erro.mensagem" deve ser "<mensagem>"
    E "erro.campo" deve ser "cupom"
    E a resposta não deve conter um número de pedido criado

    @CT-003 @CA03
    Exemplos: Cupom inexistente
      | variacao     | cupom       | codigo         | mensagem        |
      | CT-003-API-P | INEXISTENTE | CUPOM_INVALIDO | Cupom inválido. |

    @CT-004 @CA04
    Exemplos: Cupom expirado
      | variacao     | cupom       | codigo         | mensagem        |
      | CT-004-API-P | VERAO2026   | CUPOM_EXPIRADO | Cupom expirado. |

  @CT-009 @CA10
  Esquema do Cenário: Permitir cinco unidades de um produto na API - <variacao>
    Dado o seguinte corpo JSON:
      """json
      <corpo>
      """
    Quando envio uma requisição POST para "<rota>"
    Então o status HTTP deve ser <status>
    E "itens[0].produtoId" deve ser "P005"
    E "itens[0].quantidade" deve ser o número 5
    E "subtotal" deve ser o número 500.00
    E "frete" deve ser o número 0.00
    E "total" deve ser o número 500.00

    Exemplos:
      | variacao     | rota                  | status | corpo                                                                                                                                     |
      | CT-009-API-5C | /api/carrinho/calcular | 200    | {"itens":[{"produtoId":"P005","quantidade":5}]}                                                                                           |
      | CT-009-API-5P | /api/pedidos           | 201    | {"itens":[{"produtoId":"P005","quantidade":5}],"cliente":{"nome":"Maria Silva","email":"maria@example.com","cep":"01310-100"}} |

  @CT-009 @CA10
  Esquema do Cenário: Rejeitar seis unidades do mesmo produto na API - <variacao>
    Dado o seguinte corpo JSON:
      """json
      <corpo>
      """
    Quando envio uma requisição POST para "<rota>"
    Então o status HTTP deve ser 422
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "QUANTIDADE_MAXIMA_EXCEDIDA"
    E "erro.mensagem" deve conter uma descrição do limite de cinco unidades por produto
    E "erro.campo" deve indicar "itens[0].quantidade"

    Exemplos:
      | variacao     | rota                  | corpo                                                                                                                                     |
      | CT-009-API-6C | /api/carrinho/calcular | {"itens":[{"produtoId":"P005","quantidade":6}]}                                                                                           |
      | CT-009-API-6P | /api/pedidos           | {"itens":[{"produtoId":"P005","quantidade":6}],"cliente":{"nome":"Maria Silva","email":"maria@example.com","cep":"01310-100"}} |

  @CT-011 @CA11 @CA01 @CA06 @CA07 @CA08 @CA09
  Esquema do Cenário: Conferir precisão dos cálculos e limites do frete na API - <variacao>
    Dado o seguinte corpo JSON:
      """json
      <corpo>
      """
    Quando envio uma requisição POST para "/api/carrinho/calcular"
    Então o status HTTP deve ser 200
    E o resumo monetário da resposta deve conter os seguintes números:
      | campo                   | valor      |
      | subtotal                | <subtotal> |
      | desconto                | <desconto> |
      | frete                   | <frete>    |
      | valorFaltanteFreteGratis | <faltante> |
      | total                   | <total>    |
    E "freteGratis" deve ser <frete_gratis>
    E o desconto deve corresponder somente aos produtos
    E o total deve corresponder ao subtotal menos desconto mais frete

    Exemplos: Valores com centavos disponíveis no catálogo
      | variacao      | corpo                                                                                                             | subtotal | desconto | frete | faltante | total  | frete_gratis |
      | CT-011-API-01 | {"itens":[{"produtoId":"P004","quantidade":1},{"produtoId":"P008","quantidade":3}],"cupom":"BEMVINDO10"} | 199.90   | 19.99    | 19.90 | 0.10     | 199.81 | falso        |
      | CT-011-API-02 | {"itens":[{"produtoId":"P007","quantidade":1}],"cupom":"BEMVINDO10"}                                   | 229.90   | 22.99    | 0.00  | 0.00     | 206.91 | verdadeiro   |

    @CT-006
    Exemplos: Fronteira inclusiva de duzentos reais
      | variacao      | corpo                                                                           | subtotal | desconto | frete | faltante | total  | frete_gratis |
      | CT-006-API-01 | {"itens":[{"produtoId":"P005","quantidade":2}],"cupom":"BEMVINDO10"} | 200.00   | 20.00    | 0.00  | 0.00     | 180.00 | verdadeiro   |
      | CT-006-API-02 | {"itens":[{"produtoId":"P005","quantidade":2}]}                         | 200.00   | 0.00     | 0.00  | 0.00     | 200.00 | verdadeiro   |

    Exemplos: Frete definido pelo subtotal antes do desconto
      | variacao      | corpo                                                                                                             | subtotal | desconto | frete | faltante | total  | frete_gratis |
      | CT-011-API-03 | {"itens":[{"produtoId":"P001","quantidade":1},{"produtoId":"P008","quantidade":3}],"cupom":"BEMVINDO10"} | 209.90   | 20.99    | 0.00  | 0.00     | 188.91 | verdadeiro   |

  @CT-012 @Checkout
  Esquema do Cenário: Criar pedido com cliente válido e CEP aceito - <variacao>
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":1}],"cupom":"BEMVINDO10","cliente":{"nome":"Maria Silva","email":"maria@example.com","cep":"<cep>"}}
      """
    Quando envio uma requisição POST para "/api/pedidos"
    Então o status HTTP deve ser 201
    E "numero" deve corresponder à expressão regular "^VZ-[0-9]{6}$"
    E "criadoEm" deve conter a data e a hora de criação em formato ISO 8601
    E "cliente.nome" deve ser "Maria Silva"
    E "cliente.email" deve ser "maria@example.com"
    E "cliente.cep" deve representar o CEP "01310100", independentemente da máscara
    E a resposta deve conter uma unidade do produto "P005" com preço unitário 100.00
    E o resumo monetário da resposta deve conter os seguintes números:
      | campo    | valor  |
      | subtotal | 100.00 |
      | desconto | 10.00  |
      | frete    | 19.90  |
      | total    | 109.90 |
    E "cupom.aplicado" deve ser verdadeiro

    Exemplos:
      | variacao      | cep       |
      | CT-012-API-01 | 01310-100 |
      | CT-012-API-02 | 01310100  |

  @CT-013 @Checkout
  Esquema do Cenário: Rejeitar um campo inválido do cliente por vez - <variacao>
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":1}],"cliente":{"nome":"<nome>","email":"<email>","cep":"<cep>"}}
      """
    Quando envio uma requisição POST para "/api/pedidos"
    Então o status HTTP deve ser 422
    E "erro.codigo" deve ser "DADOS_INVALIDOS"
    E "erro.mensagem" deve informar que existem dados inválidos
    E "erro.campos" deve conter o campo "<campo>" com uma mensagem explicativa
    E a resposta não deve conter um número de pedido criado

    Exemplos:
      | variacao      | nome        | email             | cep       | campo         |
      | CT-013-API-01 | Maria       | maria@example.com | 01310-100 | cliente.nome  |
      | CT-013-API-02 | Maria Silva | invalido          | 01310-100 | cliente.email |
      | CT-013-API-03 | Maria Silva | maria@example.com | 123       | cliente.cep   |
      | CT-013-API-04 |             | maria@example.com | 01310-100 | cliente.nome  |
      | CT-013-API-05 | Maria Silva |                   | 01310-100 | cliente.email |
      | CT-013-API-06 | Maria Silva | maria@example.com |           | cliente.cep   |

  @CT-013 @Checkout
  Cenário: Informar todos os campos inválidos do cliente na mesma resposta
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":1}],"cliente":{"nome":"Maria","email":"invalido","cep":"123"}}
      """
    Quando envio uma requisição POST para "/api/pedidos"
    Então o status HTTP deve ser 422
    E "erro.codigo" deve ser "DADOS_INVALIDOS"
    E "erro.campos" deve conter os campos abaixo com uma mensagem explicativa para cada um:
      | campo         |
      | cliente.nome  |
      | cliente.email |
      | cliente.cep   |
    E a resposta não deve conter um número de pedido criado

  @CT-014 @Catalogo
  Cenário: Consultar o catálogo documentado
    Quando envio uma requisição GET para "/api/produtos"
    Então o status HTTP deve ser 200
    E o corpo deve ser uma lista contendo os seguintes produtos e preços numéricos:
      | id   | nome                  | preco  |
      | P001 | Camiseta Essencial    | 59.90  |
      | P002 | Calça Jeans Slim      | 139.90 |
      | P003 | Tênis Casual Urbano   | 189.90 |
      | P004 | Boné Aba Curva        | 49.90  |
      | P005 | Mochila Urbana 20L    | 100.00 |
      | P006 | Kit 3 Pares de Meias  | 29.90  |
      | P007 | Jaqueta Corta-Vento   | 229.90 |
      | P008 | Garrafa Térmica 750ml | 50.00  |
    E cada produto deve conter identificador, nome, descrição, categoria e preço

  @CT-014 @Catalogo
  Cenário: Consultar um produto existente
    Quando envio uma requisição GET para "/api/produtos/P005"
    Então o status HTTP deve ser 200
    E "id" deve ser "P005"
    E "nome" deve ser "Mochila Urbana 20L"
    E "preco" deve ser o número 100.00
    E a descrição e a categoria devem ser consistentes com o produto no catálogo

  @CT-014 @Catalogo
  Cenário: Consultar um produto inexistente
    Dado que "P999" não existe no catálogo documentado
    Quando envio uma requisição GET para "/api/produtos/P999"
    Então o status HTTP deve ser 404
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "PRODUTO_NAO_ENCONTRADO"
    E "erro.mensagem" deve informar que o produto não foi encontrado

  @CT-015 @ValidacaoItens
  Esquema do Cenário: Rejeitar estrutura de itens inválida no cálculo - <variacao>
    Dado o seguinte corpo JSON:
      """json
      <corpo>
      """
    Quando envio uma requisição POST para "/api/carrinho/calcular"
    Então o status HTTP deve ser 422
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "<codigo>"
    E "erro.mensagem" deve descrever o motivo da rejeição
    E "erro.campo", quando presente, deve indicar o item ou campo correspondente

    Exemplos:
      | variacao      | corpo                                                                                  | codigo                  |
      | CT-015-API-01 | {}                                                                                     | ITENS_OBRIGATORIOS       |
      | CT-015-API-02 | {"itens":[]}                                                                           | ITENS_OBRIGATORIOS       |
      | CT-015-API-03 | {"itens":[null]}                                                                       | ITEM_INVALIDO           |
      | CT-015-API-04 | {"itens":[{"produtoId":"P999","quantidade":1}]}                                         | PRODUTO_NAO_ENCONTRADO   |
      | CT-015-API-05 | {"itens":[{"produtoId":"P005","quantidade":1},{"produtoId":"P005","quantidade":1}]}     | ITEM_DUPLICADO          |

  @CT-015 @ValidacaoItens
  Esquema do Cenário: Rejeitar quantidades inválidas no cálculo - <variacao>
    Dado o seguinte corpo JSON:
      """json
      {"itens":[{"produtoId":"P005","quantidade":<quantidade_json>}]}
      """
    Quando envio uma requisição POST para "/api/carrinho/calcular"
    Então o status HTTP deve ser 422
    E "erro.codigo" deve ser "QUANTIDADE_INVALIDA"
    E "erro.mensagem" deve informar que a quantidade precisa ser um inteiro maior ou igual a 1
    E "erro.campo" deve ser "itens[0].quantidade"

    Exemplos:
      | variacao      | quantidade_json |
      | CT-015-API-06 | 0               |
      | CT-015-API-07 | -1              |
      | CT-015-API-08 | 1.5             |
      | CT-015-API-09 | "abc"           |
      | CT-015-API-10 | null            |
      | CT-015-API-11 | true            |
      | CT-015-API-12 | "1"             |

  @CT-016 @Protocolo
  Cenário: Rejeitar JSON sintaticamente inválido
    Dado o seguinte corpo textual sem completar o objeto JSON:
      """
      {"itens":
      """
    Quando envio uma requisição POST para "/api/carrinho/calcular"
    Então o status HTTP deve ser 400
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "JSON_INVALIDO"
    E "erro.mensagem" deve informar que o corpo precisa ser um objeto JSON válido

  @CT-016 @Roteamento
  Cenário: Rejeitar rota da API inexistente
    Quando envio uma requisição GET para "/api/rota-inexistente"
    Então o status HTTP deve ser 404
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "ROTA_NAO_ENCONTRADA"
    E "erro.mensagem" deve informar que a rota não foi encontrada

  @CT-016 @Protocolo
  Cenário: Rejeitar método não permitido na rota de pedidos
    Quando envio uma requisição GET para "/api/pedidos"
    Então o status HTTP deve ser 405
    E a resposta deve conter o objeto "erro"
    E "erro.codigo" deve ser "METODO_NAO_PERMITIDO"
    E "erro.mensagem" deve informar que GET não é permitido nessa rota
