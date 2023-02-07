"use strict";
var Calendar = (function () {
    function Calendar(InputData, onOk) {
        var _this = this;
        this._currentPage = 0;
        this._currentMonth = 0;
        this._currentYear = 0;
        this._currentDay = 0;
        this.months = {
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
            ]
        };
        this.today = new Date();
        this.years = [];
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.currentDay = this.today.getDate();
        var template = document.createElement("template");
        var randomID = "id_".concat(Math.random().toString(36).slice(2), "_").concat(Math.floor(Math.random() * 1000000000000));
        this.InputData = InputData;
        this.InputData.placeholder = "dd/mm/aaaa";
        this.initYears();
        var htmlCode = "\n\t\t\t<div id=\"".concat(randomID, "\" class=\"dpk-modal\">\n\t\t\t\t<div class=\"dpk-container\">\n\t\t\t\t\t<div class=\"dpk-header\">\n\t\t\t\t\t\t<div class=\"dpk-title\">\n\t\t\t\t\t\t\t<span class=\"dpk-title-text\">Selecionar data</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"dpk-date\">\n\t\t\t\t\t\t\t<span class=\"dpk-date-text\">\n\t\t\t\t\t\t\t").concat(this.currentDay, " de ").concat(this.months.pt[this.currentMonth].slice(0, 3), ", ").concat(this.currentYear, "\n\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"dpk-main\">\n\t\t\t\t\t\t<div class=\"dpk-date-controls\">\n\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\tclass=\"dpk-view-change-button\"\n\t\t\t\t\t\t\t\taria-label=\"Choose year and month\"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\tFevereiro 2023\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t<div class=\"dpk-arrow-controls\">\n\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\tclass=\"dpk-previous-button\"\n\t\t\t\t\t\t\t\t\taria-label=\"Previous month\"\n\t\t\t\t\t\t\t\t></button>\n\t\t\t\t\t\t\t\t<button class=\"dpk-next-button\" aria-label=\"Next month\"></button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"dpk-view\">\n\t\t\t\t\t\t\t<table class=\"dpk-table dpk-table-day\">\n\t\t\t\t\t\t\t\t<thead>\n\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Sunday\">\n\t\t\t\t\t\t\t\t\t\t\tD\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Monday\">\n\t\t\t\t\t\t\t\t\t\t\tS\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Tuesday\">\n\t\t\t\t\t\t\t\t\t\t\tT\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th\n\t\t\t\t\t\t\t\t\t\t\tclass=\"dpk-day-heading\"\n\t\t\t\t\t\t\t\t\t\t\tscope=\"col\"\n\t\t\t\t\t\t\t\t\t\t\taria-label=\"Wednesday\"\n\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\tQ\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Thursday\">\n\t\t\t\t\t\t\t\t\t\t\tQ\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Friday\">\n\t\t\t\t\t\t\t\t\t\t\tS\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t\t<th class=\"dpk-day-heading\" scope=\"col\" aria-label=\"Saturday\">\n\t\t\t\t\t\t\t\t\t\t\tS\n\t\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t</thead>\n\t\t\t\t\t\t\t\t<tbody class=\"dpk-table-body\"></tbody>\n\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t<table class=\"dpk-table dpk-table-month\" style=\"display: none;\">\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<tbody class=\"dpk-table-body-month\"></tbody>\n\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t<table class=\"dpk-table dpk-table-year\" style=\"display: none;\">\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<tbody class=\"dpk-table-body-month\"></tbody>\n\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"dpk-footer\">\n\t\t\t\t\t\t\t<button class=\"dpk-footer-btn dpk-clear-btn\" aria-label=\"Limpar sele\u00E7\u00E3o\">Limpar</button>\n\t\t\t\t\t\t\t<button class=\"dpk-footer-btn dpk-cancel-btn\" aria-label=\"Cancelar sele\u00E7\u00E3o\">Cancelar</button>\n\t\t\t\t\t\t\t<button class=\"dpk-footer-btn dpk-ok-btn\" aria-label=\"Confirmar sele\u00E7\u00E3o\">Ok</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"dpk-modal-close\"></div>\n\t\t\t</div>");
        template.innerHTML = htmlCode;
        this.Element = template.content.getElementById(randomID);
        this.CalendarTable = template.content.querySelector(".dpk-table-body");
        var closeView = template.content.querySelector(".dpk-modal-close");
        var cancelButton = template.content.querySelector(".dpk-cancel-btn");
        var clearButton = template.content.querySelector(".dpk-clear-btn");
        var okButton = template.content.querySelector(".dpk-ok-btn");
        var nextButton = template.content.querySelector(".dpk-next-button");
        var prevButton = template.content.querySelector(".dpk-previous-button");
        this.changeButton = template.content.querySelector(".dpk-view-change-button");
        this.DateTable = template.content.querySelector(".dpk-date-text");
        this.TableYear = template.content.querySelector(".dpk-table-year");
        this.TableMonth = template.content.querySelector(".dpk-table-month");
        this.TableDay = template.content.querySelector(".dpk-table-day");
        this.changeButton.addEventListener("click", function (e) {
            if (_this.TableDay.style.display !== "none") {
                _this.TableDay.style.display = "none";
                _this.TableMonth.style.display = "block";
                _this.TableYear.style.display = "none";
                _this.changeButton.innerText = "".concat(_this.currentYear);
            }
            else if (_this.TableMonth.style.display !== "none") {
                _this.TableDay.style.display = "none";
                _this.TableMonth.style.display = "none";
                _this.TableYear.style.display = "block";
            }
            else if (_this.TableYear.style.display !== "none") {
                _this.TableDay.style.display = "block";
                _this.TableMonth.style.display = "none";
                _this.TableYear.style.display = "none";
            }
        });
        closeView.addEventListener("click", function (e) { return _this.close(); });
        cancelButton.addEventListener("click", function (e) { return _this.close(); });
        nextButton.addEventListener("click", function (e) { return _this.next(); });
        prevButton.addEventListener("click", function (e) { return _this.previous(); });
        okButton.addEventListener("click", function (e) {
            _this.inputDate(_this.currentDay);
            if (onOk)
                onOk("".concat(_this.currentDay, "/").concat(_this.currentMonth + 1, "/").concat(_this.currentYear));
        });
        clearButton.addEventListener("click", function (e) { return _this.clear(); });
        this.changeButton.addEventListener("click", function (e) { });
        document.body.appendChild(template.content);
        this.init(this.currentMonth, this.currentYear, this.currentDay);
        this.InputData.addEventListener("click", function (e) {
            if (_this.InputData.value.trim() !== "") {
                var datas = _this.InputData.value.split("/");
                var day = Number(datas[0]);
                var month = Number(datas[1]) - 1;
                var year = Number(datas[2]);
                _this.init(month, year, day);
            }
            _this.open();
        });
    }
    Calendar.prototype.initYears = function () {
        this.years = [];
        for (var year = this.today.getFullYear() - 100; year <= this.today.getFullYear() + 115; year++) {
            this.years.push(year);
        }
    };
    Calendar.prototype.changePageYear = function (page) {
        var startIndex = page * 24;
        var yearsSlice = this.years.slice(startIndex, startIndex + 24);
        var yearsGroups = [];
        for (var i = 0; i < yearsSlice.length; i += 4) {
            yearsGroups.push(yearsSlice.slice(i, i + 4));
        }
        return yearsGroups;
    };
    Calendar.prototype.focusYear = function (year) {
        var _this = this;
        var len = this.years.length / 24;
        var _loop_1 = function (i) {
            var calendar = this_1.changePageYear(i);
            var _return = null;
            calendar.forEach(function (item) {
                if (item.includes(year)) {
                    _this._currentPage = i;
                    _return = calendar;
                }
            });
            if (_return !== null)
                return { value: _return };
        };
        var this_1 = this;
        for (var i = 0; i < len; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return null;
    };
    Calendar.prototype.open = function () {
        this.Element.classList.add("active");
    };
    Calendar.prototype.close = function () {
        this.Element.classList.remove("active");
    };
    Calendar.prototype.clear = function () {
        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.currentDay = this.today.getDate();
        this._currentMonth = 0;
        this._currentYear = 0;
        this._currentDay = 0;
        this.InputData.value = "";
        this.init(this.currentMonth, this.currentYear, this.currentDay);
    };
    Calendar.prototype.next = function () {
        if (this.TableDay.style.display !== "none") {
            this.currentYear =
                this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
            this.currentMonth = (this.currentMonth + 1) % 12;
            this.init(this.currentMonth, this.currentYear, this.currentDay);
        }
        else if (this.TableMonth.style.display !== "none") {
            this.currentYear += 1;
            this.changeButton.innerText = "".concat(this.currentYear);
        }
        else if (this.TableYear.style.display !== "none") {
            this._currentPage =
                this._currentPage === 8 ? this._currentPage : this._currentPage + 1;
            this.yearsRender(this._currentPage);
        }
    };
    Calendar.prototype.previous = function () {
        if (this.TableDay.style.display !== "none") {
            this.currentYear =
                this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
            this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
            this.init(this.currentMonth, this.currentYear, this.currentDay);
        }
        else if (this.TableMonth.style.display !== "none") {
            this.currentYear -= 1;
            this.changeButton.innerText = "".concat(this.currentYear);
        }
        else if (this.TableYear.style.display !== "none") {
            this._currentPage =
                this._currentPage === 0 ? this._currentPage : this._currentPage - 1;
            this.yearsRender(this._currentPage);
        }
    };
    Calendar.prototype.inputDate = function (day) {
        this.InputData.value = "".concat(day, "/").concat(1 + this.currentMonth, "/").concat(this.currentYear);
        this._currentMonth = this.currentMonth;
        this._currentYear = this.currentYear;
        this._currentDay = this.currentDay;
        this.close();
    };
    Calendar.prototype.init = function (month, year, day) {
        var _this = this;
        var firstDay = new Date(year, month).getDay();
        var daysInMonth = 32 - new Date(year, month, 32).getDate();
        this.currentMonth = month;
        this.currentYear = year;
        this.currentDay = day;
        this.DateTable.innerHTML = "".concat(this.currentDay, " de ").concat(this.months.pt[this.currentMonth].slice(0, 3), ", ").concat(this.currentYear);
        this.CalendarTable.innerHTML = "";
        window.addEventListener("click", function (e) {
            if (e.target.id === _this.Element.id) {
                _this.close();
            }
        });
        var date = 1;
        for (var i = 0; i < 6; i++) {
            var row = document.createElement("tr");
            var _loop_2 = function (j) {
                if (i === 0 && j < firstDay) {
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode("");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                else if (date > daysInMonth)
                    return "break";
                else {
                    var cell = document.createElement("td");
                    var content_1 = document.createElement("div");
                    cell.classList.add("dpk-cell", "dpk-small-cell", "dpk-day-cell");
                    content_1.classList.add("dpk-cell-content", "dpk-small-cell-content");
                    if (date === this_2.today.getDate() &&
                        year === this_2.today.getFullYear() &&
                        month === this_2.today.getMonth()) {
                        content_1.classList.add("today");
                    }
                    if (date === this_2._currentDay &&
                        year === this_2._currentYear &&
                        month === this_2._currentMonth) {
                        content_1.classList.add("active");
                    }
                    content_1.innerText = date.toString();
                    cell.appendChild(content_1);
                    cell.addEventListener("click", function (e) {
                        var old = _this.CalendarTable.querySelector(".dpk-cell-content.dpk-small-cell-content.active");
                        if (old)
                            old.classList.remove("active");
                        content_1.classList.add("active");
                        _this.currentDay = Number(content_1.innerText);
                        _this.DateTable.innerHTML = "".concat(_this.currentDay, " de ").concat(_this.months.pt[_this.currentMonth].slice(0, 3), ", ").concat(_this.currentYear);
                    });
                    row.appendChild(cell);
                    date++;
                }
            };
            var this_2 = this;
            for (var j = 0; j < 7; j++) {
                var state_2 = _loop_2(j);
                if (state_2 === "break")
                    break;
            }
            this.CalendarTable.appendChild(row);
        }
        this.monthRender();
        this.yearsRender();
    };
    Calendar.prototype.monthRender = function (month) {
        var _this = this;
        var _monthBody = this.TableMonth.querySelector("tbody");
        if (_monthBody) {
            _monthBody.innerHTML = "";
            [
                this.months.pt.slice(0, 4),
                this.months.pt.slice(4, 8),
                this.months.pt.slice(8, 12),
            ].forEach(function (group) {
                var row = document.createElement("tr");
                group.forEach(function (month) {
                    var cell = document.createElement("td");
                    var content = document.createElement("div");
                    cell.classList.add("dpk-cell", "dpk-large-cell");
                    content.classList.add("dpk-cell-content", "dpk-large-cell-content");
                    if (_this.months.pt.indexOf(month) === _this.today.getMonth()) {
                        content.classList.add("today");
                    }
                    if (_this.months.pt.indexOf(month) === _this._currentMonth) {
                        content.classList.add("active");
                    }
                    content.innerText = month.slice(0, 3);
                    cell.appendChild(content);
                    cell.addEventListener("click", function (e) {
                        var old = _monthBody.querySelector(".dpk-cell-content.dpk-large-cell-content.active");
                        if (old)
                            old.classList.remove("active");
                        content.classList.add("active");
                        _this.currentMonth = _this.months.pt.indexOf(month);
                        _this.TableDay.style.display = "block";
                        _this.TableYear.style.display = "none";
                        _this.TableMonth.style.display = "none";
                        _this.changeButton.innerText = "".concat(month, ", ").concat(_this.currentYear);
                    });
                    row.appendChild(cell);
                });
                _monthBody.appendChild(row);
            });
        }
    };
    Calendar.prototype.yearsRender = function (page) {
        var _this = this;
        var _yearBody = this.TableYear.querySelector("tbody");
        if (_yearBody) {
            _yearBody.innerHTML = "";
            var _init = page !== undefined
                ? this.changePageYear(page)
                : this.focusYear(this.currentYear);
            var focusedYear = _init === null ? this.changePageYear(this._currentPage) : _init;
            focusedYear.forEach(function (item) {
                var row = document.createElement("tr");
                item.forEach(function (_year) {
                    var cell = document.createElement("td");
                    var content = document.createElement("div");
                    cell.classList.add("dpk-cell", "dpk-large-cell");
                    content.classList.add("dpk-cell-content", "dpk-large-cell-content");
                    if (_year === _this.today.getFullYear()) {
                        content.classList.add("today");
                    }
                    if (_year === _this._currentYear) {
                        content.classList.add("active");
                    }
                    content.innerText = _year.toString();
                    cell.appendChild(content);
                    cell.addEventListener("click", function (e) {
                        var old = _yearBody.querySelector(".dpk-cell-content.dpk-large-cell-content.active");
                        if (old)
                            old.classList.remove("active");
                        content.classList.add("active");
                        _this.currentYear = Number(content.innerText);
                        _this.TableDay.style.display = "none";
                        _this.TableYear.style.display = "none";
                        _this.TableMonth.style.display = "block";
                        _this.changeButton.innerText = "".concat(_this.currentYear);
                    });
                    row.appendChild(cell);
                });
                _yearBody.appendChild(row);
            });
        }
    };
    return Calendar;
}());
function datepicker_init(onOk, _input) {
    var cssCode = "button { cursor: pointer; } .dpk-modal { height: 100%; width: 100%; position: fixed; right: 0; opacity: 0; top: 0; left: 0; display: flex; align-items: center; justify-content: center; z-index: -10000000; background-color: rgba(0, 0, 0, 0.2); transition-duration: 700ms; } .dpk-modal-close { width: 100%; height: 100%; } .dpk-modal.active { opacity: 1; top: 0; z-index: 1066; } .dpk-modal.active .dpk-container { z-index: 1067; opacity: 1; top: 50%; } .dpk-container { display: flex; flex-direction: column; position: fixed; left: 50%; transform: translate(-50%, -50%); width: 328px; height: 512px; background-color: #fff; border-radius: 0.6rem 0.6rem 0.5rem 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 7%),   0 4px 6px -2px rgb(0 0 0 / 5%); z-index: -10000000; opacity: 0; top: -100%; transition-duration: 700ms; } .dpk-header { height: 120px; padding-right: 24px; padding-left: 24px; background-color: #2979ff; display: flex; flex-direction: column; border-radius: 0.5rem 0.5rem 0 0; } .dpk-title { height: 32px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-title-text { font-size: 10px; font-weight: 400; -webkit-text-transform: uppercase; text-transform: uppercase; letter-spacing: 1.7px; color: #fff; } .dpk-date { height: 72px; display: flex; flex-direction: column; justify-content: flex-end; } .dpk-date-text { font-size: 32px; font-weight: 400; color: #fff; margin-bottom: 5px; } .dpk-main { position: relative; height: 100%; } .dpk-date-controls { padding: 10px 12px 0; display: flex; justify-content: space-between; color: rgba(0, 0, 0, 0.64); } .dpk-view { padding-left: 12px; padding-right: 12px; outline: none; } .dpk-footer { height: 56px; display: flex; position: absolute; width: calc(100% - 24px); bottom: 0; justify-content: flex-end; align-items: center; padding-left: 12px; padding-right: 12px; } .dpk-footer-btn:hover, .dpk-view-change-button:hover, .dpk-previous-button:hover, .dpk-next-button:hover, .dpk-small-cell-content:hover, .dpk-large-cell-content:hover { background-color: #eee; cursor: pointer; } .dpk-footer-btn { background-color: #fff; color: #2979ff; border: none; cursor: pointer; padding: 0 10px; -webkit-text-transform: uppercase; text-transform: uppercase; font-size: 0.8rem; font-weight: 500; height: 40px; line-height: 40px; letter-spacing: 0.1rem; border-radius: 10px; margin-bottom: 10px; } .dpk-clear-btn { margin-right: auto; } .dpk-view-change-button { padding: 10px; color: #666; font-weight: 500; font-size: 0.9rem; border-radius: 10px; box-shadow: none; cursor: pointer; background-color: transparent; margin: 0; border: none; } .dpk-view-change-button::after { content: \"\"; display: inline-block; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top-width: 5px; border-top-style: solid; margin: 0 0 0 5px; vertical-align: middle; } .dpk-arrow-controls { margin-top: 10px; } .dpk-previous-button { position: relative; padding: 0; width: 40px; cursor: pointer; height: 40px; line-height: 40px; border: none; outline: none; margin: 0; color: rgba(0, 0, 0, 0.64); background-color: transparent; margin-right: 24px; } .dpk-previous-button::after { top: 0; left: 0; right: 0; bottom: 0; position: absolute; content: \"\"; margin: 15.5px; border: 0 solid; border-top-width: 2px; border-left-width: 2px; transform: translateX(2px) rotate(-45deg); } .dpk-previous-button:hover, .dpk-next-button:hover { border-radius: 50%; } .dpk-next-button { position: relative; padding: 0; width: 40px; height: 40px; line-height: 40px; border: none; outline: none; margin: 0; color: rgba(0, 0, 0, 0.64); background-color: transparent; } .dpk-next-button::after { top: 0; left: 0; right: 0; bottom: 0; position: absolute; content: \"\"; margin: 15.5px; border: 0 solid; border-top-width: 2px; border-right-width: 2px; transform: translateX(-2px) rotate(45deg); } .dpk-table { margin-right: auto; margin-left: auto; width: 304px; } table { text-indent: 0; border-color: inherit; border-collapse: collapse; } .dpk-day-heading { width: 40px; height: 40px; -webkit-text-align: center; text-align: center; font-size: 12px; font-weight: 400; } .dpk-small-cell { width: 40px; height: 40px; } .dpk-cell { -webkit-text-align: center; text-align: center; } .dpk-small-cell-content { width: 36px; height: 36px; line-height: 36px; border-radius: 50%; font-size: 13px; cursor: pointer; } .dpk-large-cell { width: 76px; height: 42px; } .dpk-large-cell-content { width: 72px; height: 40px; line-height: 40px; padding: 1px 2px; border-radius: 999px; } .dpk-small-cell-content.active, .dpk-large-cell-content.active { background-color: #2979ff; color: #eee; } .dpk-small-cell-content.today, .dpk-large-cell-content.today { border: 1px solid #787878; }";
    var style = document.createElement("style");
    style.innerText = cssCode;
    document.head.appendChild(style);
    if (_input === undefined) {
        var inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(function (input, key) {
            if (input.getAttribute("data-type") !== "datepicker")
                return;
            try {
                new Calendar(input, onOk);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    else {
        var input = _input;
        if (input.getAttribute("data-type") !== "datepicker")
            return;
        try {
            new Calendar(input, onOk);
        }
        catch (err) {
            console.log(err);
        }
    }
}
