import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

export const umdCode = readFileSync(new URL("../build/datepicker.js", import.meta.url), "utf8");
export const cssCode = readFileSync(new URL("../build/datepicker.css", import.meta.url), "utf8");

/**
 * Página nova com o build UMD carregado como <script>, como no browser.
 * `body` é o HTML dos inputs; `init(window)` liga a lib (por omissão, sem opções).
 */
export function setup({ body = '<input type="text" data-type="datepicker">', init, beforeScript } = {}) {
	const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${body}</body></html>`, {
		runScripts: "dangerously",
		pretendToBeVisual: true,
	});
	const { window } = dom;
	if (beforeScript) beforeScript(window);

	const script = window.document.createElement("script");
	script.textContent = umdCode;
	window.document.head.appendChild(script);

	const calendars = init ? init(window) : window.datepicker_init();
	const document = window.document;
	const input = document.querySelector("input");
	const root = () => document.querySelector(".dpk-root");
	const $ = (selector) => root().querySelector(selector);
	const cells = () => Array.from(root().querySelectorAll("tbody .dpk-cell-content"));
	const cell = (text) => {
		const found = cells().find((c) => c.textContent === text);
		assert.ok(found, `célula "${text}" não encontrada`);
		return found;
	};
	const key = (target, k, extra = {}) =>
		target.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));
	const isOpen = () => !!root() && root().classList.contains("dpk-open");
	const heading = () => $(".dpk-view-change-button").textContent;
	const header = () => $(".dpk-date-text").textContent;
	const active = () => cells().filter((c) => c.classList.contains("dpk-active")).map((c) => c.textContent);

	return { window, document, calendars, input, root, $, cells, cell, key, isOpen, heading, header, active };
}

// Tipo de evento que um browser dispara ao escrever no input.
export function type(window, input, value, inputType = "insertText") {
	input.value = value;
	input.setSelectionRange(value.length, value.length);
	input.dispatchEvent(new window.InputEvent("input", { bubbles: true, inputType }));
}

export function commit(window, input, value) {
	input.value = value;
	input.dispatchEvent(new window.Event("change", { bubbles: true }));
}

// Seletores de todas as regras do CSS, a entrar nos @media.
export function cssSelectors(css) {
	const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
	const selectors = [];
	let depth = 0;
	let buffer = "";
	for (const char of clean) {
		if (char === "{") {
			const head = buffer.trim();
			if (!head.startsWith("@")) selectors.push(head);
			depth++;
			buffer = "";
		} else if (char === "}") {
			depth--;
			buffer = "";
		} else if (char === ";") {
			buffer = "";
		} else {
			buffer += char;
		}
	}
	return selectors;
}

// Variáveis --dpk-* do primeiro bloco cujo seletor é exatamente `selector`.
export function cssVariables(css, selector) {
	const start = css.indexOf(`${selector} {`);
	assert.ok(start !== -1, `bloco ${selector} não encontrado`);
	const block = css.slice(start, css.indexOf("}", start));
	const vars = {};
	for (const match of block.matchAll(/(--dpk-[\w-]+):\s*([^;]+);/g)) vars[match[1]] = match[2].trim();
	return vars;
}

function luminance(hex) {
	const value = hex.replace("#", "");
	const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
	const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
}
