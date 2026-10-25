(function (root, factory) {
	if (typeof define === "function" && define.amd) define([], factory);
	else if (typeof module === "object" && module.exports) module.exports = factory();
	else {
		var lib = factory();
		root.DatepickerLib = lib;
		root.datepicker_init = lib.datepicker_init;
		root.Calendar = lib.Calendar;
	}
})(typeof self !== "undefined" ? self : this, function () {
"use strict";
var __dpk = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    Calendar: () => Calendar,
    datepicker_init: () => datepicker_init,
    formatDate: () => formatDate,
    formatRange: () => formatRange,
    parseDate: () => parseDate,
    parseRange: () => parseRange
  });

  // src/dates.ts
  var DEFAULT_FORMAT = "dd/mm/aaaa";
  var RANGE_SEPARATOR = " - ";
  var partsCache = {};
  function compileParts(pattern) {
    const cached = partsCache[pattern];
    if (cached) return cached;
    const parts = [];
    const token = /dd|mm|aaaa|yyyy/g;
    let last = 0;
    let match;
    while (match = token.exec(pattern)) {
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
  function compileFormat(format) {
    const parts = compileParts(format);
    const kinds = parts.filter((part) => part.kind !== "literal").map((part) => part.kind).sort().join(",");
    if (kinds !== "day,month,year") {
      throw new Error(
        `Formato de data inv\xE1lido: "${format}". Use dd, mm e aaaa (ou yyyy) uma vez cada.`
      );
    }
    return parts;
  }
  function validateFormat(format) {
    compileFormat(format);
  }
  function pad(value, size) {
    let text = `${value}`;
    while (text.length < size) text = `0${text}`;
    return text;
  }
  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function createDate(year, month, day) {
    const date = new Date(2e3, 0, 1);
    date.setFullYear(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  function startOfDay(date) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate());
  }
  function daysInMonth(month, year) {
    return createDate(year, month + 1, 0).getDate();
  }
  function sameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function compareDay(a, b) {
    return startOfDay(a).getTime() - startOfDay(b).getTime();
  }
  function addDays(date, days) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }
  function addMonths(date, months) {
    const target = createDate(date.getFullYear(), date.getMonth() + months, 1);
    const day = Math.min(
      date.getDate(),
      daysInMonth(target.getMonth(), target.getFullYear())
    );
    return createDate(target.getFullYear(), target.getMonth(), day);
  }
  function isoKey(date) {
    return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(
      date.getDate(),
      2
    )}`;
  }
  function parseIso(text) {
    const match = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(text);
    if (!match) return null;
    return checked(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  function checked(year, month, day) {
    const date = createDate(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }
    return date;
  }
  function formatDate(date, format = DEFAULT_FORMAT) {
    return compileFormat(format).map((part) => {
      if (part.kind === "literal") return part.text;
      if (part.kind === "day") return pad(date.getDate(), 2);
      if (part.kind === "month") return pad(date.getMonth() + 1, 2);
      return pad(date.getFullYear(), 4);
    }).join("");
  }
  function parseDate(text, format = DEFAULT_FORMAT) {
    const parts = compileFormat(format);
    const order = [];
    const source = parts.map((part) => {
      if (part.kind === "literal") return escapeRegExp(part.text);
      order.push(part.kind);
      return part.kind === "year" ? "(\\d{4})" : "(\\d{1,2})";
    }).join("");
    const match = new RegExp(`^\\s*${source}\\s*$`).exec(text);
    if (!match) return null;
    const values = {};
    order.forEach((kind, index) => values[kind] = Number(match[index + 1]));
    return checked(values.year, values.month - 1, values.day);
  }
  function formatRange(start, end, format) {
    return `${formatDate(start, format)}${RANGE_SEPARATOR}${formatDate(end, format)}`;
  }
  function parseRange(text, format) {
    const pieces = text.split(/\s+-\s+/);
    if (pieces.length !== 2) return null;
    const start = parseDate(pieces[0], format);
    const end = parseDate(pieces[1], format);
    if (!start || !end || compareDay(start, end) > 0) return null;
    return { start, end };
  }
  function maskText(text, pattern) {
    const parts = compileParts(pattern);
    const fields = [];
    parts.forEach((part, index) => {
      if (part.kind !== "literal") fields.push(index);
    });
    const values = [];
    let buffer = "";
    let separatorTyped = false;
    for (let i = 0; i < text.length && values.length < fields.length; i++) {
      const char = text.charAt(i);
      const size = parts[fields[values.length]].size;
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
    const literalBefore = (fieldIndex) => {
      const from = fieldIndex === 0 ? 0 : fields[fieldIndex - 1] + 1;
      let text2 = "";
      for (let i = from; i < fields[fieldIndex]; i++) {
        const part = parts[i];
        if (part.kind === "literal") text2 += part.text;
      }
      return text2;
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

  // src/locale.ts
  var LABELS = {
    pt: {
      title: "Selecionar data",
      dialog: "Selecionar data",
      chooseView: "Escolher m\xEAs e ano",
      previousMonth: "M\xEAs anterior",
      nextMonth: "M\xEAs seguinte",
      previousYear: "Ano anterior",
      nextYear: "Ano seguinte",
      previousYears: "Anos anteriores",
      nextYears: "Anos seguintes",
      clear: "Limpar",
      today: "Hoje",
      cancel: "Cancelar",
      ok: "Ok",
      rangeStart: "In\xEDcio",
      rangeEnd: "Fim"
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
      rangeEnd: "End"
    }
  };
  var SUNDAY_REGIONS = [
    "AG",
    "AS",
    "BD",
    "BR",
    "BS",
    "BT",
    "BW",
    "BZ",
    "CA",
    "CN",
    "CO",
    "DM",
    "DO",
    "ET",
    "GT",
    "GU",
    "HK",
    "HN",
    "ID",
    "IL",
    "IN",
    "JM",
    "JP",
    "KE",
    "KH",
    "KR",
    "LA",
    "MH",
    "MM",
    "MO",
    "MT",
    "MX",
    "MZ",
    "NI",
    "NP",
    "PA",
    "PE",
    "PH",
    "PK",
    "PR",
    "PT",
    "PY",
    "SA",
    "SG",
    "SV",
    "TH",
    "TT",
    "TW",
    "UM",
    "US",
    "VE",
    "VI",
    "WS",
    "YE",
    "ZA",
    "ZW"
  ];
  function labelsFor(locale, overrides) {
    const language = locale.toLowerCase().split("-")[0];
    const base = LABELS[language] || LABELS.en;
    const labels = {};
    for (const key in base) {
      const name = key;
      labels[name] = overrides && overrides[name] || base[name];
    }
    return labels;
  }
  function firstDayOfWeek(locale) {
    try {
      const info = new Intl.Locale(locale);
      const week = info.getWeekInfo ? info.getWeekInfo() : info.weekInfo;
      if (week && week.firstDay) return week.firstDay % 7;
      const region = info.maximize().region;
      return region && SUNDAY_REGIONS.indexOf(region) !== -1 ? 0 : 1;
    } catch (err) {
      return 0;
    }
  }
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  var formatters = {};
  function formatter(locale, options) {
    const key = `${locale}|${JSON.stringify(options)}`;
    return formatters[key] = formatters[key] || new Intl.DateTimeFormat(locale, options);
  }
  var LocaleText = class {
    constructor(locale) {
      this.locale = locale;
      this.monthsLong = [];
      this.monthsShort = [];
      this.weekdaysNarrow = [];
      this.weekdaysLong = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(2023, month, 1);
        this.monthsLong.push(capitalize(formatter(locale, { month: "long" }).format(date)));
        this.monthsShort.push(
          capitalize(formatter(locale, { month: "short" }).format(date).replace(/\.$/, ""))
        );
      }
      for (let day = 0; day < 7; day++) {
        const date = new Date(2023, 0, 1 + day);
        this.weekdaysNarrow.push(
          formatter(locale, { weekday: "narrow" }).format(date).toUpperCase()
        );
        this.weekdaysLong.push(capitalize(formatter(locale, { weekday: "long" }).format(date)));
      }
    }
    // "5 de março", "March 5": cabe no cabeçalho com letra grande.
    dayMonth(date) {
      return formatter(this.locale, { day: "numeric", month: "long" }).format(date);
    }
    // "5/03", "Mar 5": para os dois extremos de um intervalo.
    dayMonthShort(date) {
      return formatter(this.locale, { day: "numeric", month: "short" }).format(date);
    }
    fullDate(date) {
      return formatter(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    }
    monthYear(month, year) {
      return capitalize(
        formatter(this.locale, { month: "long", year: "numeric" }).format(
          new Date(year, month, 1)
        )
      );
    }
  };
  var localeCache = {};
  function localeText(locale) {
    return localeCache[locale] = localeCache[locale] || new LocaleText(locale);
  }

  // src/options.ts
  var DISPLAYS = ["auto", "popover", "sheet", "modal"];
  var THEMES = ["auto", "light", "dark"];
  function toDate(value, format) {
    if (value === void 0 || value === null || value === "") return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : startOfDay(value);
    }
    const date = parseDate(value, format) || parseIso(value);
    if (!date) throw new Error(`Data inv\xE1lida nas op\xE7\xF5es: "${value}"`);
    return date;
  }
  function toBoolean(value) {
    if (value === null) return void 0;
    return value === "" || value === "true" || value === "1";
  }
  function pick(value, allowed) {
    return value && allowed.indexOf(value) !== -1 ? value : void 0;
  }
  function resolveOptions(input, options) {
    const data = (name) => input.getAttribute(`data-${name}`);
    const locale = data("locale") || options.locale || "pt-PT";
    const format = data("format") || options.format || DEFAULT_FORMAT;
    validateFormat(format);
    const firstDayAttr = data("first-day");
    const firstDay = firstDayAttr !== null && firstDayAttr !== "" ? Number(firstDayAttr) : options.firstDayOfWeek !== void 0 ? options.firstDayOfWeek : firstDayOfWeek(locale);
    const disabledAttr = data("disabled-days");
    const disabledDays = disabledAttr !== null ? disabledAttr.split(",").map((day) => day.trim()).filter((day) => day !== "").map(Number) : options.disabledDays || [];
    const min = toDate(data("min") || options.min, format);
    const max = toDate(data("max") || options.max, format);
    if (min && max && min.getTime() > max.getTime()) {
      throw new Error("A op\xE7\xE3o min \xE9 posterior \xE0 op\xE7\xE3o max.");
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
      firstDayOfWeek: (firstDay % 7 + 7) % 7,
      format,
      mask: mask !== void 0 ? mask : options.mask !== false,
      range: range !== void 0 ? range : !!options.range,
      display: pick(data("display"), DISPLAYS) || options.display || "auto",
      theme: pick(data("theme"), THEMES) || options.theme || "auto",
      injectStyles: options.injectStyles !== false,
      styleNonce: options.styleNonce
    };
  }

  // src/datepicker.css
  var datepicker_default = '.dpk-root{--dpk-primary: #1565c0;--dpk-on-primary: #ffffff;--dpk-surface: #ffffff;--dpk-on-surface: #1f1f1f;--dpk-muted: #5f6368;--dpk-range: #dbe7fb;--dpk-hover: rgba(0, 0, 0, .06);--dpk-disabled: #a8acb1;--dpk-backdrop: rgba(0, 0, 0, .32);--dpk-radius: 12px;--dpk-font: inherit;--dpk-shadow: 0 12px 28px rgba(0, 0, 0, .18), 0 2px 6px rgba(0, 0, 0, .12);--dpk-duration: .2s}.dpk-root[data-theme=dark]{--dpk-primary: #8ab4f8;--dpk-on-primary: #202124;--dpk-surface: #202124;--dpk-on-surface: #e8eaed;--dpk-muted: #bdc1c6;--dpk-range: #2f4166;--dpk-hover: rgba(255, 255, 255, .08);--dpk-disabled: #6f7378;--dpk-backdrop: rgba(0, 0, 0, .55);--dpk-shadow: 0 12px 28px rgba(0, 0, 0, .5)}@media(prefers-color-scheme:dark){.dpk-root:not([data-theme=light]){--dpk-primary: #8ab4f8;--dpk-on-primary: #202124;--dpk-surface: #202124;--dpk-on-surface: #e8eaed;--dpk-muted: #bdc1c6;--dpk-range: #2f4166;--dpk-hover: rgba(255, 255, 255, .08);--dpk-disabled: #6f7378;--dpk-backdrop: rgba(0, 0, 0, .55);--dpk-shadow: 0 12px 28px rgba(0, 0, 0, .5)}}.dpk-root{position:fixed;inset:0;z-index:1066;visibility:hidden;font-family:var(--dpk-font);line-height:normal;transition:visibility 0s linear var(--dpk-duration)}.dpk-root.dpk-open{visibility:visible;transition:visibility 0s}.dpk-root *,.dpk-root *:before,.dpk-root *:after{box-sizing:border-box}.dpk-backdrop{position:absolute;inset:0;background-color:var(--dpk-backdrop);opacity:0;transition:opacity var(--dpk-duration)}.dpk-root[data-display=popover] .dpk-backdrop{background-color:transparent}.dpk-root.dpk-open .dpk-backdrop{opacity:1}.dpk-container{position:fixed;display:flex;flex-direction:column;width:328px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background-color:var(--dpk-surface);color:var(--dpk-on-surface);border-radius:var(--dpk-radius);box-shadow:var(--dpk-shadow);opacity:0;transition:opacity var(--dpk-duration),transform var(--dpk-duration)}.dpk-root.dpk-open .dpk-container{opacity:1}.dpk-root[data-display=modal] .dpk-container{top:50%;left:50%;transform:translate(-50%,-46%)}.dpk-root[data-display=modal].dpk-open .dpk-container{transform:translate(-50%,-50%)}.dpk-root[data-display=popover] .dpk-container{transform:translateY(-6px)}.dpk-root[data-display=popover].dpk-open .dpk-container{transform:translateY(0)}.dpk-root[data-display=sheet] .dpk-container{inset:auto 0 0;width:100%;max-width:none;max-height:100%;border-radius:var(--dpk-radius) var(--dpk-radius) 0 0;padding-bottom:env(safe-area-inset-bottom,0);transform:translateY(100%)}.dpk-root[data-display=sheet].dpk-open .dpk-container{transform:translateY(0)}.dpk-root[data-display=sheet] .dpk-header{border-radius:var(--dpk-radius) var(--dpk-radius) 0 0}.dpk-root[data-display=sheet] .dpk-main{width:100%;max-width:420px;margin:0 auto}.dpk-header{padding:16px 24px 12px;background-color:var(--dpk-primary);color:var(--dpk-on-primary);border-radius:var(--dpk-radius) var(--dpk-radius) 0 0}.dpk-title-text{display:block;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:1.5px}.dpk-date-text{display:block;margin-top:12px;font-size:30px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dpk-date-text.dpk-range-text{font-size:22px}.dpk-main{display:flex;flex-direction:column;padding:8px 12px 0}.dpk-date-controls{display:flex;align-items:center;justify-content:space-between;color:var(--dpk-muted)}.dpk-root button{cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent}.dpk-root button:focus-visible{outline:2px solid var(--dpk-primary);outline-offset:2px}.dpk-view-change-button{padding:10px;margin:0;border:none;border-radius:10px;background-color:transparent;color:var(--dpk-muted);font-size:.9rem;font-weight:500}.dpk-view-change-button:after{content:"";display:inline-block;width:0;height:0;margin:0 0 0 6px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid;vertical-align:middle}.dpk-arrow-controls{display:flex;gap:16px}.dpk-previous-button,.dpk-next-button{position:relative;width:40px;height:40px;padding:0;margin:0;border:none;border-radius:50%;background-color:transparent;color:var(--dpk-muted)}.dpk-previous-button:after,.dpk-next-button:after{content:"";position:absolute;inset:0;margin:15px;border:0 solid;border-top-width:2px}.dpk-previous-button:after{border-left-width:2px;transform:translate(2px) rotate(-45deg)}.dpk-next-button:after{border-right-width:2px;transform:translate(-2px) rotate(45deg)}.dpk-previous-button:disabled,.dpk-next-button:disabled,.dpk-footer-btn:disabled{opacity:.38;cursor:default}.dpk-table{width:100%;margin:4px 0 0;border-collapse:collapse;border-spacing:0;table-layout:fixed;text-indent:0}.dpk-day-heading{height:36px;padding:0;text-align:center;font-size:12px;font-weight:500;color:var(--dpk-muted)}.dpk-cell{padding:0;text-align:center}.dpk-small-cell{height:40px}.dpk-large-cell{height:52px}.dpk-cell-content{margin:0;padding:0;border:1px solid transparent;background-color:transparent;color:inherit;font:inherit}.dpk-small-cell-content{width:36px;height:36px;border-radius:50%;font-size:13px}.dpk-large-cell-content{width:72px;height:40px;border-radius:999px;font-size:14px}.dpk-cell-content:not([aria-disabled=true]):hover,.dpk-footer-btn:not(:disabled):hover,.dpk-view-change-button:hover,.dpk-previous-button:not(:disabled):hover,.dpk-next-button:not(:disabled):hover{background-color:var(--dpk-hover)}.dpk-cell-content.dpk-today{border-color:var(--dpk-muted)}.dpk-cell.dpk-in-range{background-color:var(--dpk-range)}.dpk-cell.dpk-range-start{background:linear-gradient(to right,transparent 50%,var(--dpk-range) 50%)}.dpk-cell.dpk-range-end{background:linear-gradient(to left,transparent 50%,var(--dpk-range) 50%)}.dpk-cell.dpk-range-start.dpk-range-end{background:none}.dpk-cell-content[aria-disabled=true]{color:var(--dpk-disabled);cursor:default}.dpk-cell-content.dpk-active,.dpk-cell-content.dpk-active:hover{background-color:var(--dpk-primary);border-color:var(--dpk-primary);color:var(--dpk-on-primary)}.dpk-footer{display:flex;align-items:center;justify-content:flex-end;gap:2px;padding:8px 0 10px}.dpk-footer-btn{height:40px;padding:0 8px;border:none;border-radius:10px;background-color:transparent;color:var(--dpk-primary);font-size:.8rem;font-weight:600;letter-spacing:.06rem;text-transform:uppercase}.dpk-clear-btn{margin-right:auto}.dpk-invalid{outline:2px solid #c62828;outline-offset:1px}@media(prefers-reduced-motion:reduce){.dpk-root,.dpk-root.dpk-open,.dpk-backdrop,.dpk-container{transition:none!important}}';

  // src/view.ts
  var STYLE_ID = "dpk-style";
  function ensureStyles(nonce) {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    if (nonce) style.setAttribute("nonce", nonce);
    style.textContent = datepicker_default;
    document.head.appendChild(style);
  }
  var NARROW_SCREEN = "(max-width: 599px)";
  var GAP = 6;
  var MARGIN = 8;
  var View = class {
    constructor() {
      this.owner = null;
      this.anchor = null;
      this.display = "modal";
      // Popover: por baixo do input; se não couber, por cima. Se não couber de
      // nenhum lado, fica do lado com mais espaço e encolhe (o contentor faz scroll
      // por dentro), em vez de tapar o input.
      this.position = () => {
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
        let top;
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
      this.onDocumentKeydown = (event) => {
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
        const active = document.activeElement;
        const inside = !!active && this.container.contains(active);
        if (event.shiftKey && (active === first || !inside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      };
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
      const query = (selector) => root.querySelector(selector);
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
      const call = (action) => () => {
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
    cellFrom(target) {
      const element = target;
      if (!element || !element.closest) return null;
      const cell = element.closest(".dpk-cell-content");
      return cell && this.tbody.contains(cell) ? cell : null;
    }
    isOpenFor(owner) {
      return this.owner === owner && this.root.classList.contains("dpk-open");
    }
    show(owner, anchor, display, theme) {
      if (this.owner && this.owner !== owner) this.owner.cancel();
      this.owner = owner;
      this.anchor = anchor;
      this.display = display === "auto" ? typeof window.matchMedia === "function" && window.matchMedia(NARROW_SCREEN).matches ? "sheet" : "popover" : display;
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
    focusable() {
      const buttons = this.container.querySelectorAll("button");
      const list = [];
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (!button.disabled && button.tabIndex !== -1) list.push(button);
      }
      return list;
    }
  };
  var shared = null;
  var users = 0;
  function retainView() {
    users++;
  }
  function getView() {
    if (!shared) shared = new View();
    return shared;
  }
  function currentView() {
    return shared;
  }
  function releaseView() {
    users = Math.max(0, users - 1);
    if (users === 0 && shared) {
      shared.destroy();
      shared = null;
    }
  }

  // src/calendar.ts
  var YEARS_PER_PAGE = 24;
  var YEARS_PER_ROW = 4;
  var MONTHS_PER_ROW = 4;
  var Calendar = class {
    constructor(input, options = {}) {
      this.selected = null;
      this.selectedEnd = null;
      this.rangeStart = null;
      this.rangeEnd = null;
      this.hover = null;
      this.view = "day";
      this.page = 0;
      this.renderedKey = "";
      this.writing = false;
      this.destroyed = false;
      // ----- Input -----
      this.onInputClick = () => this.open();
      this.onInputKeydown = (event) => {
        if (event.key === "Enter" || event.key === "ArrowDown") {
          event.preventDefault();
          this.open();
        }
      };
      this.onInputInput = (event) => {
        if (this.writing || !this.options.mask) return;
        const inputType = event.inputType || "";
        if (inputType.indexOf("delete") === 0) return;
        const input = this.input;
        const value = input.value;
        const caret = input.selectionStart === null ? value.length : input.selectionStart;
        const atEnd = caret >= value.length;
        const digitsBefore = value.slice(0, caret).replace(/\D/g, "").length;
        const masked = maskText(value, this.pattern());
        if (masked === value) return;
        input.value = masked;
        let position = masked.length;
        if (!atEnd) {
          let digits = 0;
          position = 0;
          while (position < masked.length && digits < digitsBefore) {
            if (/\d/.test(masked.charAt(position))) digits++;
            position++;
          }
        }
        try {
          input.setSelectionRange(position, position);
        } catch (err) {
        }
      };
      this.onInputChange = () => {
        if (!this.writing) this.commitTyped();
      };
      this.input = input;
      this.options = resolveOptions(
        input,
        typeof options === "function" ? { onOk: options } : options
      );
      this.text = localeText(this.options.locale);
      const today = startOfDay(/* @__PURE__ */ new Date());
      this.firstYear = this.options.min ? this.options.min.getFullYear() : today.getFullYear() - 100;
      this.lastYear = this.options.max ? this.options.max.getFullYear() : today.getFullYear() + 115;
      this.cursor = this.clamp(today);
      if (!input.placeholder) input.placeholder = this.pattern();
      input.autocomplete = "off";
      input.setAttribute("aria-haspopup", "dialog");
      if (this.options.mask) input.setAttribute("inputmode", "numeric");
      if (this.options.injectStyles) ensureStyles(this.options.styleNonce);
      input.addEventListener("click", this.onInputClick);
      input.addEventListener("keydown", this.onInputKeydown);
      input.addEventListener("input", this.onInputInput);
      input.addEventListener("change", this.onInputChange);
      retainView();
      this.readInput();
    }
    /** Lê uma data escrita no formato (por omissão `dd/mm/aaaa`); `null` se não valer. */
    static parseDate(text, format) {
      return parseDate(text, format);
    }
    /** Escreve uma data no formato (por omissão `dd/mm/aaaa`). */
    static formatDate(date, format) {
      return formatDate(date, format);
    }
    /** A data confirmada (o início, com `range`), ou `null`. */
    get value() {
      return this.selected;
    }
    /** O fim do intervalo confirmado, ou `null`. */
    get end() {
      return this.selectedEnd;
    }
    pattern() {
      const format = this.options.format;
      return this.options.range ? `${format}${RANGE_SEPARATOR}${format}` : format;
    }
    // ----- Regras de datas -----
    isDisabled(date) {
      const { min, max, disabledDays, isDisabled } = this.options;
      if (min && compareDay(date, min) < 0) return true;
      if (max && compareDay(date, max) > 0) return true;
      if (disabledDays.indexOf(date.getDay()) !== -1) return true;
      return !!isDisabled && isDisabled(date);
    }
    monthDisabled(year, month) {
      const { min, max } = this.options;
      const value = year * 12 + month;
      if (min && value < min.getFullYear() * 12 + min.getMonth()) return true;
      return !!max && value > max.getFullYear() * 12 + max.getMonth();
    }
    yearDisabled(year) {
      return year < this.firstYear || year > this.lastYear;
    }
    clamp(date) {
      const { min, max } = this.options;
      if (min && compareDay(date, min) < 0) return min;
      if (max && compareDay(date, max) > 0) return max;
      return date;
    }
    // Sem data escolhida, abre no primeiro dia que se pode escolher: hoje, ou o
    // seguinte livre (um domingo bloqueado abre na segunda), ou o anterior.
    nearestEnabled(date) {
      for (let offset = 0; offset <= 366; offset++) {
        const after = addDays(date, offset);
        if (!this.isDisabled(after)) return after;
        const before = addDays(date, -offset);
        if (!this.isDisabled(before)) return before;
      }
      return date;
    }
    get pageCount() {
      return Math.ceil((this.lastYear - this.firstYear + 1) / YEARS_PER_PAGE);
    }
    pageOf(year) {
      const page = Math.floor((year - this.firstYear) / YEARS_PER_PAGE);
      return Math.max(0, Math.min(page, this.pageCount - 1));
    }
    // ----- Abrir, fechar, confirmar -----
    isOpen() {
      const view = currentView();
      return !!view && view.isOpenFor(this);
    }
    open() {
      if (this.destroyed || this.isOpen()) return;
      this.readInput();
      this.cursor = this.selected || this.nearestEnabled(this.clamp(startOfDay(/* @__PURE__ */ new Date())));
      this.rangeStart = this.options.range ? this.selected : null;
      this.rangeEnd = this.options.range ? this.selectedEnd : null;
      this.hover = null;
      this.view = "day";
      this.renderedKey = "";
      const view = getView();
      view.show(this, this.input, this.options.display, this.options.theme);
      this.render();
      view.position();
      this.focusCursor();
    }
    close() {
      if (!this.isOpen()) return;
      currentView().hide();
      this.input.focus();
    }
    /** Fecha sem mexer no input: a próxima abertura volta à data confirmada. */
    cancel() {
      this.close();
    }
    confirm() {
      if (this.options.range) {
        if (!this.rangeStart) return;
        const start = this.rangeStart;
        const end = this.rangeEnd || this.rangeStart;
        const text2 = formatRange(start, end, this.options.format);
        this.selected = start;
        this.selectedEnd = end;
        this.write(text2);
        this.close();
        if (this.options.onOk) this.options.onOk(text2, start, end);
        return;
      }
      if (this.isDisabled(this.cursor)) return;
      const date = this.cursor;
      const text = formatDate(date, this.options.format);
      this.selected = date;
      this.write(text);
      this.close();
      if (this.options.onOk) this.options.onOk(text, date);
    }
    clear() {
      this.selected = null;
      this.selectedEnd = null;
      this.rangeStart = null;
      this.rangeEnd = null;
      this.cursor = this.clamp(startOfDay(/* @__PURE__ */ new Date()));
      this.view = "day";
      this.write("");
      this.render();
    }
    /** Vai para hoje e escolhe-o (com `range`, como início). */
    today() {
      const today = startOfDay(/* @__PURE__ */ new Date());
      if (this.isDisabled(today)) return;
      this.cursor = today;
      if (this.options.range) {
        this.rangeStart = today;
        this.rangeEnd = null;
      }
      this.view = "day";
      this.render();
      this.focusCursor();
    }
    next() {
      this.step(1);
    }
    previous() {
      this.step(-1);
    }
    step(direction) {
      if (this.view === "day") {
        if (this.monthDisabled(this.cursor.getFullYear(), this.cursor.getMonth() + direction)) return;
        this.cursor = this.clamp(addMonths(this.cursor, direction));
      } else if (this.view === "month") {
        if (this.yearDisabled(this.cursor.getFullYear() + direction)) return;
        this.cursor = this.clamp(addMonths(this.cursor, 12 * direction));
      } else {
        this.page = Math.max(0, Math.min(this.page + direction, this.pageCount - 1));
      }
      this.render();
    }
    toggleView() {
      if (this.view === "day") this.view = "month";
      else if (this.view === "month") {
        this.view = "year";
        this.page = this.pageOf(this.cursor.getFullYear());
      } else this.view = "day";
      this.render();
    }
    destroy() {
      if (this.destroyed) return;
      if (this.isOpen()) currentView().hide();
      this.input.removeEventListener("click", this.onInputClick);
      this.input.removeEventListener("keydown", this.onInputKeydown);
      this.input.removeEventListener("input", this.onInputInput);
      this.input.removeEventListener("change", this.onInputChange);
      this.input.removeAttribute("data-dpk-ready");
      this.destroyed = true;
      releaseView();
    }
    // Data escrita à mão: valida, normaliza e confirma, ou marca como inválida.
    commitTyped() {
      const text = this.input.value.trim();
      if (!text) {
        this.selected = null;
        this.selectedEnd = null;
        this.setInvalid(false);
        return;
      }
      const { format, onOk } = this.options;
      if (this.options.range) {
        const range = parseRange(text, format);
        if (!range || this.isDisabled(range.start) || this.isDisabled(range.end)) {
          this.setInvalid(true);
          return;
        }
        const normalized2 = formatRange(range.start, range.end, format);
        this.selected = range.start;
        this.selectedEnd = range.end;
        this.normalize(normalized2);
        if (onOk) onOk(normalized2, range.start, range.end);
        return;
      }
      const date = parseDate(text, format);
      if (!date || this.isDisabled(date)) {
        this.setInvalid(true);
        return;
      }
      const normalized = formatDate(date, format);
      this.selected = date;
      this.normalize(normalized);
      if (onOk) onOk(normalized, date);
    }
    normalize(text) {
      if (this.input.value !== text) {
        this.writing = true;
        this.input.value = text;
        this.writing = false;
      }
      this.setInvalid(false);
    }
    setInvalid(invalid) {
      if (invalid) this.input.setAttribute("aria-invalid", "true");
      else this.input.removeAttribute("aria-invalid");
      this.input.classList.toggle("dpk-invalid", invalid);
    }
    readInput() {
      const text = this.input.value.trim();
      if (this.options.range) {
        const range = parseRange(text, this.options.format);
        this.selected = range ? range.start : null;
        this.selectedEnd = range ? range.end : null;
      } else {
        this.selected = parseDate(text, this.options.format);
        this.selectedEnd = null;
      }
    }
    write(text) {
      this.writing = true;
      this.input.value = text;
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
      this.input.dispatchEvent(new Event("change", { bubbles: true }));
      this.writing = false;
      this.setInvalid(false);
    }
    // ----- Grelha: rato e teclado -----
    onCellClick(cell) {
      if (cell.getAttribute("aria-disabled") === "true") return;
      if (this.view === "day") {
        const date = parseIso(cell.getAttribute("data-date") || "");
        if (!date) return;
        if (this.options.range) this.pickRange(date);
        this.cursor = date;
        this.render();
        return;
      }
      if (this.view === "month") {
        const month = Number(cell.getAttribute("data-month"));
        const year = this.cursor.getFullYear();
        const day = Math.min(this.cursor.getDate(), daysInMonth(month, year));
        this.cursor = this.clamp(createDate(year, month, day));
        this.view = "day";
      } else {
        const year = Number(cell.getAttribute("data-year"));
        this.cursor = this.clamp(addMonths(this.cursor, (year - this.cursor.getFullYear()) * 12));
        this.view = "month";
      }
      this.render();
      this.focusCursor();
    }
    pickRange(date) {
      if (!this.rangeStart || this.rangeEnd) {
        this.rangeStart = date;
        this.rangeEnd = null;
      } else if (compareDay(date, this.rangeStart) < 0) {
        this.rangeStart = date;
      } else {
        this.rangeEnd = date;
      }
      this.hover = null;
    }
    onCellHover(cell) {
      if (!this.options.range || !this.rangeStart || this.rangeEnd || this.view !== "day") return;
      const date = cell ? parseIso(cell.getAttribute("data-date") || "") : null;
      if (sameDay(date, this.hover)) return;
      this.hover = date;
      this.decorate();
    }
    onGridKeydown(event) {
      const key = event.key;
      const cursor = this.cursor;
      let next = null;
      if (this.view === "day") {
        const weekOffset = (cursor.getDay() - this.options.firstDayOfWeek + 7) % 7;
        if (key === "ArrowLeft") next = addDays(cursor, -1);
        else if (key === "ArrowRight") next = addDays(cursor, 1);
        else if (key === "ArrowUp") next = addDays(cursor, -7);
        else if (key === "ArrowDown") next = addDays(cursor, 7);
        else if (key === "Home") next = addDays(cursor, -weekOffset);
        else if (key === "End") next = addDays(cursor, 6 - weekOffset);
        else if (key === "PageUp") next = addMonths(cursor, event.shiftKey ? -12 : -1);
        else if (key === "PageDown") next = addMonths(cursor, event.shiftKey ? 12 : 1);
      } else if (this.view === "month") {
        const month = cursor.getMonth();
        let delta = null;
        if (key === "ArrowLeft") delta = -1;
        else if (key === "ArrowRight") delta = 1;
        else if (key === "ArrowUp") delta = -MONTHS_PER_ROW;
        else if (key === "ArrowDown") delta = MONTHS_PER_ROW;
        else if (key === "Home") delta = -month;
        else if (key === "End") delta = 11 - month;
        else if (key === "PageUp") delta = -12;
        else if (key === "PageDown") delta = 12;
        if (delta !== null) next = addMonths(cursor, delta);
      } else {
        const year = cursor.getFullYear();
        const pageStart = this.firstYear + this.page * YEARS_PER_PAGE;
        let target = null;
        if (key === "ArrowLeft") target = year - 1;
        else if (key === "ArrowRight") target = year + 1;
        else if (key === "ArrowUp") target = year - YEARS_PER_ROW;
        else if (key === "ArrowDown") target = year + YEARS_PER_ROW;
        else if (key === "Home") target = pageStart;
        else if (key === "End") target = Math.min(pageStart + YEARS_PER_PAGE - 1, this.lastYear);
        else if (key === "PageUp") target = year - YEARS_PER_PAGE;
        else if (key === "PageDown") target = year + YEARS_PER_PAGE;
        if (target !== null) {
          target = Math.max(this.firstYear, Math.min(target, this.lastYear));
          next = addMonths(cursor, (target - year) * 12);
        }
      }
      if (!next) return;
      event.preventDefault();
      this.cursor = this.clamp(next);
      if (this.view === "year") this.page = this.pageOf(this.cursor.getFullYear());
      this.render();
      this.focusCursor();
    }
    focusCursor() {
      const view = currentView();
      if (!view) return;
      const target = view.tbody.querySelector('[tabindex="0"]');
      if (!target) return;
      target.focus();
      if (document.activeElement !== target) {
        setTimeout(() => {
          if (this.isOpen()) target.focus();
        }, 0);
      }
    }
    // ----- Desenho -----
    render() {
      if (!this.isOpen()) return;
      const view = currentView();
      const labels = this.options.labels;
      const year = this.cursor.getFullYear();
      const month = this.cursor.getMonth();
      view.title.textContent = labels.title;
      view.dateText.classList.toggle("dpk-range-text", this.options.range);
      if (this.options.range) {
        const start = this.rangeStart;
        const end = this.rangeEnd;
        view.dateText.textContent = `${start ? this.text.dayMonthShort(start) : labels.rangeStart}${RANGE_SEPARATOR}${end ? this.text.dayMonthShort(end) : labels.rangeEnd}`;
      } else {
        view.dateText.textContent = this.text.dayMonth(this.cursor);
      }
      let heading;
      let previousLabel;
      let nextLabel;
      let canGoBack;
      let canGoForward;
      if (this.view === "day") {
        heading = this.text.monthYear(month, year);
        previousLabel = labels.previousMonth;
        nextLabel = labels.nextMonth;
        canGoBack = !this.monthDisabled(year, month - 1);
        canGoForward = !this.monthDisabled(year, month + 1);
      } else if (this.view === "month") {
        heading = `${year}`;
        previousLabel = labels.previousYear;
        nextLabel = labels.nextYear;
        canGoBack = !this.yearDisabled(year - 1);
        canGoForward = !this.yearDisabled(year + 1);
      } else {
        const first = this.firstYear + this.page * YEARS_PER_PAGE;
        const last = Math.min(first + YEARS_PER_PAGE - 1, this.lastYear);
        heading = `${first} - ${last}`;
        previousLabel = labels.previousYears;
        nextLabel = labels.nextYears;
        canGoBack = this.page > 0;
        canGoForward = this.page < this.pageCount - 1;
      }
      view.changeButton.textContent = heading;
      view.changeButton.setAttribute("aria-label", `${heading}, ${labels.chooseView}`);
      view.table.setAttribute("aria-label", heading);
      view.prevButton.setAttribute("aria-label", previousLabel);
      view.nextButton.setAttribute("aria-label", nextLabel);
      view.prevButton.disabled = !canGoBack;
      view.nextButton.disabled = !canGoForward;
      view.clearButton.textContent = labels.clear;
      view.todayButton.textContent = labels.today;
      view.cancelButton.textContent = labels.cancel;
      view.okButton.textContent = labels.ok;
      view.todayButton.disabled = this.isDisabled(startOfDay(/* @__PURE__ */ new Date()));
      view.okButton.disabled = this.options.range ? !this.rangeStart : this.isDisabled(this.cursor);
      const key = [
        this.view,
        this.options.locale,
        this.options.firstDayOfWeek,
        year,
        this.view === "day" ? month : "",
        this.view === "year" ? this.page : ""
      ].join("|");
      if (key !== this.renderedKey || view.tbody.getAttribute("data-key") !== key) {
        if (this.view === "day") this.buildDays(view, year, month);
        else if (this.view === "month") this.buildMonths(view, year);
        else this.buildYears(view);
        this.renderedKey = key;
        view.tbody.setAttribute("data-key", key);
      }
      this.decorate();
    }
    cell(size, text, label, attribute, value) {
      const td = document.createElement("td");
      const button = document.createElement("button");
      td.className = `dpk-cell dpk-${size}-cell`;
      td.setAttribute("role", "gridcell");
      button.type = "button";
      button.className = `dpk-cell-content dpk-${size}-cell-content`;
      button.textContent = text;
      button.setAttribute("aria-label", label);
      button.setAttribute(attribute, value);
      button.tabIndex = -1;
      td.appendChild(button);
      return td;
    }
    buildDays(view, year, month) {
      const firstDay = this.options.firstDayOfWeek;
      const head = document.createElement("tr");
      for (let i = 0; i < 7; i++) {
        const weekday = (firstDay + i) % 7;
        const th = document.createElement("th");
        th.className = "dpk-day-heading";
        th.scope = "col";
        th.abbr = this.text.weekdaysLong[weekday];
        th.textContent = this.text.weekdaysNarrow[weekday];
        head.appendChild(th);
      }
      view.thead.innerHTML = "";
      view.thead.appendChild(head);
      const offset = (createDate(year, month, 1).getDay() - firstDay + 7) % 7;
      const total = daysInMonth(month, year);
      const fragment = document.createDocumentFragment();
      let day = 1 - offset;
      while (day <= total) {
        const row = document.createElement("tr");
        for (let i = 0; i < 7; i++, day++) {
          if (day < 1 || day > total) {
            row.appendChild(document.createElement("td"));
            continue;
          }
          const date = createDate(year, month, day);
          row.appendChild(
            this.cell("small", `${day}`, this.text.fullDate(date), "data-date", isoKey(date))
          );
        }
        fragment.appendChild(row);
      }
      view.tbody.innerHTML = "";
      view.tbody.appendChild(fragment);
    }
    buildMonths(view, year) {
      view.thead.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (let start = 0; start < 12; start += MONTHS_PER_ROW) {
        const row = document.createElement("tr");
        for (let month = start; month < start + MONTHS_PER_ROW; month++) {
          row.appendChild(
            this.cell(
              "large",
              this.text.monthsShort[month],
              this.text.monthYear(month, year),
              "data-month",
              `${month}`
            )
          );
        }
        fragment.appendChild(row);
      }
      view.tbody.innerHTML = "";
      view.tbody.appendChild(fragment);
    }
    buildYears(view) {
      view.thead.innerHTML = "";
      const first = this.firstYear + this.page * YEARS_PER_PAGE;
      const last = Math.min(first + YEARS_PER_PAGE - 1, this.lastYear);
      const fragment = document.createDocumentFragment();
      for (let start = first; start <= last; start += YEARS_PER_ROW) {
        const row = document.createElement("tr");
        for (let year = start; year < start + YEARS_PER_ROW && year <= last; year++) {
          row.appendChild(this.cell("large", `${year}`, `${year}`, "data-year", `${year}`));
        }
        fragment.appendChild(row);
      }
      view.tbody.innerHTML = "";
      view.tbody.appendChild(fragment);
    }
    // Estado de cada célula: foco, escolhida, hoje, bloqueada, dentro do intervalo.
    decorate() {
      const view = currentView();
      if (!view) return;
      const today = startOfDay(/* @__PURE__ */ new Date());
      const buttons = view.tbody.querySelectorAll(".dpk-cell-content");
      const cursor = this.cursor;
      let start = null;
      let end = null;
      if (this.options.range) {
        start = this.rangeStart;
        end = this.rangeEnd;
        if (start && !end && this.hover && compareDay(this.hover, start) >= 0) end = this.hover;
      }
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const td = button.parentNode;
        let focused = false;
        let active = false;
        let isToday = false;
        let disabled = false;
        let inRange = false;
        let isStart = false;
        let isEnd = false;
        if (this.view === "day") {
          const date = parseIso(button.getAttribute("data-date") || "");
          focused = sameDay(date, cursor);
          isToday = sameDay(date, today);
          disabled = this.isDisabled(date);
          if (this.options.range) {
            isStart = sameDay(date, start);
            isEnd = sameDay(date, end);
            active = isStart || isEnd;
            inRange = !!start && !!end && compareDay(date, start) > 0 && compareDay(date, end) < 0;
          } else {
            active = focused && !disabled;
          }
        } else if (this.view === "month") {
          const month = Number(button.getAttribute("data-month"));
          const year = cursor.getFullYear();
          focused = active = month === cursor.getMonth();
          isToday = month === today.getMonth() && year === today.getFullYear();
          disabled = this.monthDisabled(year, month);
        } else {
          const year = Number(button.getAttribute("data-year"));
          focused = active = year === cursor.getFullYear();
          isToday = year === today.getFullYear();
          disabled = this.yearDisabled(year);
        }
        button.tabIndex = focused ? 0 : -1;
        button.classList.toggle("dpk-active", active);
        button.classList.toggle("dpk-today", isToday);
        if (isToday) button.setAttribute("aria-current", "date");
        else button.removeAttribute("aria-current");
        if (disabled) button.setAttribute("aria-disabled", "true");
        else button.removeAttribute("aria-disabled");
        td.setAttribute("aria-selected", active || inRange ? "true" : "false");
        td.classList.toggle("dpk-in-range", inRange);
        td.classList.toggle("dpk-range-start", isStart && !!end && !isEnd);
        td.classList.toggle("dpk-range-end", isEnd && !!start && !isStart);
      }
    }
  };

  // src/index.ts
  function datepicker_init(options, target) {
    const legacy = typeof options === "function";
    const resolved = legacy ? { onOk: options } : options || {};
    let inputs;
    if (target === void 0) {
      inputs = Array.prototype.slice.call(
        document.querySelectorAll('input[data-type="datepicker"]')
      );
    } else if (typeof target === "string") {
      inputs = Array.prototype.slice.call(document.querySelectorAll(target));
    } else {
      inputs = [target];
    }
    const calendars = [];
    inputs.forEach((element) => {
      if (element.tagName !== "INPUT") return;
      const input = element;
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
  return __toCommonJS(index_exports);
})();

return __dpk;
});
