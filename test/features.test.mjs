// Cartões 3 a 8: limites, opções, idioma, máscara, Hoje e intervalos.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { commit, setup, type } from "./helpers.mjs";

const disabled = (c) => c.getAttribute("aria-disabled") === "true";

describe("cartão 3: min, max e dias bloqueados", () => {
	const body =
		'<input type="text" data-type="datepicker" value="15/03/2023" data-min="10/03/2023" data-max="20/04/2023">';

	test("dias fora do intervalo ficam bloqueados e não se escolhem", () => {
		const { input, $, cell, active } = setup({ body });
		input.click();

		assert.ok(disabled(cell("9")));
		assert.ok(!disabled(cell("10")));
		cell("9").click();
		assert.deepEqual(active(), ["15"]);
		$(".dpk-ok-btn").click();
		assert.equal(input.value, "15/03/2023");
	});

	test("as setas param nos limites, e o mês do max também bloqueia os dias a seguir", () => {
		const { input, $, cell, heading } = setup({ body });
		input.click();

		assert.ok($(".dpk-previous-button").disabled);
		$(".dpk-next-button").click();
		assert.equal(heading(), "Abril de 2023");
		assert.ok($(".dpk-next-button").disabled);
		assert.ok(!disabled(cell("20")));
		assert.ok(disabled(cell("21")));
	});

	test("meses e anos fora do intervalo bloqueados, e a grelha de anos só tem 2023", () => {
		const { input, $, cell, cells } = setup({ body });
		input.click();

		$(".dpk-view-change-button").click();
		assert.ok(disabled(cell("Fev")));
		assert.ok(!disabled(cell("Mar")));
		assert.ok(!disabled(cell("Abr")));
		assert.ok(disabled(cell("Mai")));

		$(".dpk-view-change-button").click();
		assert.deepEqual(cells().map((c) => c.textContent), ["2023"]);
	});

	test("disabledDays e isDisabled bloqueiam, e o Ok desliga num dia bloqueado", () => {
		const { input, $, cell } = setup({
			body: '<input type="text" data-type="datepicker" value="18/03/2023">',
			init: (w) => w.datepicker_init({ disabledDays: [0, 6], isDisabled: (d) => d.getDate() === 15 }),
		});
		input.click();

		assert.ok(disabled(cell("18"))); // sábado
		assert.ok(disabled(cell("19"))); // domingo
		assert.ok(disabled(cell("15")));
		assert.ok(!disabled(cell("16")));
		assert.ok($(".dpk-ok-btn").disabled);
		cell("16").click();
		assert.ok(!$(".dpk-ok-btn").disabled);
	});

	test("sem data, abre no primeiro dia livre, e um dia bloqueado com foco não parece escolhido", () => {
		const today = new Date();
		const isToday = (d) =>
			d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
		const { input, $, key, header, active, cells } = setup({
			init: (w) => w.datepicker_init({ isDisabled: isToday }),
		});
		input.click();
		const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
		assert.ok(header().startsWith(`${tomorrow.getDate()} de `));
		assert.ok(!$(".dpk-ok-btn").disabled);

		// Volta com as setas para o dia bloqueado: tem o foco, mas não fica azul.
		const focusedCell = () => cells().find((c) => c.tabIndex === 0);
		key(focusedCell(), tomorrow.getDate() === 1 ? "PageUp" : "ArrowLeft");
		if (tomorrow.getDate() === 1) for (let i = 1; i < today.getDate(); i++) key(focusedCell(), "ArrowRight");
		assert.equal(focusedCell().textContent, `${today.getDate()}`);
		assert.deepEqual(active(), []);
		assert.ok($(".dpk-ok-btn").disabled);
	});

	test("min e max aceitam Date e aaaa-mm-dd, e min depois de max é erro", () => {
		const errors = [];
		const { window, calendars } = setup({
			body: '<input type="text" data-type="datepicker"><input type="text" data-type="datepicker" data-min="2023-05-01" data-max="2023-01-01">',
			beforeScript: (w) => (w.console.error = (e) => errors.push(String(e))),
			init: (w) => w.datepicker_init({ min: new w.Date(2023, 0, 1, 15, 30), max: "2023-12-31" }),
		});
		assert.equal(calendars.length, 1);
		assert.equal(calendars[0].options.min.getHours(), 0);
		assert.equal(calendars[0].options.max.getMonth(), 11);
		assert.match(errors[0], /min é posterior/);
		assert.ok(window);
	});
});

describe("cartão 4: opções e atributos", () => {
	test("forma antiga datepicker_init(onOk, input) continua igual", () => {
		const calls = [];
		const { window, document } = setup({
			body: '<input id="a" type="text" data-type="datepicker"><input id="b" type="text">',
			init: () => [],
		});
		const a = document.getElementById("a");
		const b = document.getElementById("b");
		assert.equal(window.datepicker_init((t) => calls.push(t), b).length, 0);
		assert.equal(window.datepicker_init((t) => calls.push(t), a).length, 1);
	});

	test("o alvo pode ser um seletor, e os inputs não precisam de data-type", () => {
		const { window, document } = setup({
			body: '<input class="data" type="text"><input class="data" type="text"><div class="data"></div>',
			init: (w) => w.datepicker_init({}, ".data"),
		});
		assert.equal(document.querySelectorAll("[data-dpk-ready]").length, 2);
		assert.ok(window);
	});

	test("format personalizado no output e na leitura", () => {
		const calls = [];
		const { input, $, cell } = setup({
			body: '<input type="text" data-type="datepicker" value="03/05/2023">',
			init: (w) => w.datepicker_init({ format: "mm/dd/yyyy", onOk: (t) => calls.push(t) }),
		});
		assert.equal(input.placeholder, "mm/dd/yyyy");
		input.click();
		cell("9").click();
		$(".dpk-ok-btn").click();
		assert.equal(input.value, "03/09/2023");
		assert.deepEqual(calls, ["03/09/2023"]);
	});

	test("atributos data-* ganham às opções", () => {
		const { calendars } = setup({
			body: `<input type="text" data-type="datepicker" data-format="aaaa-mm-dd" data-locale="en-US"
				data-range data-first-day="3" data-disabled-days="1, 2" data-display="modal" data-theme="dark"
				data-mask="false" data-min="2023-01-01" data-max="2023-12-31">`,
			init: (w) =>
				w.datepicker_init({ format: "dd/mm/aaaa", locale: "pt-PT", range: false, display: "sheet", theme: "light" }),
		});
		const o = calendars[0].options;
		assert.equal(o.format, "aaaa-mm-dd");
		assert.equal(o.locale, "en-US");
		assert.equal(o.range, true);
		assert.equal(o.firstDayOfWeek, 3);
		assert.deepEqual(Array.from(o.disabledDays), [1, 2]);
		assert.equal(o.display, "modal");
		assert.equal(o.theme, "dark");
		assert.equal(o.mask, false);
		assert.equal(o.min.getFullYear(), 2023);
	});

	test("um formato inválido não liga o input e diz porquê", () => {
		const errors = [];
		const { calendars } = setup({
			beforeScript: (w) => (w.console.error = (e) => errors.push(String(e))),
			init: (w) => w.datepicker_init({ format: "dd/aaaa" }),
		});
		assert.equal(calendars.length, 0);
		assert.match(errors[0], /Formato de data inválido/);
	});
});

describe("cartão 5: idioma e início da semana", () => {
	const headings = (root) => Array.from(root().querySelectorAll("thead th"));

	test("en-US: inglês, semana ao domingo, textos em inglês", () => {
		const { input, root, $, heading, header } = setup({
			body: '<input type="text" data-type="datepicker" data-locale="en-US" value="05/03/2023">',
		});
		input.click();
		assert.equal(heading(), "March 2023");
		assert.equal(header(), "March 5");
		assert.equal(headings(root)[0].abbr, "Sunday");
		assert.equal($(".dpk-today-btn").textContent, "Today");
		assert.equal($(".dpk-clear-btn").textContent, "Clear");
		assert.equal($(".dpk-previous-button").getAttribute("aria-label"), "Previous month");
	});

	test("pt-AO começa à segunda e pt-PT ao domingo, como diz o Intl", () => {
		const ao = setup({ body: '<input type="text" data-type="datepicker" data-locale="pt-AO" value="05/03/2023">' });
		ao.input.click();
		assert.equal(headings(ao.root)[0].abbr, "Segunda-feira");
		assert.equal(headings(ao.root)[0].textContent, "S");
		// 1 de março de 2023 foi uma quarta: em pt-AO há duas células vazias antes.
		assert.equal(ao.root().querySelector("tbody tr").querySelectorAll("td:not(.dpk-cell)").length, 2);

		const pt = setup({ body: '<input type="text" data-type="datepicker" value="05/03/2023">' });
		pt.input.click();
		assert.equal(headings(pt.root)[0].abbr, "Domingo");
	});

	test("firstDayOfWeek e labels sobrepõem-se ao idioma", () => {
		const { input, root, $ } = setup({
			init: (w) => w.datepicker_init({ locale: "en-US", firstDayOfWeek: 1, labels: { ok: "Done" } }),
		});
		input.click();
		assert.equal(headings(root)[0].abbr, "Monday");
		assert.equal($(".dpk-ok-btn").textContent, "Done");
		assert.equal($(".dpk-cancel-btn").textContent, "Cancel");
	});

	test("idioma sem textos próprios cai no inglês e mantém os nomes do Intl", () => {
		const { input, $, heading } = setup({
			body: '<input type="text" data-type="datepicker" data-locale="fr-FR" value="05/03/2023">',
		});
		input.click();
		assert.equal(heading(), "Mars 2023");
		assert.equal($(".dpk-ok-btn").textContent, "Ok");
	});
});

describe("cartão 6: escrever à mão", () => {
	test("a máscara põe os separadores e respeita os que se escrevem", () => {
		const { window, input } = setup();
		type(window, input, "05032023");
		assert.equal(input.value, "05/03/2023");
		type(window, input, "0503");
		assert.equal(input.value, "05/03");
		type(window, input, "05/");
		assert.equal(input.value, "05/");
		type(window, input, "5/3/2023");
		assert.equal(input.value, "5/3/2023");
		type(window, input, "05/03/20239999");
		assert.equal(input.value, "05/03/2023");
		type(window, input, "ab12");
		assert.equal(input.value, "12");
	});

	test("apagar não é reformatado, e o cursor fica no sítio a escrever no meio", () => {
		const { window, input } = setup();
		type(window, input, "05/0", "deleteContentBackward");
		assert.equal(input.value, "05/0");

		input.value = "0503/2023";
		input.setSelectionRange(4, 4);
		input.dispatchEvent(new window.InputEvent("input", { bubbles: true, inputType: "insertText" }));
		assert.equal(input.value, "05/03/2023");
		assert.equal(input.selectionStart, 5);
	});

	test("ao sair do campo a data é normalizada e confirmada", () => {
		const calls = [];
		const { window, input } = setup({ init: (w) => w.datepicker_init((t) => calls.push(t)) });
		commit(window, input, "5/3/2023");
		assert.equal(input.value, "05/03/2023");
		assert.deepEqual(calls, ["05/03/2023"]);
		assert.equal(input.getAttribute("aria-invalid"), null);
	});

	test("data impossível ou bloqueada fica marcada como inválida, sem apagar o texto", () => {
		const { window, input } = setup({
			body: '<input type="text" data-type="datepicker" data-max="31/12/2023">',
		});
		commit(window, input, "31/02/2023");
		assert.equal(input.value, "31/02/2023");
		assert.equal(input.getAttribute("aria-invalid"), "true");
		assert.ok(input.classList.contains("dpk-invalid"));

		commit(window, input, "01/01/2024");
		assert.equal(input.getAttribute("aria-invalid"), "true");

		commit(window, input, "01/01/2023");
		assert.equal(input.getAttribute("aria-invalid"), null);
		assert.ok(!input.classList.contains("dpk-invalid"));
	});

	test("mask: false desliga a máscara, e o input pede teclado numérico com ela", () => {
		const off = setup({ init: (w) => w.datepicker_init({ mask: false }) });
		type(off.window, off.input, "05032023");
		assert.equal(off.input.value, "05032023");
		assert.equal(off.input.getAttribute("inputmode"), null);

		const on = setup();
		assert.equal(on.input.getAttribute("inputmode"), "numeric");
	});
});

describe("cartão 7: botão Hoje", () => {
	test("leva ao mês de hoje e escolhe o dia", () => {
		const today = new Date();
		const { input, $, active, heading } = setup({
			body: '<input type="text" data-type="datepicker" value="05/03/2001">',
		});
		input.click();
		$(".dpk-today-btn").click();
		assert.ok(heading().endsWith(`${today.getFullYear()}`));
		assert.deepEqual(active(), [`${today.getDate()}`]);
		$(".dpk-ok-btn").click();
		const pad = (n) => String(n).padStart(2, "0");
		assert.equal(input.value, `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`);
	});

	test("desliga quando hoje está bloqueado", () => {
		const { input, $ } = setup({ body: '<input type="text" data-type="datepicker" data-max="2001-01-01">' });
		input.click();
		assert.ok($(".dpk-today-btn").disabled);
	});
});

describe("cartão 8: intervalos", () => {
	const body = '<input type="text" data-type="datepicker" data-range value="">';

	test("dois cliques escolhem início e fim, com os dias do meio marcados", () => {
		const calls = [];
		const { window, input, root, $, cell, active, header } = setup({
			body,
			init: (w) => w.datepicker_init((text, start, end) => calls.push([text, start, end])),
		});
		input.placeholder = "";
		input.click();
		$(".dpk-next-button");
		// Vai a março de 2023 pela grelha de anos e meses.
		$(".dpk-view-change-button").click();
		$(".dpk-view-change-button").click();
		while (!Array.from(root().querySelectorAll("tbody button")).some((b) => b.textContent === "2023")) {
			$(".dpk-previous-button").click();
		}
		cell("2023").click();
		cell("Mar").click();

		assert.ok($(".dpk-ok-btn").disabled);
		cell("3").click();
		assert.ok(!$(".dpk-ok-btn").disabled);
		cell("9").click();
		assert.deepEqual(active(), ["3", "9"]);

		const inRange = Array.from(root().querySelectorAll("td.dpk-in-range")).map((td) => td.textContent);
		assert.deepEqual(inRange, ["4", "5", "6", "7", "8"]);
		assert.ok(cell("3").parentNode.classList.contains("dpk-range-start"));
		assert.ok(cell("9").parentNode.classList.contains("dpk-range-end"));
		assert.equal(header(), "3/03 - 9/03");

		$(".dpk-ok-btn").click();
		assert.equal(input.value, "03/03/2023 - 09/03/2023");
		assert.equal(calls[0][0], "03/03/2023 - 09/03/2023");
		assert.equal(calls[0][1].getDate(), 3);
		assert.equal(calls[0][2].getDate(), 9);
		assert.ok(window);
	});

	test("um clique antes do início muda o início; um terceiro recomeça", () => {
		const { input, cell, active } = setup({
			body: '<input type="text" data-type="datepicker" data-range value="10/03/2023 - 12/03/2023">',
		});
		input.click();
		assert.deepEqual(active(), ["10", "12"]);
		cell("20").click();
		assert.deepEqual(active(), ["20"]);
		cell("5").click();
		assert.deepEqual(active(), ["5"]);
		cell("8").click();
		assert.deepEqual(active(), ["5", "8"]);
	});

	test("passar o rato mostra o intervalo antes do segundo clique", () => {
		const { window, input, root, cell } = setup({
			body: '<input type="text" data-type="datepicker" data-range value="10/03/2023 - 12/03/2023">',
		});
		input.click();
		cell("3").click();
		cell("6").dispatchEvent(new window.MouseEvent("mouseover", { bubbles: true }));
		const inRange = Array.from(root().querySelectorAll("td.dpk-in-range")).map((td) => td.textContent);
		assert.deepEqual(inRange, ["4", "5"]);
		root().querySelector("tbody").dispatchEvent(new window.MouseEvent("mouseleave"));
		assert.equal(root().querySelectorAll("td.dpk-in-range").length, 0);
	});

	test("um intervalo escrito à mão é lido, e ao contrário fica inválido", () => {
		const calls = [];
		const { window, input } = setup({ body, init: (w) => w.datepicker_init((t) => calls.push(t)) });
		type(window, input, "0303202309032023");
		assert.equal(input.value, "03/03/2023 - 09/03/2023");
		commit(window, input, "3/3/2023 - 9/3/2023");
		assert.equal(input.value, "03/03/2023 - 09/03/2023");
		assert.deepEqual(calls, ["03/03/2023 - 09/03/2023"]);

		commit(window, input, "09/03/2023 - 03/03/2023");
		assert.equal(input.getAttribute("aria-invalid"), "true");
	});
});
