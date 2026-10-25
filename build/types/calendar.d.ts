import { DatepickerOptions, OnOk, ResolvedOptions } from "./options";
import { ViewOwner } from "./view";
export declare class Calendar implements ViewOwner {
    /** Lê uma data escrita no formato (por omissão `dd/mm/aaaa`); `null` se não valer. */
    static parseDate(text: string, format?: string): Date | null;
    /** Escreve uma data no formato (por omissão `dd/mm/aaaa`). */
    static formatDate(date: Date, format?: string): string;
    readonly input: HTMLInputElement;
    readonly options: ResolvedOptions;
    private text;
    private selected;
    private selectedEnd;
    private cursor;
    private rangeStart;
    private rangeEnd;
    private hover;
    private view;
    private page;
    private renderedKey;
    private writing;
    private destroyed;
    private firstYear;
    private lastYear;
    constructor(input: HTMLInputElement, options?: DatepickerOptions | OnOk);
    /** A data confirmada (o início, com `range`), ou `null`. */
    get value(): Date | null;
    /** O fim do intervalo confirmado, ou `null`. */
    get end(): Date | null;
    private pattern;
    isDisabled(date: Date): boolean;
    private monthDisabled;
    private yearDisabled;
    private clamp;
    private nearestEnabled;
    private get pageCount();
    private pageOf;
    isOpen(): boolean;
    open(): void;
    close(): void;
    private returnFocus;
    /** Fecha sem mexer no input: a próxima abertura volta à data confirmada. */
    cancel(): void;
    confirm(): void;
    clear(): void;
    /** Vai para hoje e escolhe-o (com `range`, como início). */
    today(): void;
    next(): void;
    previous(): void;
    private step;
    toggleView(): void;
    destroy(): void;
    private onInputClick;
    private onInputKeydown;
    private onInputInput;
    private onInputChange;
    private commitTyped;
    private normalize;
    private setInvalid;
    private readInput;
    private write;
    onCellClick(cell: HTMLButtonElement): void;
    private pickRange;
    onCellHover(cell: HTMLButtonElement | null): void;
    onGridKeydown(event: KeyboardEvent): void;
    private focusCursor;
    private render;
    private cell;
    private buildDays;
    private buildMonths;
    private buildYears;
    private decorate;
}
