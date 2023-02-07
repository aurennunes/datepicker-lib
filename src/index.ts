class Calendar {
	private currentMonth: number;
	private currentYear: number;
	private currentDay: number;
	private _currentPage: number = 0;
	private _currentMonth: number = 0;
	private _currentYear: number = 0;
	private _currentDay: number = 0;
	private Element: HTMLElement;
	private CalendarTable: HTMLTableSectionElement;
	private DateTable: HTMLDivElement;
	private changeButton: HTMLButtonElement;
	private TableYear: HTMLTableElement;
	private TableMonth: HTMLTableElement;
	private TableDay: HTMLTableElement;
	private InputData: HTMLInputElement;
	private years: number[];

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

	private changePageYear(page: number) {
		const startIndex = page * 24;
		const yearsSlice = this.years.slice(startIndex, startIndex + 24);

		const yearsGroups = [];

		for (let i = 0; i < yearsSlice.length; i += 4) {
			yearsGroups.push(yearsSlice.slice(i, i + 4));
		}

		return yearsGroups;
	}

	private focusYear(year: number): number[][] | null {
		const len = this.years.length / 24;

		for (let i = 0; i < len; i++) {
			const calendar = this.changePageYear(i);
			let _return = null;
			calendar.forEach((item) => {
				if (item.includes(year)) {
					this._currentPage = i;
					_return = calendar;
				}
			});

			if (_return !== null) return _return;
		}
		return null;
	}

	open() {
		this.Element.classList.add("active");
	}
	close() {
		this.Element.classList.remove("active");
	}
	clear() {
		this.today = new Date();
		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();
		this.currentDay = this.today.getDate();
		this._currentMonth = 0;
		this._currentYear = 0;
		this._currentDay = 0;
		this.InputData.value = "";
		this.init(this.currentMonth, this.currentYear, this.currentDay);
	}
	next() {
		if (this.TableDay.style.display !== "none") {
			this.currentYear =
				this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
			this.currentMonth = (this.currentMonth + 1) % 12;
			this.init(this.currentMonth, this.currentYear, this.currentDay);
		} else if (this.TableMonth.style.display !== "none") {
			this.currentYear += 1;
			this.changeButton.innerText = `${this.currentYear}`;
		} else if (this.TableYear.style.display !== "none") {
			this._currentPage =
				this._currentPage === 8 ? this._currentPage : this._currentPage + 1;
			this.yearsRender(this._currentPage);
		}
	}

	previous() {
		if (this.TableDay.style.display !== "none") {
			this.currentYear =
				this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
			this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
			this.init(this.currentMonth, this.currentYear, this.currentDay);
		} else if (this.TableMonth.style.display !== "none") {
			this.currentYear -= 1;
			this.changeButton.innerText = `${this.currentYear}`;
		} else if (this.TableYear.style.display !== "none") {
			this._currentPage =
				this._currentPage === 0 ? this._currentPage : this._currentPage - 1;
			this.yearsRender(this._currentPage);
		}
	}

	constructor(InputData: HTMLInputElement, onOk?: (date: string) => void) {
		this.today = new Date();
		this.years = [];

		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();
		this.currentDay = this.today.getDate();

		const template = document.createElement("template");
		const randomID = `id_${Math.random().toString(36).slice(2)}_${Math.floor(
			Math.random() * 1000000000000
		)}`;

		this.InputData = InputData;
		this.InputData.placeholder = "dd/mm/aaaa";

		this.initYears();

		let htmlCode = `
			<div id="${randomID}" class="dpk-modal">
				<div class="dpk-container">
					<div class="dpk-header">
						<div class="dpk-title">
							<span class="dpk-title-text">Selecionar data</span>
						</div>
						<div class="dpk-date">
							<span class="dpk-date-text">
							${this.currentDay} de ${this.months.pt[this.currentMonth].slice(0, 3)}, ${
			this.currentYear
		}
							</span>
						</div>
					</div>
					<div class="dpk-main">
						<div class="dpk-date-controls">
							<button
								class="dpk-view-change-button"
								aria-label="Choose year and month"
							>
								Fevereiro 2023
							</button>
							<div class="dpk-arrow-controls">
								<button
									class="dpk-previous-button"
									aria-label="Previous month"
								></button>
								<button class="dpk-next-button" aria-label="Next month"></button>
							</div>
						</div>
						<div class="dpk-view">
							<table class="dpk-table dpk-table-day">
								<thead>
									<tr>
										<th class="dpk-day-heading" scope="col" aria-label="Sunday">
											D
										</th>
										<th class="dpk-day-heading" scope="col" aria-label="Monday">
											S
										</th>
										<th class="dpk-day-heading" scope="col" aria-label="Tuesday">
											T
										</th>
										<th
											class="dpk-day-heading"
											scope="col"
											aria-label="Wednesday"
										>
											Q
										</th>
										<th class="dpk-day-heading" scope="col" aria-label="Thursday">
											Q
										</th>
										<th class="dpk-day-heading" scope="col" aria-label="Friday">
											S
										</th>
										<th class="dpk-day-heading" scope="col" aria-label="Saturday">
											S
										</th>
									</tr>
								</thead>
								<tbody class="dpk-table-body"></tbody>
							</table>
							<table class="dpk-table dpk-table-month" style="display: none;">								
								<tbody class="dpk-table-body-month"></tbody>
							</table>
							<table class="dpk-table dpk-table-year" style="display: none;">								
								<tbody class="dpk-table-body-month"></tbody>
							</table>
						</div>
						<div class="dpk-footer">
							<button class="dpk-footer-btn dpk-clear-btn" aria-label="Limpar seleção">Limpar</button>
							<button class="dpk-footer-btn dpk-cancel-btn" aria-label="Cancelar seleção">Cancelar</button>
							<button class="dpk-footer-btn dpk-ok-btn" aria-label="Confirmar seleção">Ok</button>
						</div>
					</div>
				</div>
				<div class="dpk-modal-close"></div>
			</div>`;

		template.innerHTML = htmlCode;
		this.Element = template.content.getElementById(randomID) as HTMLElement;

		this.CalendarTable = template.content.querySelector(
			".dpk-table-body"
		) as HTMLTableSectionElement;

		const closeView = template.content.querySelector(
			".dpk-modal-close"
		) as HTMLDivElement;

		const cancelButton = template.content.querySelector(
			".dpk-cancel-btn"
		) as HTMLButtonElement;

		const clearButton = template.content.querySelector(
			".dpk-clear-btn"
		) as HTMLButtonElement;

		const okButton = template.content.querySelector(
			".dpk-ok-btn"
		) as HTMLButtonElement;

		const nextButton = template.content.querySelector(
			".dpk-next-button"
		) as HTMLButtonElement;

		const prevButton = template.content.querySelector(
			".dpk-previous-button"
		) as HTMLButtonElement;

		this.changeButton = template.content.querySelector(
			".dpk-view-change-button"
		) as HTMLButtonElement;

		this.DateTable = template.content.querySelector(
			".dpk-date-text"
		) as HTMLDivElement;

		this.TableYear = template.content.querySelector(
			".dpk-table-year"
		) as HTMLTableElement;

		this.TableMonth = template.content.querySelector(
			".dpk-table-month"
		) as HTMLTableElement;

		this.TableDay = template.content.querySelector(
			".dpk-table-day"
		) as HTMLTableElement;

		this.changeButton.addEventListener("click", (e) => {
			if (this.TableDay.style.display !== "none") {
				this.TableDay.style.display = "none";
				this.TableMonth.style.display = "block";
				this.TableYear.style.display = "none";
				this.changeButton.innerText = `${this.currentYear}`;
			} else if (this.TableMonth.style.display !== "none") {
				this.TableDay.style.display = "none";
				this.TableMonth.style.display = "none";
				this.TableYear.style.display = "block";
			} else if (this.TableYear.style.display !== "none") {
				this.TableDay.style.display = "block";
				this.TableMonth.style.display = "none";
				this.TableYear.style.display = "none";
			}
		});

		closeView.addEventListener("click", (e) => this.close());
		cancelButton.addEventListener("click", (e) => this.close());
		nextButton.addEventListener("click", (e) => this.next());
		prevButton.addEventListener("click", (e) => this.previous());
		okButton.addEventListener("click", (e) => {
			this.inputDate(this.currentDay);

			if (onOk)
				onOk(`${this.currentDay}/${this.currentMonth + 1}/${this.currentYear}`);
		});
		clearButton.addEventListener("click", (e) => this.clear());

		this.changeButton.addEventListener("click", (e) => {});

		document.body.appendChild(template.content);

		this.init(this.currentMonth, this.currentYear, this.currentDay);

		this.InputData.addEventListener("click", (e) => {
			if (this.InputData.value.trim() !== "") {
				const datas = this.InputData.value.split("/");
				const day = Number(datas[0]);
				const month = Number(datas[1]) - 1;
				const year = Number(datas[2]);

				this.init(month, year, day);
			}
			this.open();
		});
	}

	private inputDate(day: number) {
		this.InputData.value = `${day}/${1 + this.currentMonth}/${
			this.currentYear
		}`;

		this._currentMonth = this.currentMonth;
		this._currentYear = this.currentYear;
		this._currentDay = this.currentDay;

		this.close();
	}

	private init(month: number, year: number, day: number) {
		let firstDay = new Date(year, month).getDay();
		let daysInMonth = 32 - new Date(year, month, 32).getDate();

		this.currentMonth = month;
		this.currentYear = year;
		this.currentDay = day;

		this.DateTable.innerHTML = `${this.currentDay} de ${this.months.pt[
			this.currentMonth
		].slice(0, 3)}, ${this.currentYear}`;
		this.CalendarTable.innerHTML = "";

		window.addEventListener("click", (e) => {
			// @ts-ignore
			if (e.target.id === this.Element.id) {
				this.close();
			}
		});

		let date = 1;
		for (let i = 0; i < 6; i++) {
			let row = document.createElement("tr");

			for (let j = 0; j < 7; j++) {
				if (i === 0 && j < firstDay) {
					let cell = document.createElement("td");
					let cellText = document.createTextNode("");

					cell.appendChild(cellText);

					row.appendChild(cell);
				} else if (date > daysInMonth) break;
				else {
					let cell = document.createElement("td");
					let content = document.createElement("div");
					cell.classList.add("dpk-cell", "dpk-small-cell", "dpk-day-cell");
					content.classList.add("dpk-cell-content", "dpk-small-cell-content");

					if (
						date === this.today.getDate() &&
						year === this.today.getFullYear() &&
						month === this.today.getMonth()
					) {
						content.classList.add("today");
					}

					if (
						date === this._currentDay &&
						year === this._currentYear &&
						month === this._currentMonth
					) {
						content.classList.add("active");
					}

					content.innerText = date.toString();
					cell.appendChild(content);

					cell.addEventListener("click", (e) => {
						const old = this.CalendarTable.querySelector(
							".dpk-cell-content.dpk-small-cell-content.active"
						);

						if (old) old.classList.remove("active");
						content.classList.add("active");
						this.currentDay = Number(content.innerText);

						this.DateTable.innerHTML = `${this.currentDay} de ${this.months.pt[
							this.currentMonth
						].slice(0, 3)}, ${this.currentYear}`;
					});
					row.appendChild(cell);
					date++;
				}
			}

			this.CalendarTable.appendChild(row);
		}
		this.monthRender();
		this.yearsRender();
	}

	private monthRender(month?: number) {
		const _monthBody = this.TableMonth.querySelector("tbody");

		if (_monthBody) {
			_monthBody.innerHTML = "";

			[
				this.months.pt.slice(0, 4),
				this.months.pt.slice(4, 8),
				this.months.pt.slice(8, 12),
			].forEach((group) => {
				let row = document.createElement("tr");

				group.forEach((month) => {
					let cell = document.createElement("td");
					let content = document.createElement("div");

					cell.classList.add("dpk-cell", "dpk-large-cell");
					content.classList.add("dpk-cell-content", "dpk-large-cell-content");

					if (this.months.pt.indexOf(month) === this.today.getMonth()) {
						content.classList.add("today");
					}

					if (this.months.pt.indexOf(month) === this._currentMonth) {
						content.classList.add("active");
					}

					content.innerText = month.slice(0, 3);
					cell.appendChild(content);

					cell.addEventListener("click", (e) => {
						const old = _monthBody.querySelector(
							".dpk-cell-content.dpk-large-cell-content.active"
						);

						if (old) old.classList.remove("active");
						content.classList.add("active");
						this.currentMonth = this.months.pt.indexOf(month);

						this.TableDay.style.display = "block";
						this.TableYear.style.display = "none";
						this.TableMonth.style.display = "none";

						this.changeButton.innerText = `${month}, ${this.currentYear}`;
					});

					row.appendChild(cell);
				});

				_monthBody.appendChild(row);
			});
		}
	}

	private yearsRender(page?: number) {
		const _yearBody = this.TableYear.querySelector("tbody");

		if (_yearBody) {
			_yearBody.innerHTML = "";

			const _init =
				page !== undefined
					? this.changePageYear(page)
					: this.focusYear(this.currentYear);

			const focusedYear =
				_init === null ? this.changePageYear(this._currentPage) : _init;

			focusedYear.forEach((item) => {
				let row = document.createElement("tr");

				item.forEach((_year) => {
					let cell = document.createElement("td");
					let content = document.createElement("div");

					cell.classList.add("dpk-cell", "dpk-large-cell");
					content.classList.add("dpk-cell-content", "dpk-large-cell-content");

					if (_year === this.today.getFullYear()) {
						content.classList.add("today");
					}

					if (_year === this._currentYear) {
						content.classList.add("active");
					}

					content.innerText = _year.toString();

					cell.appendChild(content);

					cell.addEventListener("click", (e) => {
						const old = _yearBody.querySelector(
							".dpk-cell-content.dpk-large-cell-content.active"
						);

						if (old) old.classList.remove("active");
						content.classList.add("active");
						this.currentYear = Number(content.innerText);

						this.TableDay.style.display = "none";
						this.TableYear.style.display = "none";
						this.TableMonth.style.display = "block";

						this.changeButton.innerText = `${this.currentYear}`;
					});

					row.appendChild(cell);
				});

				_yearBody.appendChild(row);
			});
		}
	}
}

function datepicker_init(
	onOk?: (date: string) => void,
	_input?: HTMLInputElement
) {
	const cssCode = `button { cursor: pointer; } .dpk-modal { height: 100%; width: 100%; position: fixed; right: 0; opacity: 0; top: 0; left: 0; display: flex; align-items: center; justify-content: center; z-index: -10000000; background-color: rgba(0, 0, 0, 0.2); transition-duration: 700ms; } .dpk-modal-close { width: 100%; height: 100%; } .dpk-modal.active { opacity: 1; top: 0; z-index: 1066; } .dpk-modal.active .dpk-container { z-index: 1067; opacity: 1; top: 50%; } .dpk-container { display: flex; flex-direction: column; position: fixed; left: 50%; transform: translate(-50%, -50%); width: 328px; height: 512px; background-color: #fff; border-radius: 0.6rem 0.6rem 0.5rem 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 7%),   0 4px 6px -2px rgb(0 0 0 / 5%); z-index: -10000000; opacity: 0; top: -100%; transition-duration: 700ms; } .dpk-header { height: 120px; padding-right: 24px; padding-left: 24px; background-color: #2979ff; display: flex; flex-direction: column; border-radius: 0.5rem 0.5rem 0 0; } .dpk-title { height: 32px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-title-text { font-size: 10px; font-weight: 400; -webkit-text-transform: uppercase; text-transform: uppercase; letter-spacing: 1.7px; color: #fff; } .dpk-date { height: 72px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-date-text { font-size: 32px; font-weight: 400; color: #fff; margin-bottom: 5px; } .dpk-main { position: relative; height: 100%; } .dpk-date-controls { padding: 10px 12px 0; display: flex; justify-content: space-between; color: rgba(0, 0, 0, 0.64); } .dpk-view { padding-left: 12px; padding-right: 12px; outline: none; } .dpk-footer { height: 56px; display: flex; position: absolute; width: calc(100% - 24px); bottom: 0; justify-content: flex-end; align-items: center; padding-left: 12px; padding-right: 12px; } .dpk-footer-btn:hover, .dpk-view-change-button:hover, .dpk-previous-button:hover, .dpk-next-button:hover, .dpk-small-cell-content:hover, .dpk-large-cell-content:hover { background-color: #eee; cursor: pointer; } .dpk-footer-btn { background-color: #fff; color: #2979ff; border: none; cursor: pointer; padding: 0 10px; -webkit-text-transform: uppercase; text-transform: uppercase; font-size: 0.8rem; font-weight: 500; height: 40px; line-height: 40px; letter-spacing: 0.1rem; border-radius: 10px; margin-bottom: 10px; } .dpk-clear-btn { margin-right: auto; } .dpk-view-change-button { padding: 10px; color: #666; font-weight: 500; font-size: 0.9rem; border-radius: 10px; box-shadow: none; cursor: pointer; background-color: transparent; margin: 0; border: none; } .dpk-view-change-button::after { content: ""; display: inline-block; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top-width: 5px; border-top-style: solid; margin: 0 0 0 5px; vertical-align: middle; } .dpk-arrow-controls { margin-top: 10px; } .dpk-previous-button { position: relative; padding: 0; width: 40px; cursor: pointer; height: 40px; line-height: 40px; border: none; outline: none; margin: 0; color: rgba(0, 0, 0, 0.64); background-color: transparent; margin-right: 24px; } .dpk-previous-button::after { top: 0; left: 0; right: 0; bottom: 0; position: absolute; content: ""; margin: 15.5px; border: 0 solid; border-top-width: 2px; border-left-width: 2px; transform: translateX(2px) rotate(-45deg); } .dpk-previous-button:hover, .dpk-next-button:hover { border-radius: 50%; } .dpk-next-button { position: relative; padding: 0; width: 40px; height: 40px; line-height: 40px; border: none; outline: none; margin: 0; color: rgba(0, 0, 0, 0.64); background-color: transparent; } .dpk-next-button::after { top: 0; left: 0; right: 0; bottom: 0; position: absolute; content: ""; margin: 15.5px; border: 0 solid; border-top-width: 2px; border-right-width: 2px; transform: translateX(-2px) rotate(45deg); } .dpk-table { margin-right: auto; margin-left: auto; width: 304px; } table { text-indent: 0; border-color: inherit; border-collapse: collapse; } .dpk-day-heading { width: 40px; height: 40px; -webkit-text-align: center; text-align: center; font-size: 12px; font-weight: 400; } .dpk-small-cell { width: 40px; height: 40px; } .dpk-cell { -webkit-text-align: center; text-align: center; } .dpk-small-cell-content { width: 36px; height: 36px; line-height: 36px; border-radius: 50%; font-size: 13px; cursor: pointer; } .dpk-large-cell { width: 76px; height: 42px; } .dpk-large-cell-content { width: 72px; height: 40px; line-height: 40px; padding: 1px 2px; border-radius: 999px; } .dpk-small-cell-content.active, .dpk-large-cell-content.active { background-color: #2979ff; color: #eee; } .dpk-small-cell-content.today, .dpk-large-cell-content.today { border: 1px solid #787878; }`;
	const style = document.createElement("style");

	style.innerText = cssCode;
	document.head.appendChild(style);

	if (_input === undefined) {
		const inputs = document.querySelectorAll('input[type="text"]');

		inputs.forEach((input, key) => {
			if (input.getAttribute("data-type") !== "datepicker") return;
			try {
				new Calendar(input as HTMLInputElement, onOk);
			} catch (err) {
				console.log(err);
			}
		});
	} else {
		const input = _input;
		if (input.getAttribute("data-type") !== "datepicker") return;
		try {
			new Calendar(input as HTMLInputElement, onOk);
		} catch (err) {
			console.log(err);
		}
	}
}

// datepicker_init();
