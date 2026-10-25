// Comportamento base (cartão 2), agora sobre o diálogo partilhado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cssCode, cssSelectors, setup } from "./helpers.mjs";

test("abre na data do input e confirma no formato dd/mm/aaaa", () => {
	const calls = [];
	const { window, input, $, cell, isOpen, heading, header } = setup({
		body: '<input type="text" data-type="datepicker" value="05/03/2023">',
		init: (w) => w.datepicker_init((text, date) => calls.push([text, date])),
	});

	input.click();
	assert.ok(isOpen());
	assert.equal(heading(), "Março de 2023");
	assert.equal(header(), "5 de março");

	cell("9").click();
	$(".dpk-ok-btn").click();

	assert.equal(input.value, "09/03/2023");
	assert.ok(!isOpen());
	assert.equal(calls.length, 1);
	assert.equal(calls[0][0], "09/03/2023");
	assert.equal(calls[0][1].getDate(), 9);
	assert.equal(window.document.activeElement, input);
});

test("escolher ano e depois mês volta a desenhar os dias desse mês", () => {
	const { input, $, cell, cells, heading } = setup({
		body: '<input type="text" data-type="datepicker" value="15/01/2023">',
	});

	input.click();
	$(".dpk-view-change-button").click();
	$(".dpk-view-change-button").click();
	cell("2024").click();
	assert.equal(heading(), "2024");
	cell("Fev").click();

	assert.equal(heading(), "Fevereiro de 2024");
	assert.equal(cells().length, 29);

	$(".dpk-ok-btn").click();
	assert.equal(input.value, "15/02/2024");
});

test("o dia fica dentro do mês ao navegar", () => {
	const { input, $ } = setup({ body: '<input type="text" data-type="datepicker" value="31/01/2023">' });

	input.click();
	$(".dpk-next-button").click();
	$(".dpk-ok-btn").click();
	assert.equal(input.value, "28/02/2023");
});

test("navegação entre dezembro e janeiro muda o ano", () => {
	const { input, $, heading } = setup({ body: '<input type="text" data-type="datepicker" value="10/12/2023">' });

	input.click();
	$(".dpk-next-button").click();
	assert.equal(heading(), "Janeiro de 2024");
	$(".dpk-previous-button").click();
	$(".dpk-previous-button").click();
	assert.equal(heading(), "Novembro de 2023");
});

test("cancelar e Escape não mexem no input e repõem a data confirmada", () => {
	const { input, $, cell, key, isOpen, header } = setup({
		body: '<input type="text" data-type="datepicker" value="05/03/2023">',
	});

	input.click();
	cell("20").click();
	$(".dpk-cancel-btn").click();
	assert.equal(input.value, "05/03/2023");

	input.click();
	assert.equal(header(), "5 de março");
	key(input, "Escape");
	assert.ok(!isOpen());
});

test("clicar fora do calendário cancela", () => {
	const { input, root, isOpen } = setup();
	input.click();
	root().querySelector(".dpk-backdrop").click();
	assert.ok(!isOpen());
	assert.equal(input.value, "");
});

test("limpar esvazia o input e dispara input e change", () => {
	const { input, $ } = setup({ body: '<input type="text" data-type="datepicker" value="05/03/2023">' });
	const events = [];
	input.addEventListener("input", () => events.push("input"));
	input.addEventListener("change", () => events.push("change"));

	input.click();
	$(".dpk-clear-btn").click();

	assert.equal(input.value, "");
	assert.deepEqual(events, ["input", "change"]);
});

test("um valor inválido no input abre no dia de hoje", () => {
	const { input, header } = setup({ body: '<input type="text" data-type="datepicker" value="31/02/2023">' });
	input.click();
	assert.ok(header().startsWith(`${new Date().getDate()} de `));
});

test("a paginação de anos não sai do intervalo", () => {
	const { input, $, heading } = setup({ body: '<input type="text" data-type="datepicker" value="01/01/2023">' });

	input.click();
	$(".dpk-view-change-button").click();
	$(".dpk-view-change-button").click();
	for (let i = 0; i < 20; i++) $(".dpk-next-button").click();
	const last = heading();
	assert.ok($(".dpk-next-button").disabled);
	$(".dpk-next-button").click();
	assert.equal(heading(), last);

	for (let i = 0; i < 20; i++) $(".dpk-previous-button").click();
	assert.ok(heading().startsWith(`${new Date().getFullYear() - 100} - `));
	assert.ok($(".dpk-previous-button").disabled);
});

test("inicializar duas vezes não cria outro calendário nem outro CSS", () => {
	const { window, input } = setup();
	assert.equal(window.datepicker_init().length, 0);
	input.click();
	assert.equal(window.document.querySelectorAll(".dpk-root").length, 1);
	assert.equal(window.document.querySelectorAll("#dpk-style").length, 1);
});

test("não deixa regras de CSS globais na página", () => {
	const selectors = cssSelectors(cssCode);
	assert.ok(selectors.length > 50);
	for (const selector of selectors) {
		for (const part of selector.split(",")) {
			assert.match(part.trim(), /^\.dpk-/, `regra global: ${part.trim()}`);
		}
	}
});

test("destroy liberta o input, e o último destroy tira o diálogo", () => {
	const { window, input, calendars } = setup();

	input.click();
	calendars[0].destroy();
	assert.equal(window.document.querySelectorAll(".dpk-root").length, 0);
	assert.equal(window.datepicker_init().length, 1);
});
