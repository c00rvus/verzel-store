# Dashboard de resultados

Visualização estática dos resultados, bugs, evidências e código do projeto. Os dados refletem os registros existentes no momento da geração.

| Local | Conteúdo |
| --- | --- |
| `dashboard/` | Fonte da interface, estilos e scripts |
| `dashboard/lib/` | Projeção dos documentos e registros para o dashboard |
| `dashboard/dist/` | Saída gerada, não versionada |

## Gerar e visualizar

Na raiz do projeto, com Node.js 22 ou superior:

```powershell
node dashboard/build.cjs
node dashboard/serve.cjs
```

Prévia em [http://127.0.0.1:4174/](http://127.0.0.1:4174/). Build e prévia usam os registros existentes, sem executar testes. Alterações nos documentos ou evidências exigem uma nova geração.

## Publicação

O workflow `.github/workflows/dashboard.yml` gera o dashboard e publica `dashboard/dist/` no GitHub Pages a partir da branch `main`. A origem de publicação do Pages deve ser **GitHub Actions**. O workflow publica os resultados registrados, sem executar a suíte.
