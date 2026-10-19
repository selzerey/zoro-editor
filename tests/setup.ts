// jsdom'da ProseMirror'ın ihtiyaç duyduğu ölçüm API'leri
const rect = () => ({ x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, toJSON() {} });
if (typeof window !== 'undefined') {
  // Testler Türkçe arayüz metinlerini doğrular
  document.documentElement.lang = 'tr';
  (Range.prototype as any).getBoundingClientRect = rect;
  (Range.prototype as any).getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} });
  (document as any).elementFromPoint = () => null;
  if (!(globalThis as any).DOMRect) {
    (globalThis as any).DOMRect = class { constructor(public x = 0, public y = 0, public width = 0, public height = 0) {} get left() { return this.x; } get top() { return this.y; } get right() { return this.x + this.width; } get bottom() { return this.y + this.height; } };
  }
  if (!URL.createObjectURL) (URL as any).createObjectURL = () => 'blob:test';
  if (!URL.revokeObjectURL) (URL as any).revokeObjectURL = () => {};
}
