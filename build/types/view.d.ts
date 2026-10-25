import type { Display, Theme } from "./options";
export declare const STYLE_ID = "dpk-style";
/** O que o diálogo precisa de quem o abriu: o calendário dono do momento. */
export interface ViewOwner {
    onCellClick(cell: HTMLButtonElement): void;
    onCellHover(cell: HTMLButtonElement | null): void;
    onGridKeydown(event: KeyboardEvent): void;
    toggleView(): void;
    next(): void;
    previous(): void;
    clear(): void;
    today(): void;
    cancel(): void;
    confirm(): void;
}
export declare function ensureStyles(nonce?: string): void;
/**
 * Um só diálogo para todos os inputs da página. Quem o abre passa a ser o
 * dono (`owner`) e recebe os eventos; os listeners são estes e ficam fixos,
 * um por zona, em vez de um por célula.
 */
export declare class View {
    readonly root: HTMLDivElement;
    readonly container: HTMLDivElement;
    readonly title: HTMLSpanElement;
    readonly dateText: HTMLSpanElement;
    readonly changeButton: HTMLButtonElement;
    readonly prevButton: HTMLButtonElement;
    readonly nextButton: HTMLButtonElement;
    readonly table: HTMLTableElement;
    readonly thead: HTMLTableSectionElement;
    readonly tbody: HTMLTableSectionElement;
    readonly clearButton: HTMLButtonElement;
    readonly todayButton: HTMLButtonElement;
    readonly cancelButton: HTMLButtonElement;
    readonly okButton: HTMLButtonElement;
    owner: ViewOwner | null;
    private anchor;
    private display;
    /** O tipo do último toque no diálogo ("mouse", "touch", "pen"), ou "". */
    private pointer;
    constructor();
    private cellFrom;
    isOpenFor(owner: ViewOwner): boolean;
    show(owner: ViewOwner, anchor: HTMLElement, display: Display, theme: Theme): void;
    hide(): void;
    /** Se o diálogo foi usado com o dedo ou caneta, e não com rato ou teclado. */
    usedByTouch(): boolean;
    destroy(): void;
    position: () => void;
    private onDocumentKeydown;
    focusable(): HTMLElement[];
}
export declare function retainView(): void;
export declare function getView(): View;
export declare function currentView(): View | null;
export declare function releaseView(): void;
