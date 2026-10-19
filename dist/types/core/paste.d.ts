/**
 * Yapıştırma temizliği — Word (masaüstü/Online), Google Docs, Google Sheets, Excel, LibreOffice.
 *
 * DOM üzerinde çalışır (regex iç içe span'larda bozulur). Kurallar; CKEditor, TinyMCE, Quill (BSD-3),
 * SunEditor (MIT) ve Jodit (MIT) incelenerek davranış tarifi olarak yeniden yazılmıştır, kod kopyalanmamıştır.
 * Word'ün `mso-list` / `@list` biçimi dosya formatı olgusudur.
 */
export type PasteSource = 'word' | 'gdocs' | 'sheets' | 'excel' | 'html';
export interface PasteResult {
    html: string;
    source: PasteSource;
    /** Word'ün yerel diskteki (file:///) görselleri: tarayıcı bunları okuyamaz. */
    droppedLocalImages: number;
}
export declare function detectSource(html: string): PasteSource;
/** Ana giriş: tarayıcıda DOM ile, DOM yoksa (SSR) regex yedeğiyle. */
export declare function cleanPasted(input: string): PasteResult;
/** DOM olmayan ortam için (SSR, eski testler) basit regex temizliği. */
export declare function cleanPastedRegex(html: string): string;
