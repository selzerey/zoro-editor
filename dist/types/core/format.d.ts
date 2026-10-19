/**
 * HTML girintileme (kaynak görünümü için).
 * Kurallar Monaco (MIT) ve Ace beautify (BSD-3) davranışından esinlenerek yeniden yazıldı:
 * blok öğeler kendi satırında ve girintili; satır içi içerik tek satırda; <pre> olduğu gibi.
 */
export interface FormatResult {
    html: string;
    /** Her üst düzey öğenin metindeki başlangıç ofseti (imleç eşlemesi için). */
    blockStarts: number[];
}
export declare function formatHTML(html: string): FormatResult;
/** Kaynak metindeki imleç ofsetinden üst düzey blok indeksini tahmin et. */
export declare function blockIndexAt(source: string, caret: number): number;
