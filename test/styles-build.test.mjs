// Cartões 11, 12, 14, 17 e 18: contraste, temas, movimento, CSS à parte e build.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { contrast, cssCode, cssVariables, setup } from "./helpers.mjs";

const light = cssVariables(cssCode, ".dpk-root");
const dark = cssVariables(cssCode, '.dpk-root[data-theme="dark"]');

describe("cartão 11: contraste WCAG AA", () => {
	// Pares de texto que aparecem no calendário: [texto, fundo, onde].
	const pairs = [
		["--dpk-on-primary", "--dpk-primary", "cabeçalho e dia escolhido"],
		["--dpk-primary", "--dpk-surface", "botões do rodapé"],
		["--dpk-on-surface", "--dpk-surface", "dias"],
		["--dpk-muted", "--dpk-surface", "dias da semana, mês e setas"],
		["--dpk-on-surface", "--dpk-range", "dias dentro do intervalo"],
	];

	for (const [name, theme] of [["claro", light], ["escuro", dark]]) {
		test(`tema ${name}: todos os pares de texto a 4,5:1 ou mais`, () => {
			for (const [text, background, where] of pairs) {
				const ratio = contrast(theme[text], theme[background]);
				assert.ok(ratio >= 4.5, `${where} (${text} sobre ${background}): ${ratio.toFixed(2)}:1`);
			}
		});
	}

	test("o azul antigo (#2979ff) falhava, e é por isso que mudou", () => {
		assert.ok(contrast("#2979ff", "#ffffff") < 4.5);
	});
});

describe("cartão 12: temas", () => {
	test("as cores vêm todas de variáveis --dpk-*", () => {
		for (const name of ["--dpk-primary", "--dpk-surface", "--dpk-radius", "--dpk-font", "--dpk-shadow"]) {
			assert.ok(light[name], `falta ${name}`);
		}
		const rules = cssCode.slice(cssCode.indexOf(".dpk-root {", cssCode.indexOf("@media (prefers-color-scheme")));
		assert.ok(!/#[0-9a-f]{3,6}/i.test(rules.replace(/\.dpk-invalid[\s\S]*?\}/, "")), "cor fixa fora das variáveis");
	});

	test("o modo escuro segue o sistema, salvo theme: light", () => {
		const media = cssCode.indexOf("@media (prefers-color-scheme: dark)");
		assert.ok(media !== -1);
		assert.ok(cssCode.indexOf('.dpk-root:not([data-theme="light"])', media) !== -1);
		// O bloco do sistema tem de ser igual ao do data-theme="dark", que se vê a
		// funcionar no browser: se um mudar sem o outro, este teste apanha.
		const system = cssVariables(cssCode.slice(media), '.dpk-root:not([data-theme="light"])');
		assert.deepEqual(system, dark);
	});

	test("theme e data-theme chegam ao diálogo", () => {
		const env = setup({
			body: '<input id="a" type="text" data-type="datepicker"><input id="b" type="text" data-type="datepicker" data-theme="light"><input id="c" type="text" data-type="datepicker" data-theme="auto">',
			init: (w) => w.datepicker_init({ theme: "dark" }),
		});
		const open = (id) => {
			env.document.getElementById(id).click();
			const theme = env.root().getAttribute("data-theme");
			env.$(".dpk-cancel-btn").click();
			return theme;
		};
		assert.equal(open("a"), "dark");
		assert.equal(open("b"), "light");
		assert.equal(open("c"), null);
	});
});

describe("cartão 14: prefers-reduced-motion", () => {
	test("com movimento reduzido não há transições", () => {
		const start = cssCode.indexOf("@media (prefers-reduced-motion: reduce)");
		assert.ok(start !== -1);
		const block = cssCode.slice(start);
		for (const selector of [".dpk-root", ".dpk-backdrop", ".dpk-container"]) {
			assert.ok(block.includes(selector), `falta ${selector}`);
		}
		assert.match(block, /transition:\s*none\s*!important/);
	});
});

describe("cartão 17: CSS à parte", () => {
	test("injectStyles: false não injeta <style>, e o nonce chega ao <style>", () => {
		const off = setup({ init: (w) => w.datepicker_init({ injectStyles: false }) });
		off.input.click();
		assert.equal(off.document.getElementById("dpk-style"), null);
		assert.ok(off.root());

		const nonce = setup({ init: (w) => w.datepicker_init({ styleNonce: "abc123" }) });
		assert.equal(nonce.document.getElementById("dpk-style").getAttribute("nonce"), "abc123");
	});

	test("o build publica o CSS normal e o minificado, e o JS leva o mesmo CSS", () => {
		const src = readFileSync(new URL("../src/datepicker.css", import.meta.url), "utf8");
		assert.equal(cssCode, src);
		const min = readFileSync(new URL("../build/datepicker.min.css", import.meta.url), "utf8").trim();
		assert.ok(min.length < src.length);
		assert.ok(!min.includes("\n") && !min.includes("/*"), "o .min.css tem quebras ou comentários");

		const env = setup();
		assert.equal(env.document.getElementById("dpk-style").textContent, min);
	});
});

describe("cartão 18: build", () => {
	test("o ESM importa-se sem DOM e exporta a API", async () => {
		const lib = await import("../build/datepicker.mjs");
		assert.equal(typeof lib.datepicker_init, "function");
		assert.equal(typeof lib.Calendar, "function");
		assert.equal(lib.formatDate(lib.parseDate("5/3/2023")), "05/03/2023");
		assert.equal(lib.formatDate(new Date(2023, 2, 5), "yyyy-mm-dd"), "2023-03-05");
		assert.equal(lib.parseDate("31/02/2023"), null);
		const range = lib.parseRange("03/03/2023 - 09/03/2023", "dd/mm/aaaa");
		assert.equal(lib.formatRange(range.start, range.end, "dd/mm/aaaa"), "03/03/2023 - 09/03/2023");
		assert.equal(lib.Calendar.formatDate(new Date(2023, 0, 9)), "09/01/2023");
	});

	test("o UMD serve CommonJS, e os globais antigos continuam no browser", () => {
		const require = createRequire(import.meta.url);
		const cjs = require("../build/datepicker.js");
		assert.equal(typeof cjs.datepicker_init, "function");
		const min = require("../build/datepicker.min.js");
		assert.equal(typeof min.Calendar, "function");

		const env = setup();
		assert.equal(typeof env.window.datepicker_init, "function");
		assert.equal(typeof env.window.Calendar, "function");
		assert.equal(typeof env.window.DatepickerLib.parseDate, "function");
		for (const leak of ["parseDate", "formatDate", "View", "pad"]) assert.ok(!(leak in env.window), `global a mais: ${leak}`);
	});

	test("o minificado funciona igual no browser", () => {
		const env = setup({ init: () => [] });
		const script = env.document.createElement("script");
		script.textContent = readFileSync(new URL("../build/datepicker.min.js", import.meta.url), "utf8");
		env.document.head.appendChild(script);
		env.window.datepicker_init();
		env.input.value = "05/03/2023";
		env.input.click();
		assert.equal(env.heading(), "Março de 2023");
	});

	test("package.json aponta para ficheiros que existem, com tipos", () => {
		const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
		const files = [pkg.main, pkg.module, pkg.types, pkg.unpkg, ...Object.values(pkg.exports["."]), pkg.exports["./datepicker.css"]];
		for (const file of files) assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `não existe: ${file}`);
		const types = readFileSync(new URL("../build/types/index.d.ts", import.meta.url), "utf8");
		assert.match(types, /datepicker_init/);
		assert.match(types, /DatepickerOptions/);
	});
});
