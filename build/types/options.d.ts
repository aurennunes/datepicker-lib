import { Labels } from "./locale";
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
export declare function resolveOptions(input: HTMLInputElement, options: DatepickerOptions): ResolvedOptions;
