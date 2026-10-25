# Datepicker Lib

[![CI](https://github.com/aurennunes/datepicker-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/aurennunes/datepicker-lib/actions/workflows/ci.yml)

Calendar to use in forms instead of the native datepicker. No dependencies.
It turns any `<input>` into a field that opens a calendar (day, month and year
views), writes the date in the format you choose, and lets people type it too.

**Demo:** https://aurennunes.github.io/datepicker-lib/

- Min and max dates, blocked weekdays, or any rule you write
- Single dates or ranges
- Any language through `Intl`, with the right first day of the week
- Typing with a mask (`05032023` becomes `05/03/2023`), validated on blur
- Full keyboard support and a focus-trapped dialog (WAI-ARIA grid pattern)
- Popover next to the input on desktop, bottom sheet on phones
- Theme with CSS variables, dark mode, `prefers-reduced-motion`
- Works under a strict Content Security Policy
- One shared dialog for the whole page, however many inputs there are

## Install

As a dependency (not on npm yet, so straight from GitHub):

```bash
npm install github:aurennunes/datepicker-lib
```

Or clone it:

```bash
git clone https://github.com/aurennunes/datepicker-lib
cd datepicker-lib
npm install
npm run build
```

`build/` is committed, so you can also use the files directly.

| File | What it is |
|---|---|
| `build/datepicker.js` | UMD: `<script>`, CommonJS or AMD |
| `build/datepicker.min.js` | The same, minified |
| `build/datepicker.mjs` | ES module, for bundlers |
| `build/datepicker.css`, `.min.css` | The CSS, for `injectStyles: false` |
| `build/types/` | TypeScript declarations |

## Usage

With a script tag:

```html
<input type="text" data-type="datepicker" />

<script src="build/datepicker.js"></script>
<script>
	datepicker_init(function (text, date) {
		console.log(text); // "09/03/2023"
		console.log(date); // Date
	});
</script>
```

With a bundler:

```js
import { datepicker_init } from "datepicker-lib";

datepicker_init({ min: new Date(), disabledDays: [0, 6], onOk: (text) => save(text) }, "#booking");
```

See `example/index.html` for every option working on one page.

## API

### `datepicker_init(options?, target?) => Calendar[]`

- No `target`: sets up every `input[data-type="datepicker"]`.
- `target`: an input, or a CSS selector (those inputs do not need `data-type`).
- The old form `datepicker_init(onOk, input)` still works.
- Inputs already set up are skipped. Returns the calendars it created.

### Options

Every option can also be set per input with a `data-*` attribute, which wins
over the object.

| Option | Attribute | Default | What it does |
|---|---|---|---|
| `onOk(text, date, end?)` | | | Called when a date is confirmed (Ok, or typed and valid). `end` only with `range` |
| `min`, `max` | `data-min`, `data-max` | | `Date`, text in `format`, or `yyyy-mm-dd` |
| `disabledDays` | `data-disabled-days="0,6"` | `[]` | Blocked weekdays, 0 = Sunday |
| `isDisabled(date)` | | | Return `true` to block a day |
| `locale` | `data-locale` | `"pt-PT"` | Month and weekday names, first day of the week, UI texts (`pt` and `en` built in, others fall back to English) |
| `labels` | | | Override any UI text (`ok`, `cancel`, `today`, `clear`, ...) |
| `firstDayOfWeek` | `data-first-day` | from `locale` | 0 = Sunday ... 6 = Saturday |
| `format` | `data-format` | `"dd/mm/aaaa"` | `dd`, `mm` and `aaaa` (or `yyyy`), any separators |
| `mask` | `data-mask="false"` | `true` | Mask while typing |
| `range` | `data-range` | `false` | Pick a start and an end: `"03/03/2023 - 09/03/2023"` |
| `display` | `data-display` | `"auto"` | `auto` (sheet below 600px, popover above), `popover`, `sheet`, `modal` |
| `theme` | `data-theme` | `"auto"` | `auto` follows the system, or `light` / `dark` |
| `injectStyles` | | `true` | `false` to load `datepicker.css` yourself (strict CSP) |
| `styleNonce` | | | `nonce` for the injected `<style>` |

### `Calendar`

| Member | What it does |
|---|---|
| `open()`, `close()`, `cancel()` | Open; close without touching the input |
| `confirm()` | Write the selection to the input and call `onOk` |
| `clear()`, `today()` | Empty the input; jump to today |
| `next()`, `previous()` | Next or previous month, year or page of years |
| `value`, `end` | The confirmed date (or range start) and range end |
| `isDisabled(date)` | Whether a day can be picked |
| `destroy()` | Remove the listeners; the last one removes the dialog |
| `Calendar.parseDate(text, format?)` | Text to `Date`, or `null` |
| `Calendar.formatDate(date, format?)` | `Date` to text |

`parseDate`, `formatDate`, `parseRange` and `formatRange` are also exported on
their own.

### Behaviour

- **Typing:** reaching the input with Tab does not open the calendar, so
  people can type. On blur the date is checked: if it is valid it is
  normalised and `onOk` runs; if not, the input gets `aria-invalid="true"` and
  the `dpk-invalid` class, and the text stays.
- **Keyboard:** `Enter` or `ArrowDown` in the input opens the calendar. In the
  grid, arrows move by day and week, `Home`/`End` go to the start and end of
  the week, `PageUp`/`PageDown` change month (with `Shift`, year). `Escape`
  closes. `Tab` never leaves the dialog while it is open.
- **Events:** the input fires `input` and `change` whenever the calendar
  writes to it.
- With no date, the calendar opens on the first day that can be picked.

## Theming

Override the variables on `.dpk-root`:

```css
.dpk-root {
	--dpk-primary: #2e7d32;   /* header, selected day, buttons */
	--dpk-on-primary: #fff;   /* text on primary */
	--dpk-surface: #fff;
	--dpk-on-surface: #1f1f1f;
	--dpk-muted: #5f6368;     /* weekdays, arrows */
	--dpk-range: #d7ecd8;     /* days inside a range */
	--dpk-radius: 12px;
	--dpk-font: inherit;
}
```

The default colours meet WCAG AA (4.5:1) for every text pair, in light and
dark; a test checks it. All rules live under `.dpk-*` classes.

## Strict CSP

```html
<link rel="stylesheet" href="build/datepicker.css" />
<script src="build/datepicker.js"></script>
<script src="app.js"></script> <!-- datepicker_init({ injectStyles: false }) -->
```

`example/csp.html` runs under `style-src 'self'`.

## Upgrading from 1.x

- The dialog is shared: `.dpk-modal` became `.dpk-root`, open is
  `.dpk-open`, and cells use `dpk-active` and `dpk-today`.
- Without `display`, the calendar opens as a popover (or a sheet on phones),
  not as a centred modal. Use `display: "modal"` for the old look.
- The default primary colour is darker (`#1565c0`) to meet contrast rules.

## Development

```bash
npm test          # typecheck, build, then the tests in test/ (node:test and jsdom)
npm run build     # esbuild: build/datepicker.{js,min.js,mjs,css,min.css} and types
```

CI runs `npm test` on Node 22 and 24 and checks that `build/` is up to date.
Every push to `master` publishes `example/` to GitHub Pages.
