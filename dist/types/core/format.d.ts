/**
 * HTML indentation (for the source view).
 * Rules rewritten based on the behavior of Monaco (MIT) and Ace beautify (BSD-3):
 * block elements on their own indented lines; inline content on one line; <pre> as is.
 */
export interface FormatResult {
    html: string;
    /** Start offset of each top-level element in the text (for cursor mapping). */
    blockStarts: number[];
}
export declare function formatHTML(html: string): FormatResult;
/** Estimate the top-level block index from the cursor offset in the source text. */
export declare function blockIndexAt(source: string, caret: number): number;
