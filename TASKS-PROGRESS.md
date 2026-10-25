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

Versão 2.0.0: a lib vive em `src/` (datas, idioma, opções, diálogo partilhado e
calendário), e o esbuild gera ESM, UMD, minificado, CSS e tipos em `build/`.
Tem limites de data, intervalos, máscara, idiomas, teclado completo, temas e três
modos de apresentação, com 68 testes (`npm test`). CI no GitHub Actions e demonstração
em https://aurennunes.github.io/datepicker-lib/. O que falta no grupo B é só
observar três comportamentos que dependem do sistema de um telemóvel.

| Grupo | O que é | Conta como bloqueador hoje? |
|---|---|---|
| **A** | Fechadas **em dev** | - |
| **B** | Por fazer em dev | **Sim, é aqui que se trabalha** |
| **C** | Só se resolve com um servidor real | Não |
| **D** | Travadas por terceiros | Não |
| **E** | Estudo | Não |

---

### A. Fechadas em dev (16)

| # | Cartão | Progresso | Obs |
|---|---|---|---|
| 1 | Calendário base com vistas de dia, mês e ano | ✅ `██████████ 100%` | - |
| 2 | Corrigir defeitos, empacotar e testar a lib | ✅ `██████████ 100%` | - |
| 3 | Datas mínima e máxima, e dias bloqueados | ✅ `██████████ 100%` | - |
| 4 | Objeto de opções e configuração por atributos | ✅ `██████████ 100%` | - |
| 5 | Idioma e início da semana | ✅ `██████████ 100%` | - |
| 6 | Escrever a data à mão, com máscara | ✅ `██████████ 100%` | - |
| 7 | Botão Hoje | ✅ `██████████ 100%` | - |
| 8 | Intervalos de datas | ✅ `██████████ 100%` | - |
| 9 | Setas dentro da grelha | ✅ `██████████ 100%` | - |
| 10 | Foco preso no diálogo | ✅ `██████████ 100%` | - |
| 11 | Contraste WCAG AA | ✅ `██████████ 100%` | - |
| 15 | Um só diálogo partilhado por todos os inputs | ✅ `██████████ 100%` | - |
| 16 | Delegação de eventos e menos trabalho por render | ✅ `██████████ 100%` | - |
| 17 | CSS à parte, para sites com CSP restrita | ✅ `██████████ 100%` | - |
| 18 | Build ESM, UMD e minificado | ✅ `██████████ 100%` | - |
| 19 | CI no GitHub Actions e demonstração no GitHub Pages | ✅ `██████████ 100%` | - |

---

### B. Por fazer em DEV (3): é aqui que se trabalha

| # | Cartão | Progresso | O que falta |
|---|---|---|---|
| 12 | Temas por variáveis CSS e modo escuro | 🔄 `████████░░ 75%` | Ver o tema seguir o modo escuro do sistema (emulador vetado pelo dono) |
| 13 | Ecrãs pequenos: folha em baixo e popover junto ao input | 🔄 `████████░░ 80%` | Ver a folha num telemóvel (emulador vetado pelo dono; vista num iframe de 390px) |
| 14 | Respeitar `prefers-reduced-motion` | 🔄 `░░░░░░░░░░ 0%` | Ver o efeito com o movimento reduzido do sistema (emulador vetado pelo dono) |

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

**Média: 92%** sobre os **19** cartões deste ficheiro (2026-10-25).

**Contando só o que se pode fazer agora** (grupos A e B, 19 cartões), a média é
**92%**.

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

## 3. Datas mínima e máxima, e dias bloqueados `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Nada: não há `min`, `max` nem forma de bloquear dias; o intervalo de anos é fixo em `initYears` (hoje menos 100 a hoje mais 115).

**O que falta.** Nada.

- [x] Opções `min` e `max` (`Date` ou texto no formato) e atributos `data-min`/`data-max`
- [x] Dias fora do intervalo aparecem bloqueados e não se escolhem por clique nem por teclado
- [x] Opção `disabledDays` (dias da semana) e `isDisabled(date)` para bloqueios livres
- [x] Meses e anos totalmente fora do intervalo bloqueados nas grelhas; setas param nos limites
- [x] Intervalo de anos da grelha passa a vir de `min`/`max` quando existem
- [x] Ok desativado quando a data em curso está bloqueada; data escrita fora do intervalo fica inválida
- [x] Testes e verificação no browser

**Verificado.** `test/features.test.mjs` (cartão 3, 6 testes). No browser
(glance, `example/index.html`, campo Marcação com `min` hoje, `max` hoje mais 60
dias e fins de semana bloqueados): seta para trás desligada em outubro, para a
frente desligada em dezembro, dias livres em dezembro só de 1 a 24 sem fins de
semana, o Playwright recusou clicar no 26 por estar `aria-disabled`, e o 24
confirmou `24/12/2026`.

**Encontrado e corrigido pelo caminho**

- [x] Hoje (25/10/2026) era domingo e estava bloqueado, mas abria como escolhido,
  a azul, com o Ok desligado. Agora, sem data, abre no primeiro dia livre
  (`nearestEnabled` em `src/calendar.ts`), e um dia bloqueado com foco não
  parece escolhido. Teste novo em `test/features.test.mjs`.

**Pronto quando:** com `min` e `max` definidos, os dias fora ficam a cinzento, não se escolhem, e as setas não passam do limite. ✅

**Depende de:** cartão 4

---

## 4. Objeto de opções e configuração por atributos `██████████ 100%` ✅ (2026-10-25)

**O que existe.** `datepicker_init(onOk?, input?)` só aceita a função de confirmação e um input.

**O que falta.** Nada.

- [x] `datepicker_init(opções?, alvo?)` com objeto de opções tipado (`DatepickerOptions`)
- [x] Forma antiga `datepicker_init(onOk, input)` continua a funcionar
- [x] Alvo aceita um input ou um seletor CSS
- [x] Atributos `data-*` por input (`data-min`, `data-max`, `data-format`, `data-locale`, `data-range`, `data-first-day`, `data-disabled-days`, `data-display`, `data-theme`) sobrepõem-se às opções
- [x] Opção `format` com `dd`, `mm` e `aaaa`/`yyyy` e qualquer separador
- [x] Testes e documentação no README

**Verificado.** `test/features.test.mjs` (cartão 4, 5 testes). No browser, o
exemplo liga oito campos por atributos e um (`#marcacao`) por objeto e seletor;
o campo com `data-format="aaaa-mm-dd"` confirmou `2026-10-09`.

**Pronto quando:** um input configurado só com atributos `data-*` comporta-se como o configurado por objeto, e o código antigo continua a correr. ✅

**Depende de:** -

---

## 5. Idioma e início da semana `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Meses e iniciais `D S T Q Q S S` fixos em português, semana sempre ao domingo.

**O que falta.** Nada.

- [x] Meses, dias da semana e cabeçalho com `Intl.DateTimeFormat` no idioma pedido
- [x] Textos da interface (Limpar, Hoje, Cancelar, Ok, rótulos acessíveis) em `pt` e `en`, com opção `labels` para sobrepor
- [x] Início da semana pelo idioma (`Intl.Locale` com tabela de recurso) e opção `firstDayOfWeek`
- [x] Por omissão `pt-PT`, com o início da semana que o `Intl` dá (domingo)
- [x] Testes em `pt-PT`, `pt-BR` e `en-US`, e verificação no browser

**Verificado.** `test/features.test.mjs` (cartão 5, 4 testes). No browser:
`en-US` com "October 25", "S M T W T F S" e "CLEAR / TODAY / CANCEL / OK";
`pt-AO` com a semana à segunda e o domingo na última coluna; `pt-PT` ao domingo.

**Pronto quando:** com `locale: "en-US"` o calendário aparece em inglês com a semana ao domingo, e em `pt-AO` em português com a semana à segunda.

**Subtarefa corrigida durante o trabalho.** A caixa dizia "por omissão `pt-PT`,
semana à segunda". O CLDR (`new Intl.Locale("pt-PT").getWeekInfo().firstDay`)
dá 7, domingo; quem começa à segunda é `pt-AO`. A caixa passou a seguir o
`Intl`, que é o que o resto do cartão promete, e o critério usa `pt-AO`. ✅

**Depende de:** cartão 4

---

## 6. Escrever a data à mão, com máscara `██████████ 100%` ✅ (2026-10-25)

**O que existe.** O que se escreve no input só é lido quando o calendário abre; nada valida.

**O que falta.** Nada.

- [x] Máscara enquanto se escreve, a seguir o formato, sem estragar a posição do cursor
- [x] Ao sair do campo (`change`) a data é validada, normalizada e chama `onOk`
- [x] Data inválida ou bloqueada marca `aria-invalid="true"` e a classe `dpk-invalid`, sem apagar o texto
- [x] Opção `mask: false` para desligar
- [x] Testes e verificação no browser a escrever com o teclado

**Verificado.** `test/features.test.mjs` (cartão 6, 5 testes). No browser, só com
teclas reais: Shift+Tab até ao campo (não abre), "07111995" deu `07/11/1995`, Tab
confirmou e o `onOk` mostrou a data; Backspace a apagar `31/02` não lutou com a
máscara; `31/02/2023` ficou com contorno vermelho e `aria-invalid="true"`, sem
apagar o texto e sem chamar o `onOk`.

**Pronto quando:** escrever `05032023` no campo dá `05/03/2023`, e escrever `31/02/2023` marca o campo como inválido. ✅

**Depende de:** cartão 4

---

## 7. Botão Hoje `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Não existe.

**O que falta.** Nada.

- [x] Botão Hoje no rodapé leva ao mês de hoje e escolhe o dia
- [x] Desativado quando hoje está bloqueado
- [x] Teste e verificação no browser

**Verificado.** `test/features.test.mjs` (cartão 7, 2 testes). No browser, a partir
de março de 2023 o Hoje mostrou outubro de 2026 com o 25 escolhido; no campo com
fins de semana bloqueados o Hoje ficou desligado.

**Pronto quando:** um clique em Hoje, a partir de outro ano, mostra o mês atual com hoje escolhido. ✅

**Depende de:** cartão 3

---

## 8. Intervalos de datas `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Só se escolhe uma data.

**O que falta.** Nada.

- [x] Opção `range` (e `data-range`): primeiro clique é o início, segundo é o fim
- [x] Dias entre o início e o fim marcados, com pré-visualização ao passar o rato
- [x] Input fica `dd/mm/aaaa - dd/mm/aaaa`, `onOk(texto, início, fim)`
- [x] Ler um intervalo escrito no input ao abrir e ao sair do campo
- [x] Testes e verificação no browser

**Verificado.** `test/features.test.mjs` (cartão 8, 4 testes). No browser: clique no
12, rato por cima do 20 mostrou a faixa 12 a 20 antes do segundo clique, clique
no 20 deu "12/10 - 20/10" no cabeçalho e Ok escreveu `12/10/2026 - 20/10/2026`.

**Pronto quando:** num campo com `data-range`, escolher 3 e 9 de março escreve `03/03/2023 - 09/03/2023`. ✅

**Depende de:** cartões 4 e 6

---

## 9. Setas dentro da grelha `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Cada dia é um botão com Tab: chegar ao dia 28 obriga a dezenas de Tabs.

**O que falta.** Nada.

- [x] Só uma célula com `tabindex=0` (roving tabindex); a grelha tem `role="grid"`
- [x] Setas mudam o dia (±1, ±7), Home/End vão ao início e fim da semana
- [x] PageUp/PageDown mudam o mês, com Shift mudam o ano
- [x] Setas também nas grelhas de meses e de anos
- [x] Ao abrir, o foco vai para o dia escolhido
- [x] Testes e verificação no browser só com teclado

**Verificado.** `test/interaction.test.mjs` (cartão 9, 5 testes). No browser, com
teclas reais a partir de 5/03/2023: direita, baixo, PageDown e End foram dar ao
sábado 15 de abril, com uma só célula no Tab; Enter no Ok escreveu `15/04/2023` e
o foco voltou ao input.

**Pronto quando:** só com o teclado, abrir, andar três semanas para a frente com as setas e carregar Enter e Ok escreve a data certa. ✅

**Depende de:** -

---

## 10. Foco preso no diálogo `██████████ 100%` ✅ (2026-10-25)

**O que existe.** O Tab sai do calendário para a página por trás.

**O que falta.** Nada.

- [x] Tab e Shift+Tab ciclam dentro do diálogo
- [x] Ao fechar, o foco volta ao input
- [x] Teste e verificação no browser

**Verificado.** `test/interaction.test.mjs` (cartão 10, 2 testes). No browser,
doze Tabs seguidos com o calendário aberto: o foco deu duas voltas (rodapé,
botão de vista, setas, dia, rodapé) e nunca saiu do diálogo.

**Pronto quando:** carregar Tab vinte vezes com o calendário aberto nunca põe o foco fora dele. ✅

**Depende de:** -

---

## 11. Contraste WCAG AA `██████████ 100%` ✅ (2026-10-25)

**O que existe.** O azul `#2979ff` sobre branco dá cerca de 4:1, abaixo de 4,5:1 para texto pequeno.

**O que falta.** Nada.

- [x] Cores por omissão com contraste de pelo menos 4,5:1 em todos os pares de texto, no tema claro e no escuro
- [x] Teste automático que calcula o contraste das variáveis do CSS

**Verificado.** `test/styles-build.test.mjs` calcula o contraste das variáveis do
CSS: todos os pares de texto a 4,5:1 ou mais, nos dois temas. O azul antigo
`#2979ff` dava cerca de 4:1 e passou a `#1565c0` (5,75:1).

**Pronto quando:** o teste de contraste passa para todos os pares de texto dos dois temas. ✅

**Depende de:** cartão 12

---

## 15. Um só diálogo partilhado por todos os inputs `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Cada input cria o seu modal: 20 campos dão 20 modais no DOM.

**O que falta.** Nada.

- [x] Um só diálogo no DOM, criado ao primeiro uso, ligado ao input que o abriu
- [x] Cada input guarda as suas opções e a sua data
- [x] `destroy()` do último input remove o diálogo
- [x] Testes (20 inputs, 1 diálogo) e verificação no browser com dois campos

**Verificado.** `test/interaction.test.mjs` (cartão 15, 4 testes). No browser,
depois de abrir nove campos diferentes: um só `.dpk-root` e um só `#dpk-style` no
DOM, e cada campo abriu com o seu idioma, intervalo e tema.

**Pronto quando:** uma página com 20 campos tem um só `.dpk-root`, e cada campo continua a abrir com a sua própria data e opções. ✅

**Depende de:** -

---

## 16. Delegação de eventos e menos trabalho por render `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Um listener por célula, refeito a cada render, e a grelha inteira refeita a cada tecla.

**O que falta.** Nada.

- [x] Um listener por grelha (delegação) em vez de um por célula
- [x] Mover o foco dentro do mesmo mês só atualiza atributos, sem refazer a grelha
- [x] Teste que confirma que as células se mantêm ao andar com as setas

**Verificado.** `test/interaction.test.mjs` (cartão 16, 3 testes): andar com as
setas no mesmo mês mantém os mesmos elementos; uma célula clonada sem listeners
continua a responder, porque quem ouve é o `tbody`.

**Pronto quando:** andar com as setas dentro do mesmo mês não cria elementos novos. ✅

**Depende de:** cartão 9

---

## 17. CSS à parte, para sites com CSP restrita `██████████ 100%` ✅ (2026-10-25)

**O que existe.** O CSS vive numa string dentro do JS e é sempre injetado num `<style>`.

**O que falta.** Nada.

- [x] CSS num ficheiro próprio (`src/datepicker.css`) publicado como `build/datepicker.css` e `.min.css`
- [x] Opção `injectStyles: false` para usar o ficheiro, e `styleNonce` para CSP com nonce
- [x] Teste e documentação

**Verificado.** `test/styles-build.test.mjs` (cartão 17, 2 testes). No browser,
`example/csp.html` com `style-src 'self'`: o calendário aparece com o estilo todo
pelo `<link>`, sem `<style>` injetado e sem violações; um `<style>` injetado à mão
na mesma página foi bloqueado pela CSP (erro na consola), que é o problema que a
opção resolve.

**Pronto quando:** com `injectStyles: false` e o `datepicker.css` num `<link>`, o calendário aparece igual e não há `<style>` injetado. ✅

**Depende de:** cartão 18

---

## 18. Build ESM, UMD e minificado `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Só o script global do `tsc` (cerca de 20KB por minificar).

**O que falta.** Nada.

- [x] Build com esbuild: `datepicker.mjs` (ESM), `datepicker.js` (UMD), `datepicker.min.js`
- [x] Tipos em `build/types`, `exports` no `package.json`
- [x] O UMD continua a expor `datepicker_init` e `Calendar` no `window`
- [x] Testes correm sobre o UMD e sobre o ESM
- [x] Tamanhos medidos antes e depois

**Verificado.** `test/styles-build.test.mjs` (cartão 18, 4 testes): ESM sem DOM,
UMD por CommonJS e por `<script>`, minificado no browser, e `package.json` a
apontar para ficheiros que existem. Instalado como dependência numa pasta à parte
(`npm install <caminho>`): `import { datepicker_init } from "datepicker-lib"`,
`require("datepicker-lib")` e `datepicker-lib/datepicker.css` resolvem.

**Tamanhos.** Antes: `build/datepicker.js` com 20 970 B, sem minificar, sem as
funcionalidades destes cartões. Depois: `datepicker.min.js` com 32 129 B
(10 063 B com gzip), `datepicker.js` com 54 073 B, `datepicker.mjs` com 50 127 B,
`datepicker.min.css` com 6 538 B. Cresceu porque a lib passou a fazer muito
mais; o minificado é o que se serve.

**Pronto quando:** `import { datepicker_init } from "datepicker-lib"` funciona, e o `<script src>` antigo também. ✅

**Depende de:** -

---

## 19. CI no GitHub Actions e demonstração no GitHub Pages `██████████ 100%` ✅ (2026-10-25)

**O que existe.** Nada corre no GitHub.

**O que falta.** Nada.

- [x] Workflow de CI: `npm ci`, `npm test` e build atualizado, em Node 22 e 24
- [x] Workflow de Pages que publica o exemplo com o build
- [x] Pages ativado no repositório
- [x] CI verde e página publicada, vistos a correr

**Subtarefa corrigida durante o trabalho.** A caixa do CI dizia "Node 20 e 22".
A primeira execução passou assim, mas avisou que as ações v4 correm em Node 20,
descontinuado pelo GitHub, e o Node 20 saiu de suporte em abril de 2026. A
matriz passou a Node 22 e 24 e as ações às versões atuais (`checkout` e
`setup-node` v7, `configure-pages` v6, `upload-pages-artifact` v5,
`deploy-pages` v5), em `b1bcc74`.

**Verificado.** Execução 40177912615 do CI: `test (22)` e `test (24)` a verde,
68 testes e 68 a passar em cada um, e o passo `build/ atualizado` sem diferenças;
sem avisos de descontinuação. Execução 40177912650 do Pages a verde. O Pages foi
ativado com `gh api -X POST repos/aurennunes/datepicker-lib/pages -f
build_type=workflow`. No browser, https://aurennunes.github.io/datepicker-lib/
redireciona para `example/`, carrega o `build/datepicker.js` publicado, e o
intervalo de 5 a 9 de outubro escreveu `05/10/2026 - 09/10/2026` no input e no
`onOk`.

**Pronto quando:** cada push corre os testes no GitHub, e o exemplo abre no endereço do GitHub Pages. ✅

**Depende de:** cartão 18

---

# Tarefas em desenvolvimento

## 12. Temas por variáveis CSS e modo escuro `████████░░ 75%` 🔄 EM CURSO (desde 2026-10-25)

**O que existe.** Cores fixas no CSS; mudar a cor obriga a sobrepor regras uma a uma.

**O que falta.** As caixas por ticar, com o motivo em baixo.

- [x] Variáveis `--dpk-*` (cores, raio, fonte, sombra) documentadas
- [ ] Modo escuro por `prefers-color-scheme`
- [x] Opção `theme` (`auto`, `light`, `dark`) e `data-theme`
- [x] Verificação no browser dos dois temas

**Verificado.** No browser: tema claro, `data-theme="dark"` (cabeçalho
`#8ab4f8`, fundo `#202124`) e o tema verde do exemplo só com variáveis CSS.
O Chromium lê o bloco `@media (prefers-color-scheme: dark)` tal como escrito, e o
conteúdo dele, aplicado sem a condição, dá as cores escuras certas; um teste
garante que é igual ao bloco `data-theme="dark"`.

**Porque a caixa do modo escuro do sistema fica por ticar.** Falta ver a página a
mudar sozinha com o sistema em modo escuro. O dono pediu para não abrir o
emulador Android; o Chromium do glance (Playwright) fixa o esquema claro, e um
`iframe` com `color-scheme: dark` não passou o escuro ao `prefers-color-scheme`
neste Chromium (151).

**Pronto quando:** mudar `--dpk-primary` num só sítio muda a cor do calendário inteiro, e o tema escuro aparece com `theme: "dark"`.

**Depende de:** -

---

## 13. Ecrãs pequenos: folha em baixo e popover junto ao input `████████░░ 80%` 🔄 EM CURSO (desde 2026-10-25)

**O que existe.** Modal fixo ao centro com 512px de altura e tabelas de 304px.

**O que falta.** As caixas por ticar, com o motivo em baixo.

- [x] Opção `display` (`auto`, `popover`, `sheet`, `modal`) e `data-display`
- [x] Em `auto`: folha em baixo até 599px de largura, popover junto ao input acima disso
- [x] Popover vira para cima quando não cabe em baixo e não sai do ecrã; acompanha scroll e resize
- [x] Altura deixa de ser fixa
- [ ] Verificado no browser (popover) e num telemóvel Android emulado (folha)

**Verificado.** `test/interaction.test.mjs` (cartão 13, 3 testes). No browser: no
desktop abre em popover colado ao input; perto do fundo vira para cima (acaba 6px
acima do input); com scroll acompanha o input. No `example/estreito.html`, um
`iframe` de 390px (uma janela verdadeira, onde `(max-width: 599px)` é
verdadeira): o modo `auto` abriu em folha, a toda a largura, colada ao fundo, e
escolher o 17 e Ok escreveu `17/03/2023`.

**Encontrado e corrigido pelo caminho**

- [x] Quando não cabia nem por baixo nem por cima, o popover encostava à margem e
  tapava o input. Agora fica do lado com mais espaço e encolhe, com scroll por
  dentro (`position` em `src/view.ts`); visto no browser e com teste.

**Porque a última caixa fica por ticar.** Pedia ver a folha num telemóvel Android
emulado, e o dono pediu para não abrir o emulador. A folha foi vista no `iframe`
de 390px, que é um ecrã estreito real no Chromium, mas não é um telemóvel.

**Pronto quando:** num telemóvel o calendário sobe de baixo a toda a largura; no computador abre colado ao input.

**Depende de:** -

---

## 14. Respeitar `prefers-reduced-motion` `░░░░░░░░░░ 0%` 🔄 EM CURSO (desde 2026-10-25)

**O que existe.** A regra `@media (prefers-reduced-motion: reduce)` em
`src/datepicker.css` tira as transições do fundo, do contentor e da raiz. Um teste
confirma a regra; no browser, o Chromium lê-a tal como escrita e, aplicada sem a
condição, as transições passam a `0s` e a opacidade é 1 no instante em que abre.

**Porque as duas caixas ficam por ticar.** As duas pedem ver o efeito com a
preferência do sistema ligada. O dono pediu para não abrir o emulador Android, e
o Chromium do glance (Playwright) fixa o movimento normal. O código está escrito e
testado; falta só a observação, por isso a barra a 0% não quer dizer que não
exista nada.

**O que falta.** As caixas por ticar, com o motivo em baixo.

- [ ] Sem transições com `prefers-reduced-motion: reduce`
- [ ] Teste que confirma a regra no CSS e verificação no browser

**Pronto quando:** com o movimento reduzido no sistema, o calendário aparece sem animar.

**Depende de:** -

---

# Próximas tarefas

(Nenhuma por agora.)

---

## As lacunas que o código mostra e o quadro não nomeia

- **Não está publicado no npm.** Instala-se com
  `npm install github:aurennunes/datepicker-lib` ou por `git clone`. Ficou fora
  desta ronda por decisão do dono (era o ponto 17 da lista de melhorias).

---

## Ordem sugerida

1. **Cartões 12, 13 e 14**: uma só sessão num telemóvel (emulador Android ou
   dispositivo real) fecha os três: modo escuro do sistema ligado, movimento
   reduzido ligado, e a folha num ecrã de telemóvel. Esperam que o dono autorize
   o emulador, ou que veja os três no telemóvel dele.
