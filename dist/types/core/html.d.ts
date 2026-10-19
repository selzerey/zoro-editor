export declare function escapeHtml(str: unknown): string;
export declare function countWords(html: string): number;
export declare function countChars(html: string): number;
/**
 * Simplifies the output HTML (original ZoroEditor behavior):
 * drops dark default colors from pastes, empty spans/styles and empty paragraphs,
 * and puts block tags on separate lines (so the source view is readable).
 */
export declare function cleanHTML(html: string): string;
/** Rejects dangerous links such as javascript: and data:. Relative URLs (/page, #id, ?q) are allowed. */
export declare function isSafeUrl(url: string): boolean;
/** "example.com" → "https://example.com" ; email → mailto: */
export declare function normalizeUrl(url: string): string;
/** Word / Google Docs / Excel paste cleanup (details: ./paste.ts). */
export declare function cleanPastedHTML(html: string): string;
/** Can this YouTube URL be embedded? */
export declare function isYoutubeUrl(url: string): boolean;
