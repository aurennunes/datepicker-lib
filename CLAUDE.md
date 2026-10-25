# datepicker-lib

Calendário em modal para inputs de formulário, sem dependências. Um só ficheiro
de código (`src/index.ts`), compilado pelo `tsc` para um script global em
`build/datepicker.js` (com `build/datepicker.d.ts`).

## Comandos

```bash
npm install
npm run build   # tsc: gera build/datepicker.js e build/datepicker.d.ts
npm test        # compila e corre test/*.test.mjs com node:test e jsdom
```

O `build/` está no repositório: quem mexe no `src/` corre `npm run build` e
commita o `build/` no mesmo commit.

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
