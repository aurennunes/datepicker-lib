type CalendarView = "day" | "month" | "year";

type OnOk = (date: string, value: Date) => void;

class Calendar {
	private static readonly YEARS_PER_PAGE = 24;
	private static readonly YEARS_PER_ROW = 4;

	private static pad(value: number): string {
		return value < 10 ? `0${value}` : `${value}`;
	}

	static daysInMonth(month: number, year: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	static formatDate(date: Date): string {
		const pad = Calendar.pad;
		return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
	}

	// Aceita "d/m/aaaa" e "dd/mm/aaaa"; devolve null para tudo o resto,
	// incluindo datas que não existem (31/02/2023).
	static parseDate(value: string): Date | null {
		const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(value);
		if (!match) return null;

		const day = Number(match[1]);
		const month = Number(match[2]) - 1;
		const year = Number(match[3]);
		const date = new Date(year, month, day);

		if (
			date.getFullYear() !== year ||
			date.getMonth() !== month ||
			date.getDate() !== day
		) {
			return null;
		}
		return date;
	}

	private currentMonth: number;
	private currentYear: number;
	private currentDay: number;
	private currentPage: number = 0;
	private selected: Date | null = null;
	private view: CalendarView = "day";
	private Element: HTMLElement;
	private CalendarTable: HTMLTableSectionElement;
	private DateTable: HTMLSpanElement;
	private changeButton: HTMLButtonElement;
	private prevButton: HTMLButtonElement;
	private nextButton: HTMLButtonElement;
	private okButton: HTMLButtonElement;
	private TableYear: HTMLTableElement;
	private TableMonth: HTMLTableElement;
	private TableDay: HTMLTableElement;
	private InputData: HTMLInputElement;
	private years: number[] = [];
	private onOk?: OnOk;

	today: Date;
	months = {
		pt: [
			"Janeiro",
			"Fevereiro",
			"Março",
			"Abril",
			"Maio",
			"Junho",
			"Julho",
			"Agosto",
			"Setembro",
			"Outubro",
			"Novembro",
			"Dezembro",
		],
	};

	constructor(InputData: HTMLInputElement, onOk?: OnOk) {
		this.today = new Date();
		this.onOk = onOk;

		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();
		this.currentDay = this.today.getDate();

		this.InputData = InputData;
		if (!this.InputData.placeholder) this.InputData.placeholder = "dd/mm/aaaa";
		this.InputData.autocomplete = "off";
		this.InputData.setAttribute("aria-haspopup", "dialog");

		this.initYears();

		const randomID = `dpk_${Math.random().toString(36).slice(2)}`;
		const template = document.createElement("template");

		template.innerHTML = `
			<div id="${randomID}" class="dpk-modal" role="dialog" aria-modal="true" aria-label="Selecionar data">
				<div class="dpk-modal-close"></div>
				<div class="dpk-container">
					<div class="dpk-header">
						<div class="dpk-title">
							<span class="dpk-title-text">Selecionar data</span>
						</div>
						<div class="dpk-date">
							<span class="dpk-date-text" aria-live="polite"></span>
						</div>
					</div>
					<div class="dpk-main">
						<div class="dpk-date-controls">
							<button type="button" class="dpk-view-change-button" aria-label="Escolher mês e ano"></button>
							<div class="dpk-arrow-controls">
								<button type="button" class="dpk-previous-button" aria-label="Anterior"></button>
								<button type="button" class="dpk-next-button" aria-label="Seguinte"></button>
							</div>
						</div>
						<div class="dpk-view">
							<table class="dpk-table dpk-table-day">
								<thead>
									<tr>
										<th class="dpk-day-heading" scope="col" abbr="Domingo">D</th>
										<th class="dpk-day-heading" scope="col" abbr="Segunda-feira">S</th>
										<th class="dpk-day-heading" scope="col" abbr="Terça-feira">T</th>
										<th class="dpk-day-heading" scope="col" abbr="Quarta-feira">Q</th>
										<th class="dpk-day-heading" scope="col" abbr="Quinta-feira">Q</th>
										<th class="dpk-day-heading" scope="col" abbr="Sexta-feira">S</th>
										<th class="dpk-day-heading" scope="col" abbr="Sábado">S</th>
									</tr>
								</thead>
								<tbody class="dpk-table-body"></tbody>
							</table>
							<table class="dpk-table dpk-table-month" style="display: none;">
								<tbody class="dpk-table-body-month"></tbody>
							</table>
							<table class="dpk-table dpk-table-year" style="display: none;">
								<tbody class="dpk-table-body-year"></tbody>
							</table>
						</div>
						<div class="dpk-footer">
							<button type="button" class="dpk-footer-btn dpk-clear-btn" aria-label="Limpar seleção">Limpar</button>
							<button type="button" class="dpk-footer-btn dpk-cancel-btn" aria-label="Cancelar seleção">Cancelar</button>
							<button type="button" class="dpk-footer-btn dpk-ok-btn" aria-label="Confirmar seleção">Ok</button>
						</div>
					</div>
				</div>
			</div>`;

		const query = <T extends Element>(selector: string) =>
			template.content.querySelector(selector) as T;

		this.Element = query<HTMLElement>(`#${randomID}`);
		this.CalendarTable = query<HTMLTableSectionElement>(".dpk-table-body");
		this.DateTable = query<HTMLSpanElement>(".dpk-date-text");
		this.changeButton = query<HTMLButtonElement>(".dpk-view-change-button");
		this.prevButton = query<HTMLButtonElement>(".dpk-previous-button");
		this.nextButton = query<HTMLButtonElement>(".dpk-next-button");
		this.okButton = query<HTMLButtonElement>(".dpk-ok-btn");
		this.TableDay = query<HTMLTableElement>(".dpk-table-day");
		this.TableMonth = query<HTMLTableElement>(".dpk-table-month");
		this.TableYear = query<HTMLTableElement>(".dpk-table-year");

		query<HTMLDivElement>(".dpk-modal-close").addEventListener("click", () =>
			this.cancel()
		);
		query<HTMLButtonElement>(".dpk-cancel-btn").addEventListener("click", () =>
			this.cancel()
		);
		query<HTMLButtonElement>(".dpk-clear-btn").addEventListener("click", () =>
			this.clear()
		);
		this.okButton.addEventListener("click", () => this.confirm());
		this.nextButton.addEventListener("click", () => this.next());
		this.prevButton.addEventListener("click", () => this.previous());
		this.changeButton.addEventListener("click", () => {
			if (this.view === "day") this.setView("month");
			else if (this.view === "month") this.setView("year");
			else this.setView("day");
		});

		document.body.appendChild(template.content);

		this.InputData.addEventListener("click", this.onInputClick);
		this.InputData.addEventListener("keydown", this.onInputKeydown);

		this.selected = Calendar.parseDate(this.InputData.value);
		this.render();
	}

	private onInputClick = () => this.open();

	private onInputKeydown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === "ArrowDown") {
			e.preventDefault();
			this.open();
		}
	};

	// Ouvido no document enquanto o modal está aberto, para o Escape funcionar
	// mesmo quando o foco ainda está no input.
	private onDocumentKeydown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && this.isOpen()) {
			e.preventDefault();
			this.cancel();
		}
	};

	private initYears() {
		this.years = [];
		for (
			let year = this.today.getFullYear() - 100;
			year <= this.today.getFullYear() + 115;
			year++
		) {
			this.years.push(year);
		}
	}

	private get pageCount(): number {
		return Math.ceil(this.years.length / Calendar.YEARS_PER_PAGE);
	}

	private pageOfYear(year: number): number {
		const index = this.years.indexOf(year);
		if (index === -1) return this.currentPage;
		return Math.floor(index / Calendar.YEARS_PER_PAGE);
	}

	// Mantém o dia dentro do mês (31 de janeiro, mês seguinte, dá 28 ou 29).
	private setMonth(month: number, year: number) {
		this.currentMonth = month;
		this.currentYear = year;
		this.currentDay = Math.min(this.currentDay, Calendar.daysInMonth(month, year));
	}

	private setView(view: CalendarView) {
		this.view = view;
		if (view === "year") this.currentPage = this.pageOfYear(this.currentYear);
		this.render();
	}

	isOpen(): boolean {
		return this.Element.classList.contains("active");
	}

	open() {
		if (this.isOpen()) return;

		this.today = new Date();
		this.selected = Calendar.parseDate(this.InputData.value);

		const start = this.selected || this.today;
		this.currentDay = start.getDate();
		this.currentMonth = start.getMonth();
		this.currentYear = start.getFullYear();
		this.view = "day";
		this.render();

		this.Element.classList.add("active");
		document.addEventListener("keydown", this.onDocumentKeydown);
		// O modal só deixa de estar "visibility: hidden" depois do próximo
		// cálculo de estilo; antes disso o botão não aceita o foco.
		setTimeout(() => {
			if (this.isOpen()) this.okButton.focus();
		}, 0);
	}

	close() {
		if (!this.isOpen()) return;
		this.Element.classList.remove("active");
		document.removeEventListener("keydown", this.onDocumentKeydown);
		this.InputData.focus();
	}

	// Fecha sem mexer no input: a próxima abertura volta à data confirmada.
	cancel() {
		this.close();
	}

	confirm() {
		const date = new Date(this.currentYear, this.currentMonth, this.currentDay);
		const value = Calendar.formatDate(date);

		this.selected = date;
		this.setInputValue(value);
		this.close();

		if (this.onOk) this.onOk(value, date);
	}

	clear() {
		this.today = new Date();
		this.selected = null;
		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();
		this.currentDay = this.today.getDate();
		this.view = "day";
		this.setInputValue("");
		this.render();
	}

	next() {
		if (this.view === "day") {
			if (this.currentMonth === 11) this.setMonth(0, this.currentYear + 1);
			else this.setMonth(this.currentMonth + 1, this.currentYear);
		} else if (this.view === "month") {
			this.setMonth(this.currentMonth, this.currentYear + 1);
		} else {
			this.currentPage = Math.min(this.currentPage + 1, this.pageCount - 1);
		}
		this.render();
	}

	previous() {
		if (this.view === "day") {
			if (this.currentMonth === 0) this.setMonth(11, this.currentYear - 1);
			else this.setMonth(this.currentMonth - 1, this.currentYear);
		} else if (this.view === "month") {
			this.setMonth(this.currentMonth, this.currentYear - 1);
		} else {
			this.currentPage = Math.max(this.currentPage - 1, 0);
		}
		this.render();
	}

	destroy() {
		this.InputData.removeEventListener("click", this.onInputClick);
		this.InputData.removeEventListener("keydown", this.onInputKeydown);
		this.InputData.removeAttribute("data-dpk-ready");
		document.removeEventListener("keydown", this.onDocumentKeydown);
		if (this.Element.parentNode) this.Element.parentNode.removeChild(this.Element);
	}

	private setInputValue(value: string) {
		this.InputData.value = value;
		this.InputData.dispatchEvent(new Event("input", { bubbles: true }));
		this.InputData.dispatchEvent(new Event("change", { bubbles: true }));
	}

	private render() {
		this.DateTable.textContent = `${this.currentDay} de ${this.months.pt[
			this.currentMonth
		].slice(0, 3)}, ${this.currentYear}`;

		this.TableDay.style.display = this.view === "day" ? "" : "none";
		this.TableMonth.style.display = this.view === "month" ? "" : "none";
		this.TableYear.style.display = this.view === "year" ? "" : "none";

		if (this.view === "day") {
			this.changeButton.textContent = `${this.months.pt[this.currentMonth]} ${this.currentYear}`;
			this.prevButton.setAttribute("aria-label", "Mês anterior");
			this.nextButton.setAttribute("aria-label", "Mês seguinte");
			this.daysRender();
		} else if (this.view === "month") {
			this.changeButton.textContent = `${this.currentYear}`;
			this.prevButton.setAttribute("aria-label", "Ano anterior");
			this.nextButton.setAttribute("aria-label", "Ano seguinte");
			this.monthRender();
		} else {
			const pageYears = this.pageYears(this.currentPage);
			this.changeButton.textContent = `${pageYears[0]} - ${
				pageYears[pageYears.length - 1]
			}`;
			this.prevButton.setAttribute("aria-label", "Anos anteriores");
			this.nextButton.setAttribute("aria-label", "Anos seguintes");
			this.yearsRender();
		}
	}

	private createCell(
		text: string,
		size: "small" | "large",
		isToday: boolean,
		isActive: boolean,
		label: string,
		onClick: () => void
	): HTMLTableCellElement {
		const cell = document.createElement("td");
		const content = document.createElement("button");

		content.type = "button";
		cell.classList.add("dpk-cell", `dpk-${size}-cell`);
		content.classList.add("dpk-cell-content", `dpk-${size}-cell-content`);
		if (isToday) content.classList.add("today");
		if (isActive) content.classList.add("active");
		content.setAttribute("aria-label", label);
		content.setAttribute("aria-pressed", isActive ? "true" : "false");
		content.textContent = text;
		content.addEventListener("click", onClick);

		cell.appendChild(content);
		return cell;
	}

	private daysRender() {
		const month = this.currentMonth;
		const year = this.currentYear;
		const firstDay = new Date(year, month, 1).getDay();
		const total = Calendar.daysInMonth(month, year);

		this.CalendarTable.innerHTML = "";

		let date = 1;
		for (let i = 0; i < 6 && date <= total; i++) {
			const row = document.createElement("tr");

			for (let j = 0; j < 7; j++) {
				if ((i === 0 && j < firstDay) || date > total) {
					row.appendChild(document.createElement("td"));
					continue;
				}

				const day = date;
				row.appendChild(
					this.createCell(
						`${day}`,
						"small",
						day === this.today.getDate() &&
							month === this.today.getMonth() &&
							year === this.today.getFullYear(),
						day === this.currentDay,
						`${day} de ${this.months.pt[month]} de ${year}`,
						() => {
							this.currentDay = day;
							this.render();
						}
					)
				);
				date++;
			}

			this.CalendarTable.appendChild(row);
		}
	}

	private monthRender() {
		const body = this.TableMonth.querySelector("tbody") as HTMLTableSectionElement;
		body.innerHTML = "";

		for (let start = 0; start < 12; start += 4) {
			const row = document.createElement("tr");

			for (let month = start; month < start + 4; month++) {
				row.appendChild(
					this.createCell(
						this.months.pt[month].slice(0, 3),
						"large",
						month === this.today.getMonth() &&
							this.currentYear === this.today.getFullYear(),
						month === this.currentMonth,
						`${this.months.pt[month]} de ${this.currentYear}`,
						() => {
							this.setMonth(month, this.currentYear);
							this.setView("day");
						}
					)
				);
			}

			body.appendChild(row);
		}
	}

	private pageYears(page: number): number[] {
		const start = page * Calendar.YEARS_PER_PAGE;
		return this.years.slice(start, start + Calendar.YEARS_PER_PAGE);
	}

	private yearsRender() {
		const body = this.TableYear.querySelector("tbody") as HTMLTableSectionElement;
		const pageYears = this.pageYears(this.currentPage);
		body.innerHTML = "";

		for (let i = 0; i < pageYears.length; i += Calendar.YEARS_PER_ROW) {
			const row = document.createElement("tr");

			pageYears.slice(i, i + Calendar.YEARS_PER_ROW).forEach((year) => {
				row.appendChild(
					this.createCell(
						`${year}`,
						"large",
						year === this.today.getFullYear(),
						year === this.currentYear,
						`${year}`,
						() => {
							this.setMonth(this.currentMonth, year);
							this.setView("month");
						}
					)
				);
			});

			body.appendChild(row);
		}
	}
}



function datepicker_init(
	onOk?: OnOk,
	_input?: HTMLInputElement
): Calendar[] {
	const DPK_STYLE_ID = "dpk-style";

	if (!document.getElementById(DPK_STYLE_ID)) {
		const cssCode = `.dpk-modal { height: 100%; width: 100%; position: fixed; top: 0; right: 0; left: 0; display: flex; align-items: center; justify-content: center; z-index: 1066; background-color: rgba(0, 0, 0, 0.2); opacity: 0; visibility: hidden; transition: opacity 300ms, visibility 300ms; } .dpk-modal button { cursor: pointer; font-family: inherit; } .dpk-modal button:focus-visible { outline: 2px solid #2979ff; outline-offset: 2px; } .dpk-modal-close { width: 100%; height: 100%; } .dpk-modal.active { opacity: 1; visibility: visible; transition: opacity 300ms, visibility 0s; } .dpk-modal.active .dpk-container { opacity: 1; top: 50%; } .dpk-container { display: flex; flex-direction: column; position: fixed; left: 50%; transform: translate(-50%, -50%); width: 328px; max-width: calc(100vw - 16px); height: 512px; background-color: #fff; border-radius: 0.6rem 0.6rem 0.5rem 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 7%), 0 4px 6px -2px rgb(0 0 0 / 5%); z-index: 1067; opacity: 0; top: -100%; transition: opacity 300ms, top 300ms; } .dpk-header { height: 120px; padding-right: 24px; padding-left: 24px; background-color: #2979ff; display: flex; flex-direction: column; border-radius: 0.5rem 0.5rem 0 0; } .dpk-title { height: 32px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-title-text { font-size: 10px; font-weight: 400; text-transform: uppercase; letter-spacing: 1.7px; color: #fff; } .dpk-date { height: 72px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-date-text { font-size: 32px; font-weight: 400; color: #fff; margin-bottom: 5px; } .dpk-main { position: relative; height: 100%; } .dpk-date-controls { padding: 10px 12px 0; display: flex; justify-content: space-between; color: rgba(0, 0, 0, 0.64); } .dpk-view { padding-left: 12px; padding-right: 12px; outline: none; } .dpk-footer { height: 56px; display: flex; position: absolute; width: calc(100% - 24px); bottom: 0; justify-content: flex-end; align-items: center; padding-left: 12px; padding-right: 12px; } .dpk-cell-content { border: 0; padding: 0; margin: 0; background-color: transparent; color: inherit; font: inherit; } .dpk-footer-btn:hover, .dpk-view-change-button:hover, .dpk-previous-button:hover, .dpk-next-button:hover, .dpk-small-cell-content:hover, .dpk-large-cell-content:hover { background-color: #eee; } .dpk-footer-btn { background-color: #fff; color: #2979ff; border: none; padding: 0 10px; text-transform: uppercase; font-size: 0.8rem; font-weight: 500; height: 40px; line-height: 40px; letter-spacing: 0.1rem; border-radius: 10px; margin-bottom: 10px; } .dpk-clear-btn { margin-right: auto; } .dpk-view-change-button { padding: 10px; color: #666; font-weight: 500; font-size: 0.9rem; border-radius: 10px; box-shadow: none; background-color: transparent; margin: 0; border: none; } .dpk-view-change-button::after { content: ""; display: inline-block; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top-width: 5px; border-top-style: solid; margin: 0 0 0 5px; vertical-align: middle; } .dpk-arrow-controls { margin-top: 10px; } .dpk-previous-button, .dpk-next-button { position: relative; padding: 0; width: 40px; height: 40px; line-height: 40px; border: none; margin: 0; color: rgba(0, 0, 0, 0.64); background-color: transparent; } .dpk-previous-button { margin-right: 24px; } .dpk-previous-button::after, .dpk-next-button::after { top: 0; left: 0; right: 0; bottom: 0; position: absolute; content: ""; margin: 15.5px; border: 0 solid; border-top-width: 2px; } .dpk-previous-button::after { border-left-width: 2px; transform: translateX(2px) rotate(-45deg); } .dpk-next-button::after { border-right-width: 2px; transform: translateX(-2px) rotate(45deg); } .dpk-previous-button:hover, .dpk-next-button:hover { border-radius: 50%; } .dpk-table { margin-right: auto; margin-left: auto; width: 304px; max-width: 100%; text-indent: 0; border-color: inherit; border-collapse: collapse; } .dpk-day-heading { width: 40px; height: 40px; text-align: center; font-size: 12px; font-weight: 400; } .dpk-small-cell { width: 40px; height: 40px; } .dpk-cell { text-align: center; padding: 0; } .dpk-small-cell-content { width: 36px; height: 36px; line-height: 36px; border-radius: 50%; font-size: 13px; } .dpk-large-cell { width: 76px; height: 42px; } .dpk-large-cell-content { width: 72px; height: 40px; line-height: 40px; padding: 1px 2px; border-radius: 999px; } .dpk-small-cell-content.active, .dpk-large-cell-content.active { background-color: #2979ff; color: #fff; } .dpk-small-cell-content.today, .dpk-large-cell-content.today { border: 1px solid #787878; }`;
		const style = document.createElement("style");

		style.id = DPK_STYLE_ID;
		style.textContent = cssCode;
		document.head.appendChild(style);
	}

	const inputs: HTMLInputElement[] =
		_input === undefined
			? Array.prototype.slice.call(
					document.querySelectorAll('input[data-type="datepicker"]')
			  )
			: [_input];

	const calendars: Calendar[] = [];

	inputs.forEach((input) => {
		if (input.getAttribute("data-type") !== "datepicker") return;
		if (input.hasAttribute("data-dpk-ready")) return;
		try {
			calendars.push(new Calendar(input, onOk));
			input.setAttribute("data-dpk-ready", "");
		} catch (err) {
			console.error(err);
		}
	});

	return calendars;
}
