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
export declare function datepicker_init(options?: DatepickerOptions | OnOk, target?: HTMLInputElement | string): Calendar[];
