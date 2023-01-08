class Calendar {
	private currentMonth: number;
	private currentYear: number;
	private Element: HTMLElement;
	private CalendarTable: HTMLTableSectionElement;

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

	constructor() {
		const template = document.createElement("template");
		const randomID = `id_${Math.random().toString(36).slice(2)}_${Math.floor(
			Math.random() * 1000000000000
		)}`;

		let defaultHTML = `
      <div id="${randomID}" class="h-full w-full fixed right-0 opacity-0 -bottom-full duration-700 left-0 bg-black/[.40] flex items-center justify-center">
        <div class="bg-white w-auto p-5 shadow-lg rounded-md">
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
        </div>
      </div>`;

		this.today = new Date();

		template.innerHTML = defaultHTML;

		this.Element = template.content.getElementById(randomID) as HTMLElement;
		this.CalendarTable = template.content.querySelector(
			".table-calendar"
		) as HTMLTableSectionElement;

		this.currentMonth = this.today.getMonth();
		this.currentYear = this.today.getFullYear();

		document.body.appendChild(template.content);
		this.init(this.currentMonth, this.currentYear);
	}

	private init(month: number, year: number) {
		let firstDay = new Date(year, month).getDay();
		let daysInMonth = 32 - new Date(year, month, 32).getDate();

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
					cell.classList.add("border", "p-4", "text-center");
					let cellText = document.createTextNode(date.toString());
					if (
						date === this.today.getDate() &&
						year === this.today.getFullYear() &&
						month === this.today.getMonth()
					)
						cell.style.backgroundColor = "red";

					cell.appendChild(cellText);
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

		const modalDatePicker = new Calendar();

		input.addEventListener("click", (e) => {
			modalDatePicker.open();
		});
	});
}

datepicker_init();
