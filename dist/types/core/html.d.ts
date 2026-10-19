export declare function escapeHtml(str: unknown): string;
export declare function countWords(html: string): number;
export declare function countChars(html: string): number;
/**
 * Çıktı HTML'ini sadeleştirir (ZoroEditor orijinal davranışı):
 * yapıştırmadan gelen koyu varsayılan renkleri, boş span/stil ve boş paragrafları atar,
 * blok etiketlerini satırlara böler (kaynak görünümü okunaklı olsun).
 */
export declare function cleanHTML(html: string): string;
/** javascript:, data: vb. tehlikeli bağlantıları reddeder. Göreli (/sayfa, #id, ?q) URL'ler serbest. */
export declare function isSafeUrl(url: string): boolean;
/** "ornek.com" → "https://ornek.com" ; e-posta → mailto: */
export declare function normalizeUrl(url: string): string;
/** Word / Google Docs / Excel yapıştırma temizliği (ayrıntı: ./paste.ts). */
export declare function cleanPastedHTML(html: string): string;
/** YouTube URL'sinden embed edilebilir mi? */
export declare function isYoutubeUrl(url: string): boolean;
