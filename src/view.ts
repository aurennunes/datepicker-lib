import css from "./datepicker.css";
import type { Display, Theme } from "./options";

export const STYLE_ID = "dpk-style";

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

export function ensureStyles(nonce?: string): void {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	if (nonce) style.setAttribute("nonce", nonce);
	style.textContent = css;
	document.head.appendChild(style);
}

const NARROW_SCREEN = "(max-width: 599px)";
const GAP = 6;
const MARGIN = 8;

/**
 * Um só diálogo para todos os inputs da página. Quem o abre passa a ser o
 * dono (`owner`) e recebe os eventos; os listeners são estes e ficam fixos,
 * um por zona, em vez de um por célula.
 */
export class View {
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

	owner: ViewOwner | null = null;
	private anchor: HTMLElement | null = null;
	private display: Exclude<Display, "auto"> = "modal";

	constructor() {
		const id = `dpk_${Math.random().toString(36).slice(2)}`;
		const root = document.createElement("div");
		root.className = "dpk-root";
		root.innerHTML = `
			<div class="dpk-backdrop"></div>
			<div class="dpk-container" role="dialog" aria-modal="true" aria-labelledby="${id}_title">
				<div class="dpk-header">
					<span class="dpk-title-text" id="${id}_title"></span>
					<span class="dpk-date-text" aria-live="polite"></span>
				</div>
				<div class="dpk-main">
					<div class="dpk-date-controls">
						<button type="button" class="dpk-view-change-button" aria-live="polite"></button>
						<div class="dpk-arrow-controls">
							<button type="button" class="dpk-previous-button"></button>
							<button type="button" class="dpk-next-button"></button>
						</div>
					</div>
					<table class="dpk-table" role="grid">
						<thead></thead>
						<tbody></tbody>
					</table>
					<div class="dpk-footer">
						<button type="button" class="dpk-footer-btn dpk-clear-btn"></button>
						<button type="button" class="dpk-footer-btn dpk-today-btn"></button>
						<button type="button" class="dpk-footer-btn dpk-cancel-btn"></button>
						<button type="button" class="dpk-footer-btn dpk-ok-btn"></button>
					</div>
				</div>
			</div>`;

		const query = <T extends Element>(selector: string) =>
			root.querySelector(selector) as T;

		this.root = root;
		this.container = query(".dpk-container");
		this.title = query(".dpk-title-text");
		this.dateText = query(".dpk-date-text");
		this.changeButton = query(".dpk-view-change-button");
		this.prevButton = query(".dpk-previous-button");
		this.nextButton = query(".dpk-next-button");
		this.table = query(".dpk-table");
		this.thead = query("thead");
		this.tbody = query("tbody");
		this.clearButton = query(".dpk-clear-btn");
		this.todayButton = query(".dpk-today-btn");
		this.cancelButton = query(".dpk-cancel-btn");
		this.okButton = query(".dpk-ok-btn");

		const call = (action: (owner: ViewOwner) => void) => () => {
			if (this.owner) action(this.owner);
		};

		query(".dpk-backdrop").addEventListener("click", call((o) => o.cancel()));
		this.changeButton.addEventListener("click", call((o) => o.toggleView()));
		this.prevButton.addEventListener("click", call((o) => o.previous()));
		this.nextButton.addEventListener("click", call((o) => o.next()));
		this.clearButton.addEventListener("click", call((o) => o.clear()));
		this.todayButton.addEventListener("click", call((o) => o.today()));
		this.cancelButton.addEventListener("click", call((o) => o.cancel()));
		this.okButton.addEventListener("click", call((o) => o.confirm()));

		this.tbody.addEventListener("click", (event) => {
			const cell = this.cellFrom(event.target);
			if (cell && this.owner) this.owner.onCellClick(cell);
		});
		this.tbody.addEventListener("mouseover", (event) => {
			if (this.owner) this.owner.onCellHover(this.cellFrom(event.target));
		});
		this.tbody.addEventListener("mouseleave", () => {
			if (this.owner) this.owner.onCellHover(null);
		});
		this.tbody.addEventListener("keydown", (event) => {
			if (this.owner) this.owner.onGridKeydown(event);
		});

		document.body.appendChild(root);
	}

	private cellFrom(target: EventTarget | null): HTMLButtonElement | null {
		const element = target as Element | null;
		if (!element || !element.closest) return null;
		const cell = element.closest(".dpk-cell-content");
		return cell && this.tbody.contains(cell) ? (cell as HTMLButtonElement) : null;
	}

	isOpenFor(owner: ViewOwner): boolean {
		return this.owner === owner && this.root.classList.contains("dpk-open");
	}

	show(owner: ViewOwner, anchor: HTMLElement, display: Display, theme: Theme) {
		if (this.owner && this.owner !== owner) this.owner.cancel();

		this.owner = owner;
		this.anchor = anchor;
		this.display =
			display === "auto"
				? typeof window.matchMedia === "function" && window.matchMedia(NARROW_SCREEN).matches
					? "sheet"
					: "popover"
				: display;

		this.root.setAttribute("data-display", this.display);
		if (theme === "auto") this.root.removeAttribute("data-theme");
		else this.root.setAttribute("data-theme", theme);

		this.root.classList.add("dpk-open");
		this.position();

		document.addEventListener("keydown", this.onDocumentKeydown);
		window.addEventListener("resize", this.position);
		window.addEventListener("scroll", this.position, true);
	}

	hide() {
		this.root.classList.remove("dpk-open");
		document.removeEventListener("keydown", this.onDocumentKeydown);
		window.removeEventListener("resize", this.position);
		window.removeEventListener("scroll", this.position, true);
		this.owner = null;
		this.anchor = null;
	}

	destroy() {
		this.hide();
		if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
	}

	// Popover: por baixo do input; se não couber, por cima. Se não couber de
	// nenhum lado, fica do lado com mais espaço e encolhe (o contentor faz scroll
	// por dentro), em vez de tapar o input.
	position = () => {
		const style = this.container.style;
		style.maxHeight = "";
		if (this.display !== "popover" || !this.anchor) {
			style.top = style.left = "";
			return;
		}

		const anchor = this.anchor.getBoundingClientRect();
		const width = this.container.offsetWidth;
		const height = this.container.offsetHeight;
		const viewWidth = document.documentElement.clientWidth || window.innerWidth;
		const viewHeight = window.innerHeight;
		const below = viewHeight - MARGIN - (anchor.bottom + GAP);
		const above = anchor.top - GAP - MARGIN;

		let top: number;
		if (height <= below) {
			top = anchor.bottom + GAP;
		} else if (height <= above) {
			top = anchor.top - GAP - height;
		} else if (below >= above) {
			top = anchor.bottom + GAP;
			style.maxHeight = `${Math.max(0, Math.floor(below))}px`;
		} else {
			top = MARGIN;
			style.maxHeight = `${Math.max(0, Math.floor(above))}px`;
		}

		const left = Math.max(MARGIN, Math.min(anchor.left, viewWidth - width - MARGIN));
		style.top = `${Math.round(top)}px`;
		style.left = `${Math.round(left)}px`;
	};

	// Escape fecha; Tab e Shift+Tab não saem do diálogo.
	private onDocumentKeydown = (event: KeyboardEvent) => {
		if (!this.owner) return;

		if (event.key === "Escape") {
			event.preventDefault();
			this.owner.cancel();
			return;
		}
		if (event.key !== "Tab") return;

		const focusable = this.focusable();
		if (!focusable.length) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;
		const inside = !!active && this.container.contains(active);

		if (event.shiftKey && (active === first || !inside)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (active === last || !inside)) {
			event.preventDefault();
			first.focus();
		}
	};

	focusable(): HTMLElement[] {
		const buttons = this.container.querySelectorAll("button");
		const list: HTMLElement[] = [];
		for (let i = 0; i < buttons.length; i++) {
			const button = buttons[i];
			if (!button.disabled && button.tabIndex !== -1) list.push(button);
		}
		return list;
	}
}

let shared: View | null = null;
let users = 0;

// Cada calendário conta como um utilizador; o diálogo só nasce no primeiro
// open() e só sai do DOM quando o último calendário é destruído.
export function retainView(): void {
	users++;
}

export function getView(): View {
	if (!shared) shared = new View();
	return shared;
}

export function currentView(): View | null {
	return shared;
}

export function releaseView(): void {
	users = Math.max(0, users - 1);
	if (users === 0 && shared) {
		shared.destroy();
		shared = null;
	}
}
