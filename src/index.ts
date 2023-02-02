class Calendar {
	private currentMonth: number;
	private currentYear: number;
	private Element: HTMLElement;
	private CalendarTable: HTMLTableSectionElement;
	private DateTable: HTMLDivElement;
	private MonthsList: HTMLDivElement;
	private YearsList: HTMLDivElement;
	private InputData: HTMLInputElement;
	private inMonth = true;

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
		en: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		],
	};

	open() {
		this.Element.classList.add("opacity-100", "bottom-0");
	}
	close() {
		this.Element.classList.remove("opacity-100", "bottom-0");
	}

	constructor(InputData: HTMLInputElement) {
		this.today = new Date();

		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();

		const template = document.createElement("template");
		const randomID = `id_${Math.random().toString(36).slice(2)}_${Math.floor(
			Math.random() * 1000000000000
		)}`;

		this.InputData = InputData;
		this.InputData.placeholder = "dd/mm/aaaa";

		let defaultHTML = `
      <div id="${randomID}" class="h-full w-full fixed right-0 opacity-0 -bottom-full duration-700 left-0 bg-black/[.40] flex items-center justify-center">
        <div class="bg-white w-auto p-5 shadow-lg rounded-md"  style="width: 490px;">
					<div class="actual-date mb-4"></div>
          <table>
            <thead>
              <tr>
                <th class="bg-blue-100 border text-center px-4 py-4">Dom</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Seg</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Ter</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Qua</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Qui</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Sex</th>
                <th class="bg-blue-100 border text-left px-4 py-4">Sab</th>
              </tr>
            </thead>

            <tbody class="table-calendar"></tbody>
          </table>
					<div class="flex-wrap hidden months-list">`;

		this.months.pt.forEach((month, index) => {
			defaultHTML += `
						<div class="w-1/4 flex justify-center items-center">
							<div style="height: 107px; width: 107px;" data-type="button" data-value="${index}" class="rounded-full flex justify-center items-center hover:bg-gray-300 hover:cursor-pointer">
								${month.slice(0, 3)}
							</div>
						</div>`;
		});

		defaultHTML += `
					</div>					
					<div class="flex-wrap hidden year-list" style="height: 400px;	overflow-y: auto;">`;

		const anos: number[] = [];
		for (
			let ano = this.currentYear - 100;
			ano <= this.currentYear + 100;
			ano++
		) {
			anos.push(ano);
		}

		anos.forEach((ano, index) => {
			defaultHTML += `
						<div class="w-1/4 flex justify-center items-center">
							<div style="height: 107px; width: 107px;" data-type="button" data-value="${ano}" class="rounded-full flex justify-center items-center hover:bg-gray-300 hover:cursor-pointer">
								${ano}
							</div>
						</div>`;
		});

		defaultHTML += `
					</div>
        </div>
      </div>`;

		template.innerHTML = defaultHTML;

		this.Element = template.content.getElementById(randomID) as HTMLElement;
		this.CalendarTable = template.content.querySelector(
			".table-calendar"
		) as HTMLTableSectionElement;

		this.DateTable = template.content.querySelector(
			".actual-date"
		) as HTMLDivElement;

		this.MonthsList = template.content.querySelector(
			".months-list"
		) as HTMLDivElement;

		this.YearsList = template.content.querySelector(
			".year-list"
		) as HTMLDivElement;

		const table = template.content.querySelector("table");

		template.content
			.querySelectorAll('div[data-type="button"]')
			.forEach((button) => {
				button.addEventListener("click", () => {
					if (this.inMonth) {
						const month = button.getAttribute("data-value") ?? 0;
						this.init(Number(month), this.currentYear);
						this.DateTable.innerHTML = `<span class="text-xl font-semibold">${
							this.months.pt[this.currentMonth]
						}, ${this.currentYear}</span>`;
						this.MonthsList.classList.remove("flex");
						this.MonthsList.classList.add("hidden");

						this.inMonth = true;
						if (table) table.classList.remove("hidden");
					} else {
						const year = button.getAttribute("data-value") ?? this.currentYear;
						this.init(this.currentMonth, Number(year));
						this.DateTable.innerHTML = `<span class="text-xl font-semibold">${year}</span>`;

						this.MonthsList.classList.add("flex");
						this.MonthsList.classList.remove("hidden");

						this.YearsList.classList.remove("flex");
						this.YearsList.classList.add("hidden");
					}
				});
			});

		this.DateTable.addEventListener("click", (e) => {
			if (this.inMonth) {
				this.DateTable.innerHTML = `<span class="text-xl font-semibold">${this.currentYear}</span>`;
				this.MonthsList.classList.add("flex");
				this.MonthsList.classList.remove("hidden");

				if (table) table.classList.add("hidden");
			} else {
				this.YearsList.classList.add("flex");
				this.YearsList.classList.remove("hidden");

				this.MonthsList.classList.add("hidden");
				if (table) table.classList.add("hidden");
			}
			this.inMonth = !this.inMonth;
		});

		document.body.appendChild(template.content);
		this.init(this.currentMonth, this.currentYear);

		this.InputData.addEventListener("click", (e) => {
			if (this.InputData.value.trim() !== "") {
				const datas = this.InputData.value.split("/");
				const day = Number(datas[0]);
				const month = Number(datas[1]) - 1;
				const year = Number(datas[2]);
				this.init(month, year);
			}
			this.open();
		});
	}

	private inputDate(day: number) {
		this.InputData.value = `${day}/${1 + this.currentMonth}/${
			this.currentYear
		}`;

		this.close();
	}

	private init(month: number, year: number) {
		let firstDay = new Date(year, month).getDay();
		let daysInMonth = 32 - new Date(year, month, 32).getDate();

		this.currentMonth = month;
		this.currentYear = year;

		this.DateTable.innerHTML = `<span class="text-xl font-semibold">${this.months.pt[month]}, ${year}</span>`;
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
					cell.classList.add(
						"border",
						"p-4",
						"text-center",
						"cursor-pointer",
						"hover:bg-slate-300"
					);
					let cellText = document.createTextNode(date.toString());
					if (
						date === this.today.getDate() &&
						year === this.today.getFullYear() &&
						month === this.today.getMonth()
					)
						cell.classList.add("bg-slate-400");

					cell.appendChild(cellText);

					cell.addEventListener("click", (e) => {
						this.inputDate(Number(cell.innerText));
					});
					row.appendChild(cell);
					date++;
				}
			}

			this.CalendarTable.appendChild(row);
		}
	}
}

function datepicker_init() {
	const inputs = document.querySelectorAll('input[type="text"]');
	const script = document.createElement("script");
	script.src = "https://cdn.tailwindcss.com";

	document.head.appendChild(script);

	inputs.forEach((input, key) => {
		if (input.getAttribute("data-type") !== "datepicker") return;
		try {
			new Calendar(input as HTMLInputElement);
		} catch (err) {
			console.log(err);
		}
	});
}

datepicker_init();
