class Calendar {
  private months = new Array(
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
    "Dezembro"
  );

  private day = 0;
  private month = 0;
  private year = 0;

  private Element: HTMLDivElement | null = null;
  private idElement =  "id_date_" + Math.floor(Math.random() * 10000000000000);

  nextYear() {
    this.year += 1;
    this.render({ day: this.day, month: this.month, year: this.year });
  }

  prevYear() {
    this.year -= 1;
    this.render({ day: this.day, month: this.month, year: this.year });
  }

  constructor(date: { day: number; month: number; year: number }) {
    this.Element = document.createElement("div");
    this.Element.id = this.idElement;
    this.render(date);
  }

  private render(date_input: { day: number; month: number; year: number }) {
    let html = "";

    const date = new Date();
    const { day: day_input, month: month_input, year: year_input } = date_input;

    this.day = day_input ?? date.getDate();
    this.month = month_input ?? date.getMonth();
    this.year = year_input ?? date.getFullYear();

    if (this.year <= 200) this.year += 1900;

    let days_in_month = new Array(
      31,
      28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31
    );
    let month_inputaujorduiu = this.month;
    this.month = month_input;

    //ano bissesto, muda dia fevereiro
    if (this.year % 4 == 0 && this.year != 1900) days_in_month[1] = 29;

    let total = days_in_month[this.month]; //days month
    let date_today = this.day + " " + this.months[this.month] + " " + this.year; //22 ouctober 2014

    let beg_j = date; //today date

    if (this.month > 0) {
      let soma = 0;
      for (let m = 0; m < this.month; m++) soma += days_in_month[m];

      beg_j.setDate(soma + 1);
    } else beg_j.setDate(1);

    if (beg_j.getDate() == 2) {
      //1
      beg_j.setDate(0);
    }
    let beg_g = beg_j.getDay();

    html += `<h3>${date_today}</h3>`;
    html += `
      <table class="cal_calendar">
        <tr>
          <th colspan="7">${this.months[month_input]}  ${this.year}</th>
        </tr>
        <br>`;

    html += `
      <tr class="cal_d_weeks">
        <th>Seg</th>
        <th>Ter</th>
        <th>Qua</th>
        <th>Qui</th>
        <th>Sex</th>
        <th>Sab</th>
        <th>Dom</th>
      </tr>
      <tr>`;

    let week = 0;

    for (let i = 1; i <= beg_g; i++) {
      // let beforemonth = months[month - 1];

      html += `<td>
          <div class ="divday"/>${
            days_in_month[this.month - 1] - beg_g + i
          }</div>
        </td>`;

      week++;
    }
    for (let i = 1; i <= total; i++) {
      if (week == 0) {
        document.write("<tr>");
      }

      if (this.day == i && month_inputaujorduiu == this.month) {
        //si le jour = le jour de aujordhui est si le month_input = month_input aujordui
        html +=
          "<td><b><div class ='divtoday' onclick='open_popup(\"" +
          i +
          " " +
          this.months[this.month] +
          "\")' href='#'>" +
          i +
          "</div><b></td>";
        //day of today
      }
      //les autre jours
      else {
        html +=
          "<td><div class ='divday' onclick='open_popup(\"" +
          i +
          " " +
          this.months[this.month] +
          "\")' href='#'>" +
          i +
          "</div></td>";
      }
      week++;
      if (week == 7) {
        html += "</tr>";
        week = 0;
      }
    }

    //pour les jour du prochain month_input

    for (let i = 1; week != 0; i++) {
      let nextmonth = this.months[this.month + 1];
      html += '<td><div class ="divday">' + i + "</td>";
      week++;
      if (week == 7) {
        html += "</tr>";
        week = 0;
      }
    }
    html += "</table>";
    if (this.Element) {
      // document.getElementById(this.idElement).

      this.Element.innerHTML = html;
      document.body.append(this.Element);
    }
  }
}
