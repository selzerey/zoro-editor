/**
 * Paste cleanup — Word (desktop/Online), Google Docs, Google Sheets, Excel, LibreOffice.
 *
 * Works on the DOM (regex breaks on nested spans). The rules were rewritten as behavior specs after studying
 * CKEditor, TinyMCE, Quill (BSD-3), SunEditor (MIT) and Jodit (MIT); no code was copied.
 * Word's `mso-list` / `@list` syntax is a fact of the file format.
 */
export type PasteSource = 'word' | 'gdocs' | 'sheets' | 'excel' | 'html';
export interface PasteResult {
    html: string;
    source: PasteSource;
    /** Word images on the local disk (file:///): the browser can't read them. */
    droppedLocalImages: number;
}
export declare function detectSource(html: string): PasteSource;
/** Main entry: uses the DOM in the browser, a regex fallback without a DOM (SSR). */
export declare function cleanPasted(input: string): PasteResult;
/** Simple regex cleanup for environments without a DOM (SSR, old tests). */
export declare function cleanPastedRegex(html: string): string;
