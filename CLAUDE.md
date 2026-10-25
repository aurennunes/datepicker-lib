# datepicker-lib

Calendário para inputs de formulário, sem dependências.

## Estrutura

| Ficheiro | O que tem |
|---|---|
| `src/index.ts` | `datepicker_init` e as exportações públicas |
| `src/calendar.ts` | `Calendar`: estado de cada input, grelhas, teclado, intervalos, máscara |
| `src/view.ts` | O diálogo partilhado (um só por página), foco preso, posição do popover |
| `src/options.ts` | `DatepickerOptions` e a leitura dos atributos `data-*` |
| `src/dates.ts` | Formatar, ler, máscara e contas de datas, sem DOM |
| `src/locale.ts` | Textos `pt`/`en`, nomes do `Intl`, início da semana |
| `src/datepicker.css` | Todo o CSS, só com classes `.dpk-*` e variáveis `--dpk-*` |
| `scripts/build.mjs` | esbuild: ESM, UMD, minificado, CSS e tipos |
| `example/` | `index.html` (todas as opções), `csp.html`, `estreito.html` |

## Comandos

```bash
npm install
npm run build   # build/datepicker.{js,min.js,mjs,css,min.css} e build/types
npm test        # typecheck, build e test/*.test.mjs (node:test e jsdom)
```

- O `build/` está no repositório e o CI falha se não bater com o `src/`: quem mexe
  no `src/` corre `npm run build` e commita o `build/` no mesmo commit.
- Os testes carregam o `build/datepicker.js` como `<script>` num jsdom, como no
  browser, e o `build/datepicker.mjs` por `import`.
- Para ver no browser: `python3 -m http.server 8000 --directory .` e
  `http://localhost:8000/example/`. Um ecrã estreito real é o `example/estreito.html`
  (iframes de 390px).
- CI (`.github/workflows/ci.yml`) em Node 22 e 24; o `pages.yml` publica o
  `example/` e o `build/` em https://aurennunes.github.io/datepicker-lib/ a cada
  push para `master`.

## Estilo de commit: Conventional Commits

Desde 2026-10-25 (commit `a2e0343`). Os commits anteriores usavam
`<TIPO>[Âmbito]: mensagem`, e esse formato **não se usa mais**.

```
tipo(âmbito opcional): descrição curta no imperativo, em minúsculas

- corpo opcional, em lista, com o que mudou e porquê
```

- **Tipos:** `feat` (funcionalidade nova), `fix` (correção), `refactor`,
  `perf`, `test`, `docs`, `build` (dependências, `tsconfig`, `package.json`),
  `ci`, `chore`, `style` (só formatação, sem mudar comportamento).
- **Âmbito**, quando ajuda: `calendar`, `init`, `css`, `example`.
- **Mudança que parte quem usa a lib:** `!` depois do tipo
  (`feat(calendar)!: ...`) e uma linha `BREAKING CHANGE: ...` no corpo.
- **Língua:** português europeu, com acentos, e sem travessão.
- **Um commit por assunto** (por exemplo: `build`, `fix`, `test`, `docs`
  separados), em vez de um commit com tudo. O `TASKS-PROGRESS.md` vai no commit
  do trabalho que fecha as caixas, e nunca num commit à parte.

Exemplos reais deste repositório:

```
build: passa a npm, alvo ES2015 e saída com tipos
fix(calendar): corrige navegação, formato e acessibilidade
test: cobre navegação, formato, teclado e CSS com node:test e jsdom
docs: documenta instalação, uso e API no README
```
