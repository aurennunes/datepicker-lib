# Datepicker Lib

Calendar to use in forms instead of the native datepicker. No dependencies: a
single script that turns any `<input data-type="datepicker">` into a field that
opens a modal calendar (day, month and year views) and writes the date as
`dd/mm/aaaa`.

## Install

```bash
git clone https://github.com/aurennunes/datepicker-lib
cd datepicker-lib
npm install
npm run build   # writes build/datepicker.js and build/datepicker.d.ts
```

## Usage

```html
<input type="text" data-type="datepicker" />
<input type="text" data-type="datepicker" value="05/03/2023" />

<script src="build/datepicker.js"></script>
<script>
	datepicker_init(function (date, value) {
		console.log(date);  // "09/03/2023"
		console.log(value); // Date object
	});
</script>
```

See `example/index.html` for a working page.

## API

### `datepicker_init(onOk?, input?) => Calendar[]`

- With no `input`, sets up every `input[data-type="datepicker"]` on the page.
- With an `input`, sets up only that one (it still needs
  `data-type="datepicker"`).
- `onOk(date, value)` runs when the user confirms: `date` is the formatted
  string, `value` is a `Date`.
- Safe to call more than once: inputs already set up are skipped, and the CSS
  is injected only once. Returns the calendars it created.

### `Calendar`

| Method | What it does |
|---|---|
| `open()` | Opens the calendar on the date in the input (or today) |
| `close()` / `cancel()` | Closes without touching the input |
| `confirm()` | Writes the selected date to the input and calls `onOk` |
| `clear()` | Empties the input |
| `next()` / `previous()` | Next or previous month, year, or page of years, depending on the view |
| `destroy()` | Removes the modal and the listeners from the input |
| `Calendar.parseDate(text)` | `"5/3/2023"` or `"05/03/2023"` to `Date`, or `null` if invalid |
| `Calendar.formatDate(date)` | `Date` to `"dd/mm/aaaa"` |

### Behaviour

- The input fires `input` and `change` whenever the calendar writes to it, so
  forms and frameworks see the new value.
- Keyboard: `Enter` or `ArrowDown` in the input opens the calendar, `Escape`
  closes it, and every day, month and year is a focusable button.
- When moving between months the day is kept inside the month (31 January,
  next month, gives the last day of February).
- All CSS rules are scoped to `.dpk-*` classes; nothing leaks into the page.

## Development

```bash
npm test   # builds, then runs the tests in test/ with node:test and jsdom
```
