import type { Editor, AnyExtension } from '@tiptap/core';
import type { Locale, Messages } from './i18n';

/** Yerleşik araç çubuğu grupları. */
export type BuiltinGroup =
  | 'block'
  | 'format'
  | 'list'
  | 'align'
  | 'link'
  | 'table'
  | 'media'
  | 'embed'
  | 'color'
  | 'extra'
  | 'indent'
  | 'history'
  | 'help'
  | 'view';

export type GroupName = BuiltinGroup | (string & {});

/** Hazır paketler: tek kelimeyle bir grup listesi. */
export type PresetName = 'minimal' | 'basic' | 'blog' | 'full' | (string & {});

export type ThemeMode = 'light' | 'dark' | 'auto';

export type SkinName = 'modern' | 'classic';

/** Araç çubuğu düğmesi tanımı. Kendi gruplarını yazarken de bunu kullanırsın. */
export interface ToolbarButton {
  /** Benzersiz anahtar (ör. "bold"). */
  name: string;
  /** SVG string. */
  icon: string;
  /** Başlık (tooltip + aria-label). Dil dosyasından gelen fonksiyonla da verilebilir. */
  title: string | ((t: Messages) => string);
  /** Tıklanınca çalışır. */
  run: (ctx: ToolbarContext, event: MouseEvent) => void;
  /** Aktif mi (basılı görünür). */
  isActive?: (ctx: ToolbarContext) => boolean;
  /** Kullanılabilir mi. */
  isEnabled?: (ctx: ToolbarContext) => boolean;
  /** Tıklamada editör odağını kaybetmesin (seçim korunur). Varsayılan: true */
  keepFocus?: boolean;
  /** Grubun satırından farklı satırda durmalıysa. */
  row?: 1 | 2;
}

/** Grup = araç çubuğunda yan yana duran düğmeler. */
export interface ToolbarGroup {
  name: GroupName;
  /** 1 = ana satır, 2 = "Araç çubuğunu aç/kapat" ile açılan ikinci satır. */
  row?: 1 | 2;
  /** Düğmeler ya da özel bir eleman üreten fonksiyon (ör. blok seçici). */
  items: ToolbarButton[] | ((ctx: ToolbarContext) => ToolbarWidget);
  /** Bu grup için ek TipTap eklentileri gerekiyorsa. */
  extensions?: AnyExtension[];
}

export interface ToolbarWidget {
  el: HTMLElement;
  /** Seçim değişince çağrılır (aktif durumları güncelle). */
  update?: () => void;
  destroy?: () => void;
}

export interface ToolbarContext {
  editor: Editor;
  zoro: import('./core/editor').ZoroEditor;
  t: Messages;
}

/** Medya öğesi — Zoro Finder ve PHP backend'in ortak formatı. */
export interface MediaItem {
  id: string | number;
  url: string;
  filename: string;
  alt?: string;
  caption?: string;
  title?: string;
  mime?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
  folder?: string;
  srcset?: string | null;
  variants?: Record<string, { url: string; width?: number; height?: number; size?: number }>;
  createdAt?: string;
  /** Backend biliyorsa: bu dosya kaç yerde kullanılıyor. */
  usageCount?: number;
}

export interface MediaFolder {
  path: string;
  name: string;
  count?: number;
}

export interface MediaListParams {
  page: number;
  limit: number;
  search?: string;
  folder?: string;
  type?: 'image' | 'video' | 'document' | '';
  sort?: 'newest' | 'oldest' | 'name' | 'size';
  filter?: '' | 'unused';
}

export interface MediaListResult {
  items: MediaItem[];
  total: number;
  hasMore: boolean;
  folders?: MediaFolder[];
}

export interface UploadOptions {
  alt: string;
  folder?: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Medya backend'i. Hazır `RestMediaAdapter` PHP backend'ine bağlanır;
 * kendi API'ni (Laravel, Next.js route, Supabase, S3...) bağlamak için bu arayüzü uygula.
 */
export interface MediaAdapter {
  list(params: MediaListParams): Promise<MediaListResult>;
  upload(file: File, opts: UploadOptions): Promise<MediaItem>;
  update?(id: MediaItem['id'], data: Partial<Pick<MediaItem, 'alt' | 'caption' | 'title' | 'filename'>>): Promise<MediaItem>;
  remove?(ids: Array<MediaItem['id']>): Promise<void>;
  move?(ids: Array<MediaItem['id']>, folder: string): Promise<void>;
  createFolder?(path: string): Promise<void>;
  deleteFolder?(path: string): Promise<void>;
}

export interface RestAdapterOptions {
  /** Ör. "/zoro/php/public/media.php" */
  endpoint: string;
  /** CSRF token, Authorization vb. */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** Çerez gönderilsin mi (farklı domain için "include"). Varsayılan: "same-origin" */
  credentials?: RequestCredentials;
  /** Backend farklı alan adları döndürüyorsa normalize et. */
  transform?: (raw: any) => MediaItem;
}

export interface MediaOptions {
  /** Kısa yol: PHP endpoint adresi. */
  endpoint?: string;
  headers?: RestAdapterOptions['headers'];
  credentials?: RequestCredentials;
  transform?: RestAdapterOptions['transform'];
  /** Ya da tamamen özel backend. */
  adapter?: MediaAdapter;
  /** Kabul edilen MIME türleri. Varsayılan: görseller. */
  accept?: string[];
  /** MB cinsinden azami boyut (istemci tarafı kontrol). Varsayılan: 20 */
  maxSizeMB?: number;
  /** ALT metni zorunlu mu. Varsayılan: true */
  requireAlt?: boolean;
  /** Editöre eklerken hangi varyant kullanılsın. Varsayılan: "lg" (yoksa orijinal). */
  insertVariant?: string;
  /** Klasör özellikleri gösterilsin mi (adapter destekliyorsa). Varsayılan: true */
  folders?: boolean;
}

export interface ZoroEditorOptions {
  /** Başlangıç HTML içeriği. */
  content?: string;
  /** Hazır paket. Varsayılan: "full" */
  preset?: PresetName;
  /** Grupları tek tek seç. Verilirse preset'in yerini alır. */
  groups?: GroupName[];
  /** Preset'e ek gruplar. */
  addGroups?: GroupName[];
  /** Preset'ten çıkarılacak gruplar. */
  removeGroups?: GroupName[];
  /** Editör yüksekliği (px). Varsayılan: 400 */
  height?: number;
  /** Yükseklik içeriğe göre büyüsün mü (min = height). Varsayılan: true */
  autoGrow?: boolean;
  placeholder?: string;
  /** Dil. Varsayılan: "tr" */
  locale?: Locale | Partial<Messages>;
  theme?: ThemeMode;
  /** Görünüm: "modern" (TinyMCE Premium tarzı, varsayılan) ya da "classic" (WordPress Klasik). */
  skin?: SkinName;
  /** Metin seçilince üstünde açılan biçim menüsü. Varsayılan: modern'de açık, classic'te kapalı. */
  bubbleMenu?: boolean;
  /** "/" komut menüsü. Varsayılan: modern'de açık, classic'te kapalı. */
  slashMenu?: boolean;
  readOnly?: boolean;
  /** Azami karakter sayısı. */
  maxLength?: number;
  /** Üstteki "Ortam ekle" düğmesi ve görsel yükleme. false = medya kapalı. */
  media?: MediaOptions | false;
  /** Basit yükleme kancası: dosyayı al, URL döndür. (adapter yoksa yapıştır/sürükle için kullanılır) */
  onImageUpload?: (file: File) => Promise<string | { url: string; alt?: string; width?: number; height?: number }>;
  /** Araç çubuğu sayfa kayınca yapışık kalsın. Varsayılan: true. Sayı verilirse üst boşluk (px). */
  stickyToolbar?: boolean | number;
  /** Form entegrasyonu: değer bu input/textarea'ya yazılır (seçici ya da eleman). */
  input?: string | HTMLInputElement | HTMLTextAreaElement;
  /** Kelime/karakter sayacı. Varsayılan: true */
  statusBar?: boolean;
  /** Ek TipTap eklentileri. */
  extensions?: AnyExtension[];
  /** Kaynak (HTML) sekmesi. Varsayılan: true */
  sourceMode?: boolean;
  /** Kendi CSS sınıfın. */
  className?: string;
  /**
   * Taslak otomatik kaydetme (tarayıcıda). Anahtar ver: ör. "yazi-42".
   * Sayfa kapanıp açılınca "Geri yükle" önerisi çıkar. Kaydettikten sonra `clearDraft()` çağır.
   */
  autosave?: string | { key: string; delay?: number };
  onChange?: (html: string) => void;
  onReady?: (editor: import('./core/editor').ZoroEditor) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export type { Locale, Messages };
