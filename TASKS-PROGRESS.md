# Tarefas do datepicker-lib: estado detalhado e progresso

Cada cartão do quadro, detalhado contra o código real a **2026-10-25**. As
percentagens não são estimativa de esforço: são a fração das subtarefas listadas
que está feita e verificada no código, com referência a ficheiro e linha.

Documentos complementares: `README.md`. Quando discordarem, o código ganha.

**Legenda de progresso**

| Barra | Significado |
|---|---|
| `██████████ 100%` | Feito, testado, verificado a correr |
| `██████░░░░ 60%` | Metade das subtarefas verificadas |
| `███░░░░░░░ 30%` | Peças isoladas existem, não se ligam a nada |
| `░░░░░░░░░░ 0%` | Não existe nada |

**Marcadores de estado:** `🔄 EM CURSO (desde AAAA-MM-DD)` no título enquanto se
trabalha, `✅ (AAAA-MM-DD)` quando fecha. Sem marcador quer dizer por começar.

**Como manter este ficheiro:** ver `~/.claude/rules/tasks-progress.md`. Em
resumo: o cartão é marcado em curso **antes** de se começar (e criado, se não
existir), cada checkbox é ticada quando a subtarefa está **verificada** (não
escrita), e o ficheiro vai no mesmo commit do trabalho.

---

## Panorama

Biblioteca de um só ficheiro (`src/index.ts`, compilado para
`build/datepicker.js` como script global) que abre um calendário em modal ao
clicar num `<input data-type="datepicker">`. Tem as três vistas (dias, meses,
anos). Desde 2026-10-25 tem testes (`npm test`) e o exemplo funciona.

| Grupo | O que é | Conta como bloqueador hoje? |
|---|---|---|
| **A** | Fechadas **em dev** | - |
| **B** | Por fazer em dev | **Sim, é aqui que se trabalha** |
| **C** | Só se resolve com um servidor real | Não |
| **D** | Travadas por terceiros | Não |
| **E** | Estudo | Não |

---

### A. Fechadas em dev (2)

| # | Cartão | Progresso | Obs |
|---|---|---|---|
| 1 | Calendário base com vistas de dia, mês e ano | ✅ `██████████ 100%` | - |
| 2 | Corrigir defeitos, empacotar e testar a lib | ✅ `██████████ 100%` | - |

---

### B. Por fazer em DEV (0): é aqui que se trabalha

Vazio. As lacunas no fim do ficheiro são os candidatos a próximo cartão.

---

### C. Só se resolve com um servidor real (0)

Vazio.

---

### D. Travadas por terceiros (0)

Vazio.

---

### E. Estudo (0)

Vazio.

---

**Média: 100%** sobre os **2** cartões deste ficheiro (2026-10-25).

**Contando só o que se pode fazer agora** (grupos A e B, 2 cartões), a média é
**100%**.

---

# Tarefas fechadas

## 1. Calendário base com vistas de dia, mês e ano `██████████ 100%` ✅ (2026-10-25)

Existia antes deste quadro (commits `bf9bee9` a `4e0f41b`): classe `Calendar`
com modal, grelha de dias, grelha de meses, grelha de anos paginada de 24 em 24,
botões Limpar, Cancelar e Ok, e `datepicker_init` que injeta o CSS.

- [x] Grelha de dias do mês com o dia de hoje marcado
- [x] Grelha de meses e grelha de anos
- [x] Botões Limpar, Cancelar e Ok

**Pronto quando:** um clique no input abre o calendário e Ok escreve a data. ✅

---

## 2. Corrigir defeitos, empacotar e testar a lib `██████████ 100%` ✅ (2026-10-25)

**Como estava.** O código funcionava no caminho feliz, mas a varredura de
2026-10-25 encontrou (linhas da versão anterior, commit `4e0f41b`):

- `src/index.ts:351`: cada chamada a `init()` acrescenta um listener de `click`
  ao `window`, que nunca sai (fuga de memória a cada mudança de mês).
- `src/index.ts:451-465`: escolher um mês na grelha muda `currentMonth` mas não
  volta a desenhar os dias; a grelha mostra o mês anterior com o título novo.
- `src/index.ts:96-101`: o dia selecionado não é limitado ao fim do mês
  (31 de janeiro, "seguinte", Ok dá `31/2/AAAA`).
- `src/index.ts:167`: o botão de vista nasce com "Fevereiro 2023" fixo e só muda
  depois de escolher um mês.
- `src/index.ts:327`: o valor sai sem zero à esquerda (`5/3/2023`) quando o
  placeholder promete `dd/mm/aaaa`; um valor inválido no input dá `NaN`.
- `src/index.ts:296`: Cancelar fecha mas não repõe a data confirmada.
- `src/index.ts:540`: o CSS tem regras globais (`button`, `table`) que mexem na
  página de quem usa a lib, e é injetado de novo a cada chamada.
- `src/index.ts:547`: só apanha `input[type="text"]`.
- `example/index.html` nunca chama `datepicker_init()`: o exemplo não abre nada.
- `package.json`: `main` aponta para `src/index.js`, que não existe; `dev` e
  `start` correm código de DOM em Node; `tsconfig.json` pede `tsconfig-paths`,
  que não está instalado, e compila para ES3.
- Sem teclado (Escape não fecha), sem `role="dialog"`, e o input não dispara
  `input`/`change` ao receber a data, por isso formulários reativos não a veem.
- Sem testes.

**O que se fez.**

- [x] Remover a fuga de listeners no `window`
- [x] Escolher mês ou ano volta a desenhar a grelha de dias certa
- [x] Dia limitado ao fim do mês ao navegar
- [x] Título da vista correto desde o arranque e em todas as vistas
- [x] Formato `dd/mm/aaaa` com zeros, e leitura tolerante de valores inválidos
- [x] Cancelar repõe a data confirmada
- [x] CSS com âmbito `.dpk-*` e injetado uma só vez
- [x] Acessibilidade: Escape fecha, `role="dialog"`, abrir pelo teclado
- [x] Input dispara `input` e `change`; `onOk` recebe também o `Date`
- [x] `package.json` e `tsconfig.json` corretos, `npm run build` limpo
- [x] Exemplo funcional
- [x] Testes automáticos (`npm test`) verdes
- [x] Verificado num browser real (glance)
- [x] README com instalação, uso e API

**Decisões que não se revertem sem pensar**

- **Continua a ser um script global** (`outFile`), para não partir quem já usa
  `<script src>` e `datepicker_init`. Os helpers ficaram como estáticos de
  `Calendar` (`Calendar.parseDate`, `Calendar.formatDate`) para não sujarem o
  `window`.
- **Alvo ES2015** em vez de ES3: o código já usava `classList`, `template` e
  `NodeList.forEach`, que o ES3 não tinha de qualquer forma.
- **npm em vez de yarn**: o yarn não está instalado nesta máquina; o
  `yarn.lock` saiu e entrou o `package-lock.json`.
- **`onOk(data, Date)`**: o segundo argumento é novo; quem só lê o primeiro não
  parte. O formato passou a ter zeros (`05/03/2023`), como o placeholder já
  prometia.

**Encontrado e corrigido pelo caminho**

- [x] O foco não chegava ao Ok ao abrir, e por isso o Escape não fechava: o
  `visibility` em transição vale `hidden` no primeiro frame. A abrir passou a
  mudar sem transição (`src/index.ts`, regra `.dpk-modal.active`), e o Escape
  passou a ser ouvido no `document` enquanto o modal está aberto.
- [x] O modal fechado ficava por baixo da página com `z-index` negativo; passou
  a `visibility: hidden`, que não apanha cliques.

**Verificado.** `npm test`: 11 testes verdes (`test/datepicker.test.mjs`,
node:test com jsdom, a carregar o `build/datepicker.js` como `<script>`). No
browser, com o glance, em `example/index.html`: abrir no campo com
`05/03/2023`, escolher 2024, Fev e 29 com cliques reais deu `29/02/2024` no
input e no `onOk`; só com teclado, Enter no Ok escreveu `25/10/2026`, ArrowDown
reabriu e o Escape fechou com o foco de volta ao input; consola sem erros (só o
404 do `favicon.ico`); nenhum helper no `window`. A largura estreita
(`max-width` no contentor) não foi vista num ecrã pequeno.

**Pronto quando:** no exemplo, abrir o calendário, escolher um ano, um mês e um
dia, e carregar Ok escreve `dd/mm/aaaa` certo no input, sem erros de consola; e
`npm test` passa. ✅

**Depende de:** -

---

# Tarefas em desenvolvimento

(Nenhuma.)

---

# Próximas tarefas

(Nenhuma por agora.)

---

## As lacunas que o código mostra e o quadro não nomeia

- **Só português.** Os nomes dos meses e as iniciais dos dias estão fixos em
  `pt`; não há opção de idioma nem uso de `Intl`.
- **Sem limites de data.** Não há `min`/`max` nem dias desativados.
- **Só script global.** Já há `build/datepicker.d.ts`, mas não há build ESM.
- **Largura estreita por ver.** O contentor tem `max-width`, mas a grelha não
  foi vista num ecrã pequeno.
- **Intervalo de anos fixo** (hoje menos 100 a hoje mais 115).

---

## Ordem sugerida

1. **Build ESM com tipos**: é o que deixa usar a lib com um bundler.
2. **`min`/`max`**: o pedido mais comum num campo de data.
3. **Idioma** com `Intl`, que também resolve as iniciais dos dias.
