// Cartões 9, 10, 13, 15 e 16: teclado, foco, apresentação, diálogo partilhado e render.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { setup } from "./helpers.mjs";

const focused = (env) => env.document.activeElement;
const tabbable = (env) => env.cells().filter((c) => c.tabIndex === 0).map((c) => c.textContent);

describe("cartão 9: setas dentro da grelha", () => {
	const body = '<input type="text" data-type="datepicker" value="15/03/2023">';

	test("só uma célula entra no Tab, e o foco abre no dia escolhido", () => {
		const env = setup({ body });
		env.input.click();
		assert.equal(env.root().querySelector("table").getAttribute("role"), "grid");
		assert.deepEqual(tabbable(env), ["15"]);
		assert.equal(focused(env).textContent, "15");
		assert.equal(focused(env).parentNode.getAttribute("aria-selected"), "true");
	});

	test("setas, Home e End mudam o dia; Enter e Ok confirmam", () => {
		const env = setup({ body });
		env.input.click();
		const press = (k, extra) => env.key(focused(env), k, extra);

		press("ArrowRight");
		assert.equal(focused(env).textContent, "16");
		press("ArrowDown");
		assert.equal(focused(env).textContent, "23");
		press("ArrowUp");
		press("ArrowLeft");
		assert.equal(focused(env).textContent, "15");
		// 15/03/2023 é quarta; com a semana ao domingo, Home vai a 12 e End a 18.
		press("Home");
		assert.equal(focused(env).textContent, "12");
		press("End");
		assert.equal(focused(env).textContent, "18");
		assert.deepEqual(tabbable(env), ["18"]);

		focused(env).click();
		env.$(".dpk-ok-btn").click();
		assert.equal(env.input.value, "18/03/2023");
	});

	test("PageUp e PageDown mudam o mês, e com Shift o ano", () => {
		const env = setup({ body });
		env.input.click();
		env.key(focused(env), "PageDown");
		assert.equal(env.heading(), "Abril de 2023");
		assert.equal(focused(env).textContent, "15");
		env.key(focused(env), "PageDown", { shiftKey: true });
		assert.equal(env.heading(), "Abril de 2024");
		env.key(focused(env), "PageUp");
		assert.equal(env.heading(), "Março de 2024");
		// Atravessar o mês com as setas também muda a grelha.
		env.key(focused(env), "ArrowDown");
		env.key(focused(env), "ArrowDown");
		env.key(focused(env), "ArrowDown");
		assert.equal(env.heading(), "Abril de 2024");
		assert.equal(focused(env).textContent, "5");
	});

	test("setas na grelha de meses e na de anos, a atravessar páginas", () => {
		const env = setup({ body });
		env.input.click();
		const intoGrid = () => env.root().querySelector('tbody [tabindex="0"]').focus();
		env.$(".dpk-view-change-button").click();
		intoGrid();
		assert.equal(focused(env).textContent, "Mar");
		env.key(focused(env), "ArrowDown");
		assert.equal(focused(env).textContent, "Jul");
		env.key(focused(env), "ArrowRight");
		env.key(focused(env), "Enter");
		focused(env).click();
		assert.equal(env.heading(), "Agosto de 2023");

		env.$(".dpk-view-change-button").click();
		env.$(".dpk-view-change-button").click();
		intoGrid();
		assert.equal(focused(env).textContent, "2023");
		const page = env.heading();
		for (let i = 0; i < 6; i++) env.key(focused(env), "ArrowDown");
		assert.equal(focused(env).textContent, "2047");
		assert.notEqual(env.heading(), page);
		focused(env).click();
		assert.equal(env.heading(), "2047");
	});

	test("as setas não passam do min e do max", () => {
		const env = setup({
			body: '<input type="text" data-type="datepicker" value="11/03/2023" data-min="10/03/2023" data-max="12/03/2023">',
		});
		env.input.click();
		env.key(focused(env), "ArrowUp");
		assert.equal(focused(env).textContent, "10");
		env.key(focused(env), "PageDown");
		assert.equal(focused(env).textContent, "12");
		assert.equal(env.heading(), "Março de 2023");
	});
});

describe("cartão 10: foco preso no diálogo", () => {
	test("Tab no último volta ao primeiro, Shift+Tab no primeiro vai ao último", () => {
		const env = setup({ body: '<button id="fora">fora</button><input type="text" data-type="datepicker" value="15/03/2023">' });
		env.input.click();
		const ok = env.$(".dpk-ok-btn");
		const change = env.$(".dpk-view-change-button");

		ok.focus();
		env.key(ok, "Tab");
		assert.equal(focused(env), change);
		env.key(change, "Tab", { shiftKey: true });
		assert.equal(focused(env), ok);

		// Com o foco fora do diálogo (por exemplo, numa página que o roubou), o Tab devolve-o.
		env.document.getElementById("fora").focus();
		env.key(env.document.getElementById("fora"), "Tab");
		assert.ok(env.root().contains(focused(env)));
	});

	test("botões desligados e células fora do roving não contam", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker" value="15/03/2023" data-max="20/03/2023">' });
		env.input.click();
		const view = env.$(".dpk-next-button");
		assert.ok(view.disabled);
		const tabs = Array.from(env.root().querySelectorAll("button")).filter((b) => !b.disabled && b.tabIndex !== -1);
		assert.equal(tabs.filter((b) => b.classList.contains("dpk-cell-content")).length, 1);
		assert.ok(!tabs.includes(view));
	});
});

describe("cartão 13: apresentação", () => {
	test("auto é popover nos ecrãs largos e folha nos estreitos", () => {
		const wide = setup();
		wide.input.click();
		assert.equal(wide.root().getAttribute("data-display"), "popover");

		const narrow = setup({
			beforeScript: (w) => {
				w.matchMedia = (query) => ({ matches: query === "(max-width: 599px)", media: query });
			},
		});
		narrow.input.click();
		assert.equal(narrow.root().getAttribute("data-display"), "sheet");
		assert.equal(narrow.$(".dpk-container").style.top, "");
	});

	test("display e data-display forçam o modo", () => {
		const env = setup({
			body: '<input id="a" type="text" data-type="datepicker"><input id="b" type="text" data-type="datepicker" data-display="sheet">',
			init: (w) => w.datepicker_init({ display: "modal" }),
		});
		env.document.getElementById("a").click();
		assert.equal(env.root().getAttribute("data-display"), "modal");
		env.$(".dpk-cancel-btn").click();
		env.document.getElementById("b").click();
		assert.equal(env.root().getAttribute("data-display"), "sheet");
	});

	test("o popover cola-se ao input, vira para cima se não couber e não sai do ecrã", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker">' });
		const container = () => env.$(".dpk-container");
		const rect = (top, left) => () => ({ top, bottom: top + 20, left, right: left + 150, width: 150, height: 20 });

		env.input.getBoundingClientRect = rect(100, 50);
		env.input.click();
		Object.defineProperty(container(), "offsetHeight", { value: 400, configurable: true });
		Object.defineProperty(container(), "offsetWidth", { value: 328, configurable: true });
		env.window.dispatchEvent(new env.window.Event("resize"));
		assert.equal(container().style.top, "126px"); // 100 + 20 + 6
		assert.equal(container().style.left, "50px");

		// Perto do fundo (janela de 768px): abre por cima. Perto da direita: encosta à margem.
		env.input.getBoundingClientRect = rect(700, 900);
		env.window.dispatchEvent(new env.window.Event("scroll"));
		assert.equal(container().style.top, "294px"); // 700 - 6 - 400
		assert.equal(container().style.left, `${1024 - 328 - 8}px`);
		assert.equal(container().style.maxHeight, "");

		// Não cabe de lado nenhum (janela de 768px, calendário de 500px): fica por
		// baixo, onde há mais espaço, e encolhe em vez de tapar o input.
		Object.defineProperty(container(), "offsetHeight", { value: 500, configurable: true });
		env.input.getBoundingClientRect = rect(300, 50);
		env.window.dispatchEvent(new env.window.Event("scroll"));
		assert.equal(container().style.top, "326px");
		assert.equal(container().style.maxHeight, `${768 - 8 - 326}px`);

		// Mais espaço por cima: encosta ao topo e acaba antes do input.
		env.input.getBoundingClientRect = rect(500, 50);
		env.window.dispatchEvent(new env.window.Event("scroll"));
		assert.equal(container().style.top, "8px");
		assert.equal(container().style.maxHeight, `${500 - 6 - 8}px`);
	});
	test("fechar com o dedo devolve o foco sem abrir o teclado do telemóvel", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker">' });
		const tap = (target, pointerType) => {
			const event = new env.window.Event("pointerdown", { bubbles: true });
			event.pointerType = pointerType;
			target.dispatchEvent(event);
			target.click();
		};

		// Com o dedo: o foco volta ao input, mas com inputmode="none" até sair dele.
		env.input.click();
		tap(env.cell("17"), "touch");
		tap(env.$(".dpk-ok-btn"), "touch");
		assert.equal(env.input.value.slice(0, 2), "17");
		assert.equal(focused(env), env.input);
		assert.equal(env.input.getAttribute("inputmode"), "none");
		env.input.blur();
		assert.equal(env.input.getAttribute("inputmode"), "numeric");

		// Com o rato, ou só com o teclado, o input fica como estava.
		env.input.click();
		tap(env.$(".dpk-cancel-btn"), "mouse");
		assert.equal(focused(env), env.input);
		assert.equal(env.input.getAttribute("inputmode"), "numeric");
		env.input.click();
		env.key(focused(env), "Escape");
		assert.equal(env.input.getAttribute("inputmode"), "numeric");
	});
});

describe("cartão 15: um só diálogo", () => {
	const twenty = Array.from({ length: 20 }, (_, i) => {
		const day = String(i + 1).padStart(2, "0");
		return `<input type="text" data-type="datepicker" value="${day}/03/2023">`;
	}).join("");

	test("20 inputs, um diálogo, criado só ao primeiro open", () => {
		const env = setup({ body: twenty });
		assert.equal(env.calendars.length, 20);
		assert.equal(env.document.querySelectorAll(".dpk-root").length, 0);

		const inputs = env.document.querySelectorAll("input");
		inputs[4].click();
		assert.equal(env.header(), "5 de março");
		env.$(".dpk-cancel-btn").click();
		inputs[16].click();
		assert.equal(env.header(), "17 de março");
		assert.equal(env.document.querySelectorAll(".dpk-root").length, 1);
	});

	test("cada input guarda as suas opções no mesmo diálogo", () => {
		const env = setup({
			body: '<input id="pt" type="text" data-type="datepicker" value="05/03/2023"><input id="en" type="text" data-type="datepicker" data-locale="en-US" data-range value="05/03/2023 - 07/03/2023">',
		});
		env.document.getElementById("en").click();
		assert.equal(env.heading(), "March 2023");
		assert.deepEqual(env.active(), ["5", "7"]);
		env.$(".dpk-cancel-btn").click();
		env.document.getElementById("pt").click();
		assert.equal(env.heading(), "Março de 2023");
		assert.deepEqual(env.active(), ["5"]);
	});

	test("abrir outro input enquanto um está aberto fecha o primeiro sem confirmar", () => {
		const env = setup({
			body: '<input id="a" type="text" data-type="datepicker" value="05/03/2023"><input id="b" type="text" data-type="datepicker" value="06/03/2023">',
		});
		const a = env.document.getElementById("a");
		a.click();
		env.cell("20").click();
		env.calendars[1].open();
		assert.ok(!env.calendars[0].isOpen());
		assert.ok(env.calendars[1].isOpen());
		assert.equal(a.value, "05/03/2023");
	});

	test("o diálogo só sai do DOM quando o último calendário é destruído", () => {
		const env = setup({ body: twenty });
		env.document.querySelector("input").click();
		env.calendars.slice(0, 19).forEach((c) => c.destroy());
		assert.equal(env.document.querySelectorAll(".dpk-root").length, 1);
		env.calendars[19].destroy();
		assert.equal(env.document.querySelectorAll(".dpk-root").length, 0);
	});
});

describe("cartão 16: delegação e render", () => {
	test("andar com as setas no mesmo mês não cria elementos novos", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker" value="15/03/2023">' });
		env.input.click();
		const before = env.cells();
		for (const k of ["ArrowRight", "ArrowDown", "ArrowLeft", "Home", "End"]) env.key(focused(env), k);
		const after = env.cells();
		assert.equal(after.length, before.length);
		assert.ok(after.every((c, i) => c === before[i]));
		assert.equal(focused(env), before[24]); // 25 de março
	});

	test("mudar de mês refaz a grelha", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker" value="15/03/2023">' });
		env.input.click();
		const before = env.cells()[0];
		env.$(".dpk-next-button").click();
		assert.notEqual(env.cells()[0], before);
	});

	test("as células não têm listeners próprios: os cliques chegam pela tabela", () => {
		const env = setup({ body: '<input type="text" data-type="datepicker" value="15/03/2023">' });
		env.input.click();
		// Uma célula clonada (sem listeners copiados) continua a funcionar, porque
		// quem ouve é o tbody.
		const original = env.cell("20");
		const clone = original.cloneNode(true);
		original.parentNode.replaceChild(clone, original);
		clone.click();
		assert.deepEqual(env.active(), ["20"]);
	});
});
