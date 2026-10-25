export const DEFAULT_FORMAT = "dd/mm/aaaa";
export const RANGE_SEPARATOR = " - ";

type Field = { kind: "day" | "month" | "year"; size: number };
type Part = Field | { kind: "literal"; text: string };

const partsCache: { [pattern: string]: Part[] } = {};

// Parte um padrão como "dd/mm/aaaa" em campos e literais. Aceita "yyyy" como
// sinónimo de "aaaa". Não valida: o mesmo padrão serve para intervalos.
function compileParts(pattern: string): Part[] {
	const cached = partsCache[pattern];
	if (cached) return cached;

	const parts: Part[] = [];
	const token = /dd|mm|aaaa|yyyy/g;
	let last = 0;
	let match: RegExpExecArray | null;

	while ((match = token.exec(pattern))) {
		if (match.index > last) {
			parts.push({ kind: "literal", text: pattern.slice(last, match.index) });
		}
		if (match[0] === "dd") parts.push({ kind: "day", size: 2 });
		else if (match[0] === "mm") parts.push({ kind: "month", size: 2 });
		else parts.push({ kind: "year", size: 4 });
		last = token.lastIndex;
	}
	if (last < pattern.length) {
		parts.push({ kind: "literal", text: pattern.slice(last) });
	}

	partsCache[pattern] = parts;
	return parts;
}

function compileFormat(format: string): Part[] {
	const parts = compileParts(format);
	const kinds = parts
		.filter((part) => part.kind !== "literal")
		.map((part) => part.kind)
		.sort()
		.join(",");

	if (kinds !== "day,month,year") {
		throw new Error(
			`Formato de data inválido: "${format}". Use dd, mm e aaaa (ou yyyy) uma vez cada.`
		);
	}
	return parts;
}

export function validateFormat(format: string): void {
	compileFormat(format);
}

function pad(value: number, size: number): string {
	let text = `${value}`;
	while (text.length < size) text = `0${text}`;
	return text;
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createDate(year: number, month: number, day: number): Date {
	const date = new Date(2000, 0, 1);
	date.setFullYear(year, month, day);
	date.setHours(0, 0, 0, 0);
	return date;
}

export function startOfDay(date: Date): Date {
	return createDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysInMonth(month: number, year: number): number {
	return createDate(year, month + 1, 0).getDate();
}

export function sameDay(a: Date | null, b: Date | null): boolean {
	return (
		!!a &&
		!!b &&
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function compareDay(a: Date, b: Date): number {
	return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function addDays(date: Date, days: number): Date {
	return createDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Soma meses mantendo o dia dentro do mês de destino (31/01 + 1 mês = 28/02).
export function addMonths(date: Date, months: number): Date {
	const target = createDate(date.getFullYear(), date.getMonth() + months, 1);
	const day = Math.min(
		date.getDate(),
		daysInMonth(target.getMonth(), target.getFullYear())
	);
	return createDate(target.getFullYear(), target.getMonth(), day);
}

export function isoKey(date: Date): string {
	return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(
		date.getDate(),
		2
	)}`;
}

export function parseIso(text: string): Date | null {
	const match = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(text);
	if (!match) return null;
	return checked(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function checked(year: number, month: number, day: number): Date | null {
	const date = createDate(year, month, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month ||
		date.getDate() !== day
	) {
		return null;
	}
	return date;
}

export function formatDate(date: Date, format: string = DEFAULT_FORMAT): string {
	return compileFormat(format)
		.map((part) => {
			if (part.kind === "literal") return part.text;
			if (part.kind === "day") return pad(date.getDate(), 2);
			if (part.kind === "month") return pad(date.getMonth() + 1, 2);
			return pad(date.getFullYear(), 4);
		})
		.join("");
}

// Aceita o dia e o mês com um ou dois dígitos ("5/3/2023" e "05/03/2023");
// devolve null para tudo o resto, incluindo datas que não existem (31/02).
export function parseDate(text: string, format: string = DEFAULT_FORMAT): Date | null {
	const parts = compileFormat(format);
	const order: Field["kind"][] = [];
	const source = parts
		.map((part) => {
			if (part.kind === "literal") return escapeRegExp(part.text);
			order.push(part.kind);
			return part.kind === "year" ? "(\\d{4})" : "(\\d{1,2})";
		})
		.join("");

	const match = new RegExp(`^\\s*${source}\\s*$`).exec(text);
	if (!match) return null;

	const values: { [kind: string]: number } = {};
	order.forEach((kind, index) => (values[kind] = Number(match[index + 1])));
	return checked(values.year, values.month - 1, values.day);
}

export function formatRange(start: Date, end: Date, format: string): string {
	return `${formatDate(start, format)}${RANGE_SEPARATOR}${formatDate(end, format)}`;
}

export function parseRange(
	text: string,
	format: string
): { start: Date; end: Date } | null {
	const pieces = text.split(/\s+-\s+/);
	if (pieces.length !== 2) return null;

	const start = parseDate(pieces[0], format);
	const end = parseDate(pieces[1], format);
	if (!start || !end || compareDay(start, end) > 0) return null;
	return { start, end };
}

// Máscara enquanto se escreve. Os dígitos enchem os campos do padrão; um
// separador escrito fecha o campo em curso, por isso "5/3/2023" fica como
// está e "05032023" passa a "05/03/2023". Não acrescenta o separador final
// sozinho: só quando quem escreve o pôs, ou quando já há dígito a seguir.
export function maskText(text: string, pattern: string): string {
	const parts = compileParts(pattern);
	const fields: number[] = [];
	parts.forEach((part, index) => {
		if (part.kind !== "literal") fields.push(index);
	});

	const values: string[] = [];
	let buffer = "";
	let separatorTyped = false;

	for (let i = 0; i < text.length && values.length < fields.length; i++) {
		const char = text.charAt(i);
		const size = (parts[fields[values.length]] as Field).size;

		if (char >= "0" && char <= "9") {
			buffer += char;
			separatorTyped = false;
			if (buffer.length === size) {
				values.push(buffer);
				buffer = "";
			}
		} else {
			if (buffer) {
				values.push(buffer);
				buffer = "";
			}
			separatorTyped = values.length > 0;
		}
	}
	if (buffer && values.length < fields.length) values.push(buffer);

	const literalBefore = (fieldIndex: number) => {
		const from = fieldIndex === 0 ? 0 : fields[fieldIndex - 1] + 1;
		let text = "";
		for (let i = from; i < fields[fieldIndex]; i++) {
			const part = parts[i];
			if (part.kind === "literal") text += part.text;
		}
		return text;
	};

	let out = "";
	values.forEach((value, index) => {
		out += literalBefore(index) + value;
	});
	if (separatorTyped && values.length < fields.length) {
		out += literalBefore(values.length);
	}
	return out;
}

export function maskLength(pattern: string): number {
	return compileParts(pattern).reduce(
		(total, part) => total + (part.kind === "literal" ? part.text.length : part.size),
		0
	);
}
