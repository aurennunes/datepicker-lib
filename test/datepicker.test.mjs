import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const code = readFileSync(new URL("../build/datepicker.js", import.meta.url), "utf8");

function setup(value = "", onOk) {
	const dom = new JSDOM(
		`<!DOCTYPE html><body><input type="text" data-type="datepicker" value="${value}"></body>`,
		{ runScripts: "dangerously" }
	);
	const { window } = dom;
	const script = window.document.createElement("script");
	script.textContent = code;
	window.document.head.appendChild(script);

	const input = window.document.querySelector("input");
	const [calendar] = window.datepicker_init(onOk);
	const modal = window.document.querySelector(".dpk-modal");
	const $ = (selector) => modal.querySelector(selector);
	const visibleCells = () =>
		Array.from(modal.querySelectorAll("table"))
			.filter((table) => table.style.display !== "none")
			.flatMap((table) => Array.from(table.querySelectorAll(".dpk-cell-content")));
	const clickCell = (text) => {
		const cell = visibleCells().find((c) => c.textContent === text);
		assert.ok(cell, `célula "${text}" não encontrada`);
		cell.click();
	};

	return { window, input, calendar, modal, $, clickCell, visibleCells };
}

test("abre na data do input e confirma no formato dd/mm/aaaa", () => {
	const calls = [];
	const { input, modal, $, clickCell } = setup("05/03/2023", (s, d) => calls.push([s, d]));

	input.click();
	assert.ok(modal.classList.contains("active"));
	assert.equal($(".dpk-view-change-button").textContent, "Março 2023");
	assert.equal($(".dpk-date-text").textContent, "5 de Mar, 2023");

	clickCell("9");
	$(".dpk-ok-btn").click();

	assert.equal(input.value, "09/03/2023");
	assert.ok(!modal.classList.contains("active"));
	assert.equal(calls.length, 1);
	assert.equal(calls[0][0], "09/03/2023");
	assert.equal(calls[0][1].getDate(), 9);
});

test("escolher ano e depois mês volta a desenhar os dias desse mês", () => {
	const { input, $, clickCell, visibleCells } = setup("15/01/2023");

	input.click();
	$(".dpk-view-change-button").click(); // vista de meses
	$(".dpk-view-change-button").click(); // vista de anos
	clickCell("2024");
	assert.equal($(".dpk-view-change-button").textContent, "2024");
	clickCell("Fev");

	assert.equal($(".dpk-view-change-button").textContent, "Fevereiro 2024");
	assert.equal(visibleCells().length, 29); // 2024 é bissexto

	$(".dpk-ok-btn").click();
	assert.equal(input.value, "15/02/2024");
});

test("o dia fica dentro do mês ao navegar", () => {
	const { input, $ } = setup("31/01/2023");

	input.click();
	$(".dpk-next-button").click();
	$(".dpk-ok-btn").click();

	assert.equal(input.value, "28/02/2023");
});

test("navegação entre dezembro e janeiro muda o ano", () => {
	const { input, $ } = setup("10/12/2023");

	input.click();
	$(".dpk-next-button").click();
	assert.equal($(".dpk-view-change-button").textContent, "Janeiro 2024");
	$(".dpk-previous-button").click();
	$(".dpk-previous-button").click();
	assert.equal($(".dpk-view-change-button").textContent, "Novembro 2023");
});

test("cancelar e Escape não mexem no input e repõem a data confirmada", () => {
	const { window, input, modal, $, clickCell } = setup("05/03/2023");

	input.click();
	clickCell("20");
	$(".dpk-cancel-btn").click();
	assert.equal(input.value, "05/03/2023");

	input.click();
	assert.equal($(".dpk-date-text").textContent, "5 de Mar, 2023");
	// Escape com o foco ainda no input também fecha.
	input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	assert.ok(!modal.classList.contains("active"));
});

test("limpar esvazia o input e dispara input e change", () => {
	const { input, $ } = setup("05/03/2023");
	const events = [];
	input.addEventListener("input", () => events.push("input"));
	input.addEventListener("change", () => events.push("change"));

	input.click();
	$(".dpk-clear-btn").click();

	assert.equal(input.value, "");
	assert.deepEqual(events, ["input", "change"]);
});

test("um valor inválido no input abre no dia de hoje", () => {
	const { input, $ } = setup("31/02/2023");
	const today = new Date();

	input.click();
	assert.ok($(".dpk-date-text").textContent.startsWith(`${today.getDate()} de `));
});

test("a paginação de anos não sai do intervalo", () => {
	const { input, $ } = setup("01/01/2023");

	input.click();
	$(".dpk-view-change-button").click();
	$(".dpk-view-change-button").click();
	for (let i = 0; i < 20; i++) $(".dpk-next-button").click();
	const last = $(".dpk-view-change-button").textContent;
	$(".dpk-next-button").click();
	assert.equal($(".dpk-view-change-button").textContent, last);

	for (let i = 0; i < 20; i++) $(".dpk-previous-button").click();
	const first = new Date().getFullYear() - 100;
	assert.ok($(".dpk-view-change-button").textContent.startsWith(`${first} - `));
});

test("inicializar duas vezes não duplica o modal nem o CSS", () => {
	const { window } = setup();

	assert.equal(window.datepicker_init().length, 0);
	assert.equal(window.document.querySelectorAll(".dpk-modal").length, 1);
	assert.equal(window.document.querySelectorAll("#dpk-style").length, 1);
});

test("não deixa regras de CSS globais na página", () => {
	const { window } = setup();
	const css = window.document.getElementById("dpk-style").textContent;

	for (const rule of css.split("}")) {
		const selector = rule.split("{")[0].trim();
		if (!selector) continue;
		for (const part of selector.split(",")) {
			assert.match(part.trim(), /^\.dpk-/, `regra global: ${part.trim()}`);
		}
	}
});

test("destroy remove o modal e liberta o input", () => {
	const { window, input, calendar } = setup();

	calendar.destroy();
	assert.equal(window.document.querySelectorAll(".dpk-modal").length, 0);
	input.click();
	assert.equal(window.datepicker_init().length, 1);
});
