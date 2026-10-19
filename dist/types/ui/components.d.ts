export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Record<string, any>, ...children: Array<Node | string | null | undefined | false>): HTMLElementTagNameMap[K];
export interface DialogOptions {
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Theme/scale classes (passed from the editor wrapper). */
    themeClass?: string;
    closeLabel?: string;
    onClose?: () => void;
}
export declare class ZoroDialog {
    private opts;
    overlay: HTMLDivElement | null;
    dialog: HTMLDivElement | null;
    bodyEl: HTMLDivElement | null;
    isOpen: boolean;
    private prevFocus;
    constructor(opts: DialogOptions);
    open(body: HTMLElement | string): this;
    setBody(content: HTMLElement | string): void;
    addFooter(el: HTMLElement): HTMLElement | undefined;
    close(): void;
    private onKeyDown;
}
/** Fixed-positioned popover. Stays on screen; closes on outside click / ESC. */
export declare class ZoroPopover {
    private themeClass;
    private onClose?;
    el: HTMLDivElement | null;
    isOpen: boolean;
    private anchor;
    private listenTimer;
    constructor(themeClass?: string, onClose?: (() => void) | undefined);
    open(content: HTMLElement, anchor: Element | DOMRect, extraClass?: string): HTMLDivElement;
    position(rect: DOMRect): void;
    close(): void;
    private onOutside;
    private onKey;
    private onViewportChange;
}
export interface SelectItem {
    value: string;
    label: string;
    shortcut?: string;
    style?: Partial<CSSStyleDeclaration>;
    /** SVG icon to the left of the option */
    icon?: string;
    /** Indent level (folder tree) */
    depth?: number;
    /** Faded extra info on the right (e.g. file count) */
    meta?: string;
}
export interface SelectOptions {
    items: SelectItem[];
    value: string;
    label: string;
    onChange: (v: string) => void;
    /** toolbar: toolbar button; field: form field (Finder, dialogs) */
    variant?: 'toolbar' | 'field';
    /** Text shown when the value isn't in the list (action menus: "Move…") */
    placeholder?: string;
    /** Icon to the left of the label in the trigger */
    icon?: string;
    size?: 'sm' | 'md';
    /** Reset the value to the placeholder after selection (action menu) */
    resetAfterChange?: boolean;
}
/** Keyboard-navigable custom dropdown (instead of the browser's bare <select>). */
export declare class ZoroSelect {
    private opts;
    wrapper: HTMLDivElement;
    trigger: HTMLButtonElement;
    private dropdown;
    private activeIndex;
    isOpen: boolean;
    constructor(opts: SelectOptions);
    get value(): string;
    render(): HTMLDivElement;
    setValue(v: string): void;
    setItems(items: SelectItem[]): void;
    private current;
    private updateTrigger;
    open(): void;
    close(): void;
    private choose;
    private highlight;
    private onKey;
    private onOutside;
    private onScrollClose;
    destroy(): void;
}
/** Tabs. */
export declare class ZoroTabs {
    private opts;
    container: HTMLDivElement;
    private buttons;
    private panels;
    constructor(opts: {
        tabs: Array<{
            id: string;
            label: string;
            icon?: string;
        }>;
        active: string;
        onChange?: (id: string) => void;
    });
    render(): HTMLDivElement;
    setActive(id: string): void;
    get active(): string;
    panel(id: string): HTMLDivElement;
}
/** Short notification (at the bottom of the screen). */
export declare function toast(message: string, type?: 'info' | 'error' | 'success', themeClass?: string, ms?: number): () => void;
/** Simple confirm dialog (instead of window.confirm; looks right on mobile too). */
export declare function confirmDialog(message: string, opts: {
    title: string;
    ok: string;
    cancel: string;
    danger?: boolean;
    themeClass?: string;
}): Promise<boolean>;
/** Single-field input dialog (instead of window.prompt). */
export declare function promptDialog(opts: {
    title: string;
    label: string;
    value?: string;
    placeholder?: string;
    ok: string;
    cancel: string;
    themeClass?: string;
    validate?: (v: string) => string | null;
}): Promise<string | null>;
/** "Bold (Ctrl+B)" → { label: "Bold", keys: "Ctrl+B" } ; ⌘ ⌥ ⇧ on Mac */
export declare function splitShortcut(title: string): {
    label: string;
    keys: string;
};
/** Set up once per document: [data-tip] elements inside .zoro-root. */
export declare function installTooltips(): void;
