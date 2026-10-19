import { cleanPasted } from './paste';

// HTML yardımcıları: sayaçlar, temizlik, güvenli URL, yapıştırma temizliği

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textOf(html: string): string {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/blockquote|\/tr)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, 'x');
}

export function countWords(html: string): number {
  const text = textOf(html).trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function countChars(html: string): number {
  return textOf(html).replace(/\s+/g, ' ').trim().length;
}

/**
 * Çıktı HTML'ini sadeleştirir (ZoroEditor orijinal davranışı):
 * yapıştırmadan gelen koyu varsayılan renkleri, boş span/stil ve boş paragrafları atar,
 * blok etiketlerini satırlara böler (kaynak görünümü okunaklı olsun).
 */
export function cleanHTML(html: string): string {
  let c = html
    .replace(
      /<span[^>]*style=["'][^"']*color:\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
      (match, r, g, b, content) => (+r < 100 && +g < 100 && +b < 100 ? content : match),
    )
    .replace(/<span[^>]*style=["'][^"']*color:\s*#(?:000|111|222|333|444|555)[0-9a-f]*[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/\s*style=["']\s*["']/gi, '')
    .replace(/<span>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/<p>\s*<\/p>/gi, '');
  c = c
    .replace(/(<\/(?:p|h[1-6]|ul|ol|li|div|blockquote|table|thead|tbody|tr|td|th|figure|figcaption|pre)>)/gi, '$1\n')
    .replace(/(<hr[^>]*>)/gi, '$1\n')
    .replace(/(<(?:ul|ol|table|thead|tbody|tr)[^>]*>)/gi, '$1\n')
    .replace(/([^\n])(<(?:h[1-6]|ul|ol|blockquote|table)[^>]*>)/gi, '$1\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return c;
}

const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:|sms:|ftp:)/i;

/** javascript:, data: vb. tehlikeli bağlantıları reddeder. Göreli (/sayfa, #id, ?q) URL'ler serbest. */
export function isSafeUrl(url: string): boolean {
  const u = url.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (!u) return false;
  if (/^[/#?.]/.test(u)) return true;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return true; // "ornek.com/sayfa" gibi şemasız
  return SAFE_PROTOCOLS.test(u);
}

/** "ornek.com" → "https://ornek.com" ; e-posta → mailto: */
export function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (/^[/#?.]/.test(u) || /^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) return 'mailto:' + u;
  return 'https://' + u;
}

/** Word / Google Docs / Excel yapıştırma temizliği (ayrıntı: ./paste.ts). */
export function cleanPastedHTML(html: string): string {
  return cleanPasted(html).html;
}

/** YouTube URL'sinden embed edilebilir mi? */
export function isYoutubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/i.test(url.trim());
}
