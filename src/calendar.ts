import {
	addDays,
	addMonths,
	compareDay,
	createDate,
	daysInMonth,
	formatDate,
	formatRange,
	isoKey,
	parseDate,
	parseIso,
	parseRange,
	RANGE_SEPARATOR,
	sameDay,
	startOfDay,
	maskText,
} from "./dates";
import { LocaleText, localeText } from "./locale";
import { DatepickerOptions, OnOk, ResolvedOptions, resolveOptions } from "./options";
import { currentView, ensureStyles, getView, releaseView, retainView, View, ViewOwner } from "./view";

type CalendarView = "day" | "month" | "year";

const YEARS_PER_PAGE = 24;
const YEARS_PER_ROW = 4;
const MONTHS_PER_ROW = 4;

export class Calendar implements ViewOwner {
	/** Lê uma data escrita no formato (por omissão `dd/mm/aaaa`); `null` se não valer. */
	static parseDate(text: string, format?: string): Date | null {
		return parseDate(text, format);
	}

	/** Escreve uma data no formato (por omissão `dd/mm/aaaa`). */
	static formatDate(date: Date, format?: string): string {
		return formatDate(date, format);
	}

	readonly input: HTMLInputElement;
	readonly options: ResolvedOptions;

	private text: LocaleText;
	private selected: Date | null = null;
	private selectedEnd: Date | null = null;
	// O dia em foco. Sem intervalo, é também o dia escolhido.
	private cursor: Date;
	private rangeStart: Date | null = null;
	private rangeEnd: Date | null = null;
	private hover: Date | null = null;
	private view: CalendarView = "day";
	private page = 0;
	private renderedKey = "";
	private writing = false;
	private destroyed = false;
	private firstYear: number;
	private lastYear: number;

	constructor(input: HTMLInputElement, options: DatepickerOptions | OnOk = {}) {
		this.input = input;
		this.options = resolveOptions(
			input,
			typeof options === "function" ? { onOk: options } : options
		);
		this.text = localeText(this.options.locale);

		const today = startOfDay(new Date());
		this.firstYear = this.options.min
			? this.options.min.getFullYear()
			: today.getFullYear() - 100;
		this.lastYear = this.options.max
			? this.options.max.getFullYear()
			: today.getFullYear() + 115;
		this.cursor = this.clamp(today);

		if (!input.placeholder) input.placeholder = this.pattern();
		input.autocomplete = "off";
		input.setAttribute("aria-haspopup", "dialog");
		if (this.options.mask) input.setAttribute("inputmode", "numeric");
		if (this.options.injectStyles) ensureStyles(this.options.styleNonce);

		input.addEventListener("click", this.onInputClick);
		input.addEventListener("keydown", this.onInputKeydown);
		input.addEventListener("input", this.onInputInput);
		input.addEventListener("change", this.onInputChange);

		retainView();
		this.readInput();
	}

	/** A data confirmada (o início, com `range`), ou `null`. */
	get value(): Date | null {
		return this.selected;
	}

	/** O fim do intervalo confirmado, ou `null`. */
	get end(): Date | null {
		return this.selectedEnd;
	}

	private pattern(): string {
		const format = this.options.format;
		return this.options.range ? `${format}${RANGE_SEPARATOR}${format}` : format;
	}

	// ----- Regras de datas -----

	isDisabled(date: Date): boolean {
		const { min, max, disabledDays, isDisabled } = this.options;
		if (min && compareDay(date, min) < 0) return true;
		if (max && compareDay(date, max) > 0) return true;
		if (disabledDays.indexOf(date.getDay()) !== -1) return true;
		return !!isDisabled && isDisabled(date);
	}

	private monthDisabled(year: number, month: number): boolean {
		const { min, max } = this.options;
		const value = year * 12 + month;
		if (min && value < min.getFullYear() * 12 + min.getMonth()) return true;
		return !!max && value > max.getFullYear() * 12 + max.getMonth();
	}

	private yearDisabled(year: number): boolean {
		return year < this.firstYear || year > this.lastYear;
	}

	private clamp(date: Date): Date {
		const { min, max } = this.options;
		if (min && compareDay(date, min) < 0) return min;
		if (max && compareDay(date, max) > 0) return max;
		return date;
	}

	// Sem data escolhida, abre no primeiro dia que se pode escolher: hoje, ou o
	// seguinte livre (um domingo bloqueado abre na segunda), ou o anterior.
	private nearestEnabled(date: Date): Date {
		for (let offset = 0; offset <= 366; offset++) {
			const after = addDays(date, offset);
			if (!this.isDisabled(after)) return after;
			const before = addDays(date, -offset);
			if (!this.isDisabled(before)) return before;
		}
		return date;
	}

	private get pageCount(): number {
		return Math.ceil((this.lastYear - this.firstYear + 1) / YEARS_PER_PAGE);
	}

	private pageOf(year: number): number {
		const page = Math.floor((year - this.firstYear) / YEARS_PER_PAGE);
		return Math.max(0, Math.min(page, this.pageCount - 1));
	}

	// ----- Abrir, fechar, confirmar -----

	isOpen(): boolean {
		const view = currentView();
		return !!view && view.isOpenFor(this);
	}

	open() {
		if (this.destroyed || this.isOpen()) return;

		this.readInput();
		this.cursor = this.selected || this.nearestEnabled(this.clamp(startOfDay(new Date())));
		this.rangeStart = this.options.range ? this.selected : null;
		this.rangeEnd = this.options.range ? this.selectedEnd : null;
		this.hover = null;
		this.view = "day";
		this.renderedKey = "";

		const view = getView();
		view.show(this, this.input, this.options.display, this.options.theme);
		this.render();
		view.position();
		this.focusCursor();
	}

	close() {
		if (!this.isOpen()) return;
		const view = currentView() as View;
		const touch = view.usedByTouch();
		view.hide();
		this.returnFocus(touch);
	}

	// O foco volta ao input, para quem usa o teclado ou um leitor de ecrã. Com o
	// dedo, isso abria o teclado do telemóvel por cima da página: até o input
	// perder o foco, fica com inputmode="none".
	private returnFocus(touch: boolean) {
		const input = this.input;
		if (touch) {
			const mode = input.getAttribute("inputmode");
			const restore = () => {
				input.removeEventListener("blur", restore);
				if (mode === null) input.removeAttribute("inputmode");
				else input.setAttribute("inputmode", mode);
			};
			input.setAttribute("inputmode", "none");
			input.addEventListener("blur", restore);
		}
		input.focus();
	}

	/** Fecha sem mexer no input: a próxima abertura volta à data confirmada. */
	cancel() {
		this.close();
	}

	confirm() {
		if (this.options.range) {
			if (!this.rangeStart) return;
			const start = this.rangeStart;
			const end = this.rangeEnd || this.rangeStart;
			const text = formatRange(start, end, this.options.format);

			this.selected = start;
			this.selectedEnd = end;
			this.write(text);
			this.close();
			if (this.options.onOk) this.options.onOk(text, start, end);
			return;
		}

		if (this.isDisabled(this.cursor)) return;
		const date = this.cursor;
		const text = formatDate(date, this.options.format);

		this.selected = date;
		this.write(text);
		this.close();
		if (this.options.onOk) this.options.onOk(text, date);
	}

	clear() {
		this.selected = null;
		this.selectedEnd = null;
		this.rangeStart = null;
		this.rangeEnd = null;
		this.cursor = this.clamp(startOfDay(new Date()));
		this.view = "day";
		this.write("");
		this.render();
	}

	/** Vai para hoje e escolhe-o (com `range`, como início). */
	today() {
		const today = startOfDay(new Date());
		if (this.isDisabled(today)) return;

		this.cursor = today;
		if (this.options.range) {
			this.rangeStart = today;
			this.rangeEnd = null;
		}
		this.view = "day";
		this.render();
		this.focusCursor();
	}

	next() {
		this.step(1);
	}

	previous() {
		this.step(-1);
	}

	private step(direction: 1 | -1) {
		if (this.view === "day") {
			if (this.monthDisabled(this.cursor.getFullYear(), this.cursor.getMonth() + direction)) return;
			this.cursor = this.clamp(addMonths(this.cursor, direction));
		} else if (this.view === "month") {
			if (this.yearDisabled(this.cursor.getFullYear() + direction)) return;
			this.cursor = this.clamp(addMonths(this.cursor, 12 * direction));
		} else {
			this.page = Math.max(0, Math.min(this.page + direction, this.pageCount - 1));
		}
		this.render();
	}

	toggleView() {
		if (this.view === "day") this.view = "month";
		else if (this.view === "month") {
			this.view = "year";
			this.page = this.pageOf(this.cursor.getFullYear());
		} else this.view = "day";
		this.render();
	}

	destroy() {
		if (this.destroyed) return;
		if (this.isOpen()) (currentView() as View).hide();

		this.input.removeEventListener("click", this.onInputClick);
		this.input.removeEventListener("keydown", this.onInputKeydown);
		this.input.removeEventListener("input", this.onInputInput);
		this.input.removeEventListener("change", this.onInputChange);
		this.input.removeAttribute("data-dpk-ready");
		this.destroyed = true;
		releaseView();
	}

	// ----- Input -----

	private onInputClick = () => this.open();

	private onInputKeydown = (event: KeyboardEvent) => {
		if (event.key === "Enter" || event.key === "ArrowDown") {
			event.preventDefault();
			this.open();
		}
	};

	private onInputInput = (event: Event) => {
		if (this.writing || !this.options.mask) return;
		const inputType = (event as InputEvent).inputType || "";
		if (inputType.indexOf("delete") === 0) return;

		const input = this.input;
		const value = input.value;
		const caret = input.selectionStart === null ? value.length : input.selectionStart;
		const atEnd = caret >= value.length;
		const digitsBefore = value.slice(0, caret).replace(/\D/g, "").length;
		const masked = maskText(value, this.pattern());
		if (masked === value) return;

		input.value = masked;
		let position = masked.length;
		if (!atEnd) {
			let digits = 0;
			position = 0;
			while (position < masked.length && digits < digitsBefore) {
				if (/\d/.test(masked.charAt(position))) digits++;
				position++;
			}
		}
		try {
			input.setSelectionRange(position, position);
		} catch (err) {
			// Alguns tipos de input não têm seleção; a máscara fica na mesma.
		}
	};

	private onInputChange = () => {
		if (!this.writing) this.commitTyped();
	};

	// Data escrita à mão: valida, normaliza e confirma, ou marca como inválida.
	private commitTyped() {
		const text = this.input.value.trim();
		if (!text) {
			this.selected = null;
			this.selectedEnd = null;
			this.setInvalid(false);
			return;
		}

		const { format, onOk } = this.options;
		if (this.options.range) {
			const range = parseRange(text, format);
			if (!range || this.isDisabled(range.start) || this.isDisabled(range.end)) {
				this.setInvalid(true);
				return;
			}
			const normalized = formatRange(range.start, range.end, format);
			this.selected = range.start;
			this.selectedEnd = range.end;
			this.normalize(normalized);
			if (onOk) onOk(normalized, range.start, range.end);
			return;
		}

		const date = parseDate(text, format);
		if (!date || this.isDisabled(date)) {
			this.setInvalid(true);
			return;
		}
		const normalized = formatDate(date, format);
		this.selected = date;
		this.normalize(normalized);
		if (onOk) onOk(normalized, date);
	}

	private normalize(text: string) {
		if (this.input.value !== text) {
			this.writing = true;
			this.input.value = text;
			this.writing = false;
		}
		this.setInvalid(false);
	}

	private setInvalid(invalid: boolean) {
		if (invalid) this.input.setAttribute("aria-invalid", "true");
		else this.input.removeAttribute("aria-invalid");
		this.input.classList.toggle("dpk-invalid", invalid);
	}

	private readInput() {
		const text = this.input.value.trim();
		if (this.options.range) {
			const range = parseRange(text, this.options.format);
			this.selected = range ? range.start : null;
			this.selectedEnd = range ? range.end : null;
		} else {
			this.selected = parseDate(text, this.options.format);
			this.selectedEnd = null;
		}
	}

	private write(text: string) {
		this.writing = true;
		this.input.value = text;
		this.input.dispatchEvent(new Event("input", { bubbles: true }));
		this.input.dispatchEvent(new Event("change", { bubbles: true }));
		this.writing = false;
		this.setInvalid(false);
	}

	// ----- Grelha: rato e teclado -----

	onCellClick(cell: HTMLButtonElement) {
		if (cell.getAttribute("aria-disabled") === "true") return;

		if (this.view === "day") {
			const date = parseIso(cell.getAttribute("data-date") || "");
			if (!date) return;
			if (this.options.range) this.pickRange(date);
			this.cursor = date;
			this.render();
			return;
		}

		if (this.view === "month") {
			const month = Number(cell.getAttribute("data-month"));
			const year = this.cursor.getFullYear();
			const day = Math.min(this.cursor.getDate(), daysInMonth(month, year));
			this.cursor = this.clamp(createDate(year, month, day));
			this.view = "day";
		} else {
			const year = Number(cell.getAttribute("data-year"));
			this.cursor = this.clamp(addMonths(this.cursor, (year - this.cursor.getFullYear()) * 12));
			this.view = "month";
		}
		this.render();
		this.focusCursor();
	}

	private pickRange(date: Date) {
		if (!this.rangeStart || this.rangeEnd) {
			this.rangeStart = date;
			this.rangeEnd = null;
		} else if (compareDay(date, this.rangeStart) < 0) {
			this.rangeStart = date;
		} else {
			this.rangeEnd = date;
		}
		this.hover = null;
	}

	onCellHover(cell: HTMLButtonElement | null) {
		if (!this.options.range || !this.rangeStart || this.rangeEnd || this.view !== "day") return;
		const date = cell ? parseIso(cell.getAttribute("data-date") || "") : null;
		if (sameDay(date, this.hover)) return;
		this.hover = date;
		this.decorate();
	}

	onGridKeydown(event: KeyboardEvent) {
		const key = event.key;
		const cursor = this.cursor;
		let next: Date | null = null;

		if (this.view === "day") {
			const weekOffset = (cursor.getDay() - this.options.firstDayOfWeek + 7) % 7;
			if (key === "ArrowLeft") next = addDays(cursor, -1);
			else if (key === "ArrowRight") next = addDays(cursor, 1);
			else if (key === "ArrowUp") next = addDays(cursor, -7);
			else if (key === "ArrowDown") next = addDays(cursor, 7);
			else if (key === "Home") next = addDays(cursor, -weekOffset);
			else if (key === "End") next = addDays(cursor, 6 - weekOffset);
			else if (key === "PageUp") next = addMonths(cursor, event.shiftKey ? -12 : -1);
			else if (key === "PageDown") next = addMonths(cursor, event.shiftKey ? 12 : 1);
		} else if (this.view === "month") {
			const month = cursor.getMonth();
			let delta: number | null = null;
			if (key === "ArrowLeft") delta = -1;
			else if (key === "ArrowRight") delta = 1;
			else if (key === "ArrowUp") delta = -MONTHS_PER_ROW;
			else if (key === "ArrowDown") delta = MONTHS_PER_ROW;
			else if (key === "Home") delta = -month;
			else if (key === "End") delta = 11 - month;
			else if (key === "PageUp") delta = -12;
			else if (key === "PageDown") delta = 12;
			if (delta !== null) next = addMonths(cursor, delta);
		} else {
			const year = cursor.getFullYear();
			const pageStart = this.firstYear + this.page * YEARS_PER_PAGE;
			let target: number | null = null;
			if (key === "ArrowLeft") target = year - 1;
			else if (key === "ArrowRight") target = year + 1;
			else if (key === "ArrowUp") target = year - YEARS_PER_ROW;
			else if (key === "ArrowDown") target = year + YEARS_PER_ROW;
			else if (key === "Home") target = pageStart;
			else if (key === "End") target = Math.min(pageStart + YEARS_PER_PAGE - 1, this.lastYear);
			else if (key === "PageUp") target = year - YEARS_PER_PAGE;
			else if (key === "PageDown") target = year + YEARS_PER_PAGE;
			if (target !== null) {
				target = Math.max(this.firstYear, Math.min(target, this.lastYear));
				next = addMonths(cursor, (target - year) * 12);
			}
		}

		if (!next) return;
		event.preventDefault();
		this.cursor = this.clamp(next);
		if (this.view === "year") this.page = this.pageOf(this.cursor.getFullYear());
		this.render();
		this.focusCursor();
	}

	private focusCursor() {
		const view = currentView();
		if (!view) return;
		const target = view.tbody.querySelector('[tabindex="0"]') as HTMLElement | null;
		if (!target) return;
		target.focus();
		// Se o browser ainda não aplicou o estilo de aberto, tenta no tick seguinte.
		if (document.activeElement !== target) {
			setTimeout(() => {
				if (this.isOpen()) target.focus();
			}, 0);
		}
	}

	// ----- Desenho -----

	private render() {
		if (!this.isOpen()) return;
		const view = currentView() as View;
		const labels = this.options.labels;
		const year = this.cursor.getFullYear();
		const month = this.cursor.getMonth();

		view.title.textContent = labels.title;
		view.dateText.classList.toggle("dpk-range-text", this.options.range);
		if (this.options.range) {
			const start = this.rangeStart;
			const end = this.rangeEnd;
			view.dateText.textContent = `${start ? this.text.dayMonthShort(start) : labels.rangeStart}${RANGE_SEPARATOR}${
				end ? this.text.dayMonthShort(end) : labels.rangeEnd
			}`;
		} else {
			view.dateText.textContent = this.text.dayMonth(this.cursor);
		}

		let heading: string;
		let previousLabel: string;
		let nextLabel: string;
		let canGoBack: boolean;
		let canGoForward: boolean;

		if (this.view === "day") {
			heading = this.text.monthYear(month, year);
			previousLabel = labels.previousMonth;
			nextLabel = labels.nextMonth;
			canGoBack = !this.monthDisabled(year, month - 1);
			canGoForward = !this.monthDisabled(year, month + 1);
		} else if (this.view === "month") {
			heading = `${year}`;
			previousLabel = labels.previousYear;
			nextLabel = labels.nextYear;
			canGoBack = !this.yearDisabled(year - 1);
			canGoForward = !this.yearDisabled(year + 1);
		} else {
			const first = this.firstYear + this.page * YEARS_PER_PAGE;
			const last = Math.min(first + YEARS_PER_PAGE - 1, this.lastYear);
			heading = `${first} - ${last}`;
			previousLabel = labels.previousYears;
			nextLabel = labels.nextYears;
			canGoBack = this.page > 0;
			canGoForward = this.page < this.pageCount - 1;
		}

		view.changeButton.textContent = heading;
		view.changeButton.setAttribute("aria-label", `${heading}, ${labels.chooseView}`);
		view.table.setAttribute("aria-label", heading);
		view.prevButton.setAttribute("aria-label", previousLabel);
		view.nextButton.setAttribute("aria-label", nextLabel);
		view.prevButton.disabled = !canGoBack;
		view.nextButton.disabled = !canGoForward;

		view.clearButton.textContent = labels.clear;
		view.todayButton.textContent = labels.today;
		view.cancelButton.textContent = labels.cancel;
		view.okButton.textContent = labels.ok;
		view.todayButton.disabled = this.isDisabled(startOfDay(new Date()));
		view.okButton.disabled = this.options.range
			? !this.rangeStart
			: this.isDisabled(this.cursor);

		// A grelha só se refaz quando muda o que ela mostra; mover o foco dentro
		// do mesmo mês só atualiza atributos (ver decorate).
		const key = [
			this.view,
			this.options.locale,
			this.options.firstDayOfWeek,
			year,
			this.view === "day" ? month : "",
			this.view === "year" ? this.page : "",
		].join("|");

		if (key !== this.renderedKey || view.tbody.getAttribute("data-key") !== key) {
			if (this.view === "day") this.buildDays(view, year, month);
			else if (this.view === "month") this.buildMonths(view, year);
			else this.buildYears(view);
			this.renderedKey = key;
			view.tbody.setAttribute("data-key", key);
		}
		this.decorate();
	}

	private cell(size: "small" | "large", text: string, label: string, attribute: string, value: string) {
		const td = document.createElement("td");
		const button = document.createElement("button");
		td.className = `dpk-cell dpk-${size}-cell`;
		td.setAttribute("role", "gridcell");
		button.type = "button";
		button.className = `dpk-cell-content dpk-${size}-cell-content`;
		button.textContent = text;
		button.setAttribute("aria-label", label);
		button.setAttribute(attribute, value);
		button.tabIndex = -1;
		td.appendChild(button);
		return td;
	}

	private buildDays(view: View, year: number, month: number) {
		const firstDay = this.options.firstDayOfWeek;
		const head = document.createElement("tr");
		for (let i = 0; i < 7; i++) {
			const weekday = (firstDay + i) % 7;
			const th = document.createElement("th");
			th.className = "dpk-day-heading";
			th.scope = "col";
			th.abbr = this.text.weekdaysLong[weekday];
			th.textContent = this.text.weekdaysNarrow[weekday];
			head.appendChild(th);
		}
		view.thead.innerHTML = "";
		view.thead.appendChild(head);

		const offset = (createDate(year, month, 1).getDay() - firstDay + 7) % 7;
		const total = daysInMonth(month, year);
		const fragment = document.createDocumentFragment();
		let day = 1 - offset;

		while (day <= total) {
			const row = document.createElement("tr");
			for (let i = 0; i < 7; i++, day++) {
				if (day < 1 || day > total) {
					row.appendChild(document.createElement("td"));
					continue;
				}
				const date = createDate(year, month, day);
				row.appendChild(
					this.cell("small", `${day}`, this.text.fullDate(date), "data-date", isoKey(date))
				);
			}
			fragment.appendChild(row);
		}
		view.tbody.innerHTML = "";
		view.tbody.appendChild(fragment);
	}

	private buildMonths(view: View, year: number) {
		view.thead.innerHTML = "";
		const fragment = document.createDocumentFragment();
		for (let start = 0; start < 12; start += MONTHS_PER_ROW) {
			const row = document.createElement("tr");
			for (let month = start; month < start + MONTHS_PER_ROW; month++) {
				row.appendChild(
					this.cell(
						"large",
						this.text.monthsShort[month],
						this.text.monthYear(month, year),
						"data-month",
						`${month}`
					)
				);
			}
			fragment.appendChild(row);
		}
		view.tbody.innerHTML = "";
		view.tbody.appendChild(fragment);
	}

	private buildYears(view: View) {
		view.thead.innerHTML = "";
		const first = this.firstYear + this.page * YEARS_PER_PAGE;
		const last = Math.min(first + YEARS_PER_PAGE - 1, this.lastYear);
		const fragment = document.createDocumentFragment();
		for (let start = first; start <= last; start += YEARS_PER_ROW) {
			const row = document.createElement("tr");
			for (let year = start; year < start + YEARS_PER_ROW && year <= last; year++) {
				row.appendChild(this.cell("large", `${year}`, `${year}`, "data-year", `${year}`));
			}
			fragment.appendChild(row);
		}
		view.tbody.innerHTML = "";
		view.tbody.appendChild(fragment);
	}

	// Estado de cada célula: foco, escolhida, hoje, bloqueada, dentro do intervalo.
	private decorate() {
		const view = currentView();
		if (!view) return;
		const today = startOfDay(new Date());
		const buttons = view.tbody.querySelectorAll(".dpk-cell-content");
		const cursor = this.cursor;

		let start: Date | null = null;
		let end: Date | null = null;
		if (this.options.range) {
			start = this.rangeStart;
			end = this.rangeEnd;
			if (start && !end && this.hover && compareDay(this.hover, start) >= 0) end = this.hover;
		}

		for (let i = 0; i < buttons.length; i++) {
			const button = buttons[i] as HTMLButtonElement;
			const td = button.parentNode as HTMLTableCellElement;
			let focused = false;
			let active = false;
			let isToday = false;
			let disabled = false;
			let inRange = false;
			let isStart = false;
			let isEnd = false;

			if (this.view === "day") {
				const date = parseIso(button.getAttribute("data-date") || "") as Date;
				focused = sameDay(date, cursor);
				isToday = sameDay(date, today);
				disabled = this.isDisabled(date);
				if (this.options.range) {
					isStart = sameDay(date, start);
					isEnd = sameDay(date, end);
					active = isStart || isEnd;
					inRange = !!start && !!end && compareDay(date, start) > 0 && compareDay(date, end) < 0;
				} else {
					// Um dia bloqueado pode ter o foco (setas), mas não parece escolhido.
					active = focused && !disabled;
				}
			} else if (this.view === "month") {
				const month = Number(button.getAttribute("data-month"));
				const year = cursor.getFullYear();
				focused = active = month === cursor.getMonth();
				isToday = month === today.getMonth() && year === today.getFullYear();
				disabled = this.monthDisabled(year, month);
			} else {
				const year = Number(button.getAttribute("data-year"));
				focused = active = year === cursor.getFullYear();
				isToday = year === today.getFullYear();
				disabled = this.yearDisabled(year);
			}

			button.tabIndex = focused ? 0 : -1;
			button.classList.toggle("dpk-active", active);
			button.classList.toggle("dpk-today", isToday);
			if (isToday) button.setAttribute("aria-current", "date");
			else button.removeAttribute("aria-current");
			if (disabled) button.setAttribute("aria-disabled", "true");
			else button.removeAttribute("aria-disabled");

			td.setAttribute("aria-selected", active || inRange ? "true" : "false");
			td.classList.toggle("dpk-in-range", inRange);
			td.classList.toggle("dpk-range-start", isStart && !!end && !isEnd);
			td.classList.toggle("dpk-range-end", isEnd && !!start && !isStart);
		}
	}
}
