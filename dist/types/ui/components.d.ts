export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Record<string, any>, ...children: Array<Node | string | null | undefined | false>): HTMLElementTagNameMap[K];
export interface DialogOptions {
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Tema/ölçek sınıfları (editör sarmalayıcısından aktarılır). */
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
/** Sabit konumlu açılır kutu. Ekrandan taşmaz, dışarı tıklayınca / ESC ile kapanır. */
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
    /** Seçeneğin solunda SVG simge */
    icon?: string;
    /** Girinti düzeyi (klasör ağacı) */
    depth?: number;
    /** Sağda soluk ek bilgi (ör. dosya sayısı) */
    meta?: string;
}
export interface SelectOptions {
    items: SelectItem[];
    value: string;
    label: string;
    onChange: (v: string) => void;
    /** toolbar: araç çubuğu düğmesi; field: form alanı (Finder, dialoglar) */
    variant?: 'toolbar' | 'field';
    /** Değer listede yoksa gösterilen metin (eylem menüleri: "Taşı…") */
    placeholder?: string;
    /** Tetikleyicide etiketin solunda simge */
    icon?: string;
    size?: 'sm' | 'md';
    /** Seçim sonrası değeri yer tutucuya geri al (eylem menüsü) */
    resetAfterChange?: boolean;
}
/** Klavye ile gezilebilen özel açılır liste (tarayıcının çıplak <select>'i yerine). */
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
/** Sekmeler. */
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
/** Kısa bildirim (ekranın altında). */
export declare function toast(message: string, type?: 'info' | 'error' | 'success', themeClass?: string, ms?: number): () => void;
/** Basit onay penceresi (window.confirm yerine; mobilde de düzgün görünür). */
export declare function confirmDialog(message: string, opts: {
    title: string;
    ok: string;
    cancel: string;
    danger?: boolean;
    themeClass?: string;
}): Promise<boolean>;
/** Tek alanlı giriş penceresi (window.prompt yerine). */
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
/** "Kalın (Ctrl+B)" → { label: "Kalın", keys: "Ctrl+B" } ; Mac'te ⌘ ⌥ ⇧ */
export declare function splitShortcut(title: string): {
    label: string;
    keys: string;
};
/** Belge genelinde bir kez kurulur: .zoro-root içindeki [data-tip] öğeleri. */
export declare function installTooltips(): void;
