import { Calendar } from "./calendar";
import type { DatepickerOptions, OnOk } from "./options";

export { Calendar };
export { formatDate, formatRange, parseDate, parseRange } from "./dates";
export type { Labels } from "./locale";
export type { DatepickerOptions, Display, OnOk, Theme } from "./options";

/**
 * Liga o calendário aos inputs.
 *
 * - `datepicker_init()` liga todos os `input[data-type="datepicker"]`.
 * - `datepicker_init(opções, alvo)`: `alvo` é um input ou um seletor CSS.
 * - `datepicker_init(onOk, input)`: a forma antiga continua a funcionar.
 *
 * Inputs já ligados são saltados. Devolve os calendários criados.
 */
export function datepicker_init(
	options?: DatepickerOptions | OnOk,
	target?: HTMLInputElement | string
): Calendar[] {
	const legacy = typeof options === "function";
	const resolved: DatepickerOptions = legacy
		? { onOk: options as OnOk }
		: (options as DatepickerOptions | undefined) || {};

	let inputs: Element[];
	if (target === undefined) {
		inputs = Array.prototype.slice.call(
			document.querySelectorAll('input[data-type="datepicker"]')
		);
	} else if (typeof target === "string") {
		inputs = Array.prototype.slice.call(document.querySelectorAll(target));
	} else {
		inputs = [target];
	}

	const calendars: Calendar[] = [];

	inputs.forEach((element) => {
		if (element.tagName !== "INPUT") return;
		const input = element as HTMLInputElement;
		// Na forma antiga, um input passado à mão também precisava do data-type.
		if (legacy && input.getAttribute("data-type") !== "datepicker") return;
		if (input.hasAttribute("data-dpk-ready")) return;
		try {
			calendars.push(new Calendar(input, resolved));
			input.setAttribute("data-dpk-ready", "");
		} catch (err) {
			console.error(err);
		}
	});

	return calendars;
}
