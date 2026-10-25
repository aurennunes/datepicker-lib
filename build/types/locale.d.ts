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
export declare function labelsFor(locale: string, overrides?: Partial<Labels>): Labels;
export declare function firstDayOfWeek(locale: string): number;
export declare class LocaleText {
    readonly locale: string;
    readonly monthsLong: string[];
    readonly monthsShort: string[];
    readonly weekdaysNarrow: string[];
    readonly weekdaysLong: string[];
    constructor(locale: string);
    dayMonth(date: Date): string;
    dayMonthShort(date: Date): string;
    fullDate(date: Date): string;
    monthYear(month: number, year: number): string;
}
export declare function localeText(locale: string): LocaleText;
