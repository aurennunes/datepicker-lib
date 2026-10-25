export interface Labels {
	title: string;
	dialog: string;
	chooseView: string;
	previousMonth: string;
	nextMonth: string;
	previousYear: string;
	nextYear: string;
	previousYears: string;
	nextYears: string;
	clear: string;
	today: string;
	cancel: string;
	ok: string;
	rangeStart: string;
	rangeEnd: string;
}

const LABELS: { [language: string]: Labels } = {
	pt: {
		title: "Selecionar data",
		dialog: "Selecionar data",
		chooseView: "Escolher mês e ano",
		previousMonth: "Mês anterior",
		nextMonth: "Mês seguinte",
		previousYear: "Ano anterior",
		nextYear: "Ano seguinte",
		previousYears: "Anos anteriores",
		nextYears: "Anos seguintes",
		clear: "Limpar",
		today: "Hoje",
		cancel: "Cancelar",
		ok: "Ok",
		rangeStart: "Início",
		rangeEnd: "Fim",
	},
	en: {
		title: "Select date",
		dialog: "Select date",
		chooseView: "Choose month and year",
		previousMonth: "Previous month",
		nextMonth: "Next month",
		previousYear: "Previous year",
		nextYear: "Next year",
		previousYears: "Previous years",
		nextYears: "Next years",
		clear: "Clear",
		today: "Today",
		cancel: "Cancel",
		ok: "Ok",
		rangeStart: "Start",
		rangeEnd: "End",
	},
};

// Regiões em que a semana começa ao domingo, para browsers sem
// Intl.Locale.prototype.getWeekInfo (Firefox, à data).
const SUNDAY_REGIONS = [
	"AG", "AS", "BD", "BR", "BS", "BT", "BW", "BZ", "CA", "CN", "CO", "DM", "DO",
	"ET", "GT", "GU", "HK", "HN", "ID", "IL", "IN", "JM", "JP", "KE", "KH", "KR",
	"LA", "MH", "MM", "MO", "MT", "MX", "MZ", "NI", "NP", "PA", "PE", "PH", "PK",
	"PR", "PT", "PY", "SA", "SG", "SV", "TH", "TT", "TW", "UM", "US", "VE", "VI",
	"WS", "YE", "ZA", "ZW",
];

export function labelsFor(locale: string, overrides?: Partial<Labels>): Labels {
	const language = locale.toLowerCase().split("-")[0];
	const base = LABELS[language] || LABELS.en;
	const labels = {} as Labels;
	for (const key in base) {
		const name = key as keyof Labels;
		labels[name] = (overrides && overrides[name]) || base[name];
	}
	return labels;
}

export function firstDayOfWeek(locale: string): number {
	try {
		const info = new Intl.Locale(locale) as Intl.Locale & {
			getWeekInfo?: () => { firstDay: number };
			weekInfo?: { firstDay: number };
		};
		const week = info.getWeekInfo ? info.getWeekInfo() : info.weekInfo;
		if (week && week.firstDay) return week.firstDay % 7;

		const region = info.maximize().region;
		return region && SUNDAY_REGIONS.indexOf(region) !== -1 ? 0 : 1;
	} catch (err) {
		return 0;
	}
}

function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

// Formatadores do Intl custam a criar; guardam-se por idioma e opções.
const formatters: { [key: string]: Intl.DateTimeFormat } = {};

function formatter(locale: string, options: Intl.DateTimeFormatOptions) {
	const key = `${locale}|${JSON.stringify(options)}`;
	return (formatters[key] =
		formatters[key] || new Intl.DateTimeFormat(locale, options));
}

export class LocaleText {
	readonly monthsLong: string[] = [];
	readonly monthsShort: string[] = [];
	readonly weekdaysNarrow: string[] = [];
	readonly weekdaysLong: string[] = [];

	constructor(readonly locale: string) {
		for (let month = 0; month < 12; month++) {
			const date = new Date(2023, month, 1);
			this.monthsLong.push(capitalize(formatter(locale, { month: "long" }).format(date)));
			this.monthsShort.push(
				capitalize(formatter(locale, { month: "short" }).format(date).replace(/\.$/, ""))
			);
		}
		// 1 de janeiro de 2023 foi um domingo.
		for (let day = 0; day < 7; day++) {
			const date = new Date(2023, 0, 1 + day);
			this.weekdaysNarrow.push(
				formatter(locale, { weekday: "narrow" }).format(date).toUpperCase()
			);
			this.weekdaysLong.push(capitalize(formatter(locale, { weekday: "long" }).format(date)));
		}
	}

	// "5 de março", "March 5": cabe no cabeçalho com letra grande.
	dayMonth(date: Date): string {
		return formatter(this.locale, { day: "numeric", month: "long" }).format(date);
	}

	// "5/03", "Mar 5": para os dois extremos de um intervalo.
	dayMonthShort(date: Date): string {
		return formatter(this.locale, { day: "numeric", month: "short" }).format(date);
	}

	fullDate(date: Date): string {
		return formatter(this.locale, {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		}).format(date);
	}

	monthYear(month: number, year: number): string {
		return capitalize(
			formatter(this.locale, { month: "long", year: "numeric" }).format(
				new Date(year, month, 1)
			)
		);
	}
}

const localeCache: { [locale: string]: LocaleText } = {};

export function localeText(locale: string): LocaleText {
	return (localeCache[locale] = localeCache[locale] || new LocaleText(locale));
}
