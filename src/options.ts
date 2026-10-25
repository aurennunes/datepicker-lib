import { DEFAULT_FORMAT, parseDate, parseIso, startOfDay, validateFormat } from "./dates";
import { firstDayOfWeek, Labels, labelsFor } from "./locale";

export type Display = "auto" | "popover" | "sheet" | "modal";
export type Theme = "auto" | "light" | "dark";

/** `value` é a data escolhida, ou o início do intervalo; `end` só existe com `range`. */
export type OnOk = (text: string, value: Date, end?: Date) => void;

export interface DatepickerOptions {
	/** Chamada quando a data é confirmada (Ok, ou escrita à mão e válida). */
	onOk?: OnOk;
	/** Primeiro dia que se pode escolher: `Date`, texto no `format`, ou `aaaa-mm-dd`. */
	min?: Date | string;
	/** Último dia que se pode escolher. */
	max?: Date | string;
	/** Dias da semana bloqueados, 0 = domingo (ex.: `[0, 6]` para fins de semana). */
	disabledDays?: number[];
	/** Bloqueio livre: devolve `true` para os dias que não se podem escolher. */
	isDisabled?: (date: Date) => boolean;
	/** Idioma do `Intl` (por omissão `pt-PT`). */
	locale?: string;
	/** Textos da interface, por cima dos do idioma. */
	labels?: Partial<Labels>;
	/** 0 = domingo ... 6 = sábado. Por omissão vem do idioma. */
	firstDayOfWeek?: number;
	/** Padrão com `dd`, `mm` e `aaaa` (ou `yyyy`). Por omissão `dd/mm/aaaa`. */
	format?: string;
	/** Máscara enquanto se escreve no input (por omissão `true`). */
	mask?: boolean;
	/** Escolher um intervalo (início e fim) em vez de uma data. */
	range?: boolean;
	/** `auto` (folha em ecrãs estreitos, popover nos largos), `popover`, `sheet` ou `modal`. */
	display?: Display;
	/** `auto` segue o sistema; `light` e `dark` forçam. */
	theme?: Theme;
	/** Injeta o CSS num `<style>` (por omissão `true`). Com `false`, use `datepicker.css`. */
	injectStyles?: boolean;
	/** `nonce` do `<style>` injetado, para CSP com nonce. */
	styleNonce?: string;
}

export interface ResolvedOptions {
	onOk?: OnOk;
	min: Date | null;
	max: Date | null;
	disabledDays: number[];
	isDisabled?: (date: Date) => boolean;
	locale: string;
	labels: Labels;
	firstDayOfWeek: number;
	format: string;
	mask: boolean;
	range: boolean;
	display: Display;
	theme: Theme;
	injectStyles: boolean;
	styleNonce?: string;
}

const DISPLAYS: Display[] = ["auto", "popover", "sheet", "modal"];
const THEMES: Theme[] = ["auto", "light", "dark"];

function toDate(value: Date | string | undefined | null, format: string): Date | null {
	if (value === undefined || value === null || value === "") return null;
	if (value instanceof Date) {
		return isNaN(value.getTime()) ? null : startOfDay(value);
	}
	const date = parseDate(value, format) || parseIso(value);
	if (!date) throw new Error(`Data inválida nas opções: "${value}"`);
	return date;
}

function toBoolean(value: string | null): boolean | undefined {
	if (value === null) return undefined;
	return value === "" || value === "true" || value === "1";
}

function pick<T extends string>(value: string | null | undefined, allowed: T[]): T | undefined {
	return value && allowed.indexOf(value as T) !== -1 ? (value as T) : undefined;
}

// Os atributos data-* do input ganham às opções passadas ao init.
export function resolveOptions(
	input: HTMLInputElement,
	options: DatepickerOptions
): ResolvedOptions {
	const data = (name: string) => input.getAttribute(`data-${name}`);

	const locale = data("locale") || options.locale || "pt-PT";
	const format = data("format") || options.format || DEFAULT_FORMAT;
	validateFormat(format);

	const firstDayAttr = data("first-day");
	const firstDay =
		firstDayAttr !== null && firstDayAttr !== ""
			? Number(firstDayAttr)
			: options.firstDayOfWeek !== undefined
			? options.firstDayOfWeek
			: firstDayOfWeek(locale);

	const disabledAttr = data("disabled-days");
	const disabledDays =
		disabledAttr !== null
			? disabledAttr
					.split(",")
					.map((day) => day.trim())
					.filter((day) => day !== "")
					.map(Number)
			: options.disabledDays || [];

	const min = toDate(data("min") || options.min, format);
	const max = toDate(data("max") || options.max, format);
	if (min && max && min.getTime() > max.getTime()) {
		throw new Error("A opção min é posterior à opção max.");
	}

	const range = toBoolean(data("range"));
	const mask = toBoolean(data("mask"));

	return {
		onOk: options.onOk,
		min,
		max,
		disabledDays,
		isDisabled: options.isDisabled,
		locale,
		labels: labelsFor(locale, options.labels),
		firstDayOfWeek: ((firstDay % 7) + 7) % 7,
		format,
		mask: mask !== undefined ? mask : options.mask !== false,
		range: range !== undefined ? range : !!options.range,
		display: pick(data("display"), DISPLAYS) || options.display || "auto",
		theme: pick(data("theme"), THEMES) || options.theme || "auto",
		injectStyles: options.injectStyles !== false,
		styleNonce: options.styleNonce,
	};
}
