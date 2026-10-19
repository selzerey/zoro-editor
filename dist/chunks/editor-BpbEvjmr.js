import { Editor as e, Node as t, getMarkRange as n, mergeAttributes as r } from "@tiptap/core";
import i from "@tiptap/starter-kit";
import a from "@tiptap/extension-link";
import o from "@tiptap/extension-text-align";
import { Color as s, TextStyle as c } from "@tiptap/extension-text-style";
import l from "@tiptap/extension-highlight";
import { Table as u, TableCell as d, TableHeader as f, TableRow as p } from "@tiptap/extension-table";
import m from "@tiptap/extension-youtube";
import h from "@tiptap/extension-subscript";
import g from "@tiptap/extension-superscript";
import { CharacterCount as _, Placeholder as v } from "@tiptap/extensions";
import { NodeSelection as y, TextSelection as b } from "@tiptap/pm/state";
//#region src/i18n.ts
var x = {
	addMedia: "Ortam ekle",
	visual: "Görsel",
	source: "Kaynak",
	sourcePlaceholder: "HTML kodunu buraya yazın...",
	placeholder: "İçeriği yazmaya başlayın...",
	words: "kelime",
	chars: "karakter",
	paragraph: "Paragraf",
	heading: "Başlık",
	preformatted: "Önceden biçimlenmiş",
	bold: "Kalın (Ctrl+B)",
	italic: "Eğik (Ctrl+I)",
	underline: "Altı çizili (Ctrl+U)",
	strike: "Üzeri çizili (Shift+Alt+D)",
	code: "Satır içi kod",
	superscript: "Üst simge",
	subscript: "Alt simge",
	localImagesDropped: "Word'deki {n} görsel bilgisayarınızda olduğu için aktarılamadı. 'Ortam ekle' ile yükleyin.",
	bulletList: "Madde imli liste (Shift+Alt+U)",
	orderedList: "Numaralı liste (Shift+Alt+O)",
	blockquote: "Alıntı (Shift+Alt+Q)",
	alignLeft: "Sola yasla (Shift+Alt+L)",
	alignCenter: "Ortala (Shift+Alt+C)",
	alignRight: "Sağa yasla (Shift+Alt+R)",
	alignJustify: "İki yana yasla (Shift+Alt+J)",
	link: "Bağlantı ekle (Ctrl+K)",
	unlink: "Bağlantıyı kaldır (Shift+Alt+S)",
	table: "Tablo ekle",
	tableMenu: "Tablo",
	tableAddRowBefore: "Üste satır ekle",
	tableAddRowAfter: "Alta satır ekle",
	tableAddColBefore: "Sola sütun ekle",
	tableToggleHeaderCol: "Başlık sütunu aç/kapat",
	tableCellBg: "Hücre zemini",
	tableToolbar: "Tablo araçları",
	tableAddColAfter: "Sağa sütun ekle",
	tableDeleteRow: "Satırı sil",
	tableDeleteCol: "Sütunu sil",
	tableToggleHeader: "Başlık satırı aç/kapat",
	tableMerge: "Hücreleri birleştir / ayır",
	tableDelete: "Tabloyu sil",
	toolbarToggle: "Araç çubuğunu aç/kapat (Shift+Alt+Z)",
	fullscreen: "Tam ekran",
	exitFullscreen: "Tam ekrandan çık",
	hr: "Yatay çizgi",
	textColor: "Yazı rengi",
	bgColor: "Arka plan rengi",
	removeColor: "Rengi kaldır",
	recentColors: "Son kullanılanlar",
	customColor: "Özel renk",
	removeFormat: "Biçimlendirmeyi temizle",
	specialChars: "Özel karakterler",
	outdent: "Girintiyi azalt",
	indent: "Girintiyi artır",
	undo: "Geri al (Ctrl+Z)",
	redo: "İleri al (Ctrl+Y)",
	help: "Klavye kısayolları (Shift+Alt+H)",
	image: "Görsel ekle (Shift+Alt+M)",
	youtube: "YouTube videosu ekle",
	youtubePrompt: "YouTube bağlantısı",
	youtubeInvalid: "Geçerli bir YouTube bağlantısı girin.",
	urlPlaceholder: "URL yapıştırın",
	apply: "Uygula",
	advanced: "Gelişmiş ayarlar",
	openLink: "Bağlantıyı yeni sekmede aç",
	linkTitle: "Bağlantı Ekle",
	linkUrl: "URL",
	linkText: "Bağlantı metni",
	linkTitleAttr: "Başlık (title)",
	linkNewTab: "Yeni sekmede aç",
	linkNofollow: "nofollow ekle",
	linkSponsored: "sponsored ekle",
	linkInvalid: "Bu bağlantı türüne izin verilmiyor.",
	cancel: "İptal",
	save: "Kaydet",
	close: "Kapat",
	insert: "Ekle",
	delete: "Sil",
	edit: "Düzenle",
	shortcutsTitle: "Klavye kısayolları",
	shortcutsCtrl: "Varsayılan kısayollar, Ctrl + harf:",
	shortcutsShiftAlt: "Ek kısayollar, Shift + Alt + harf:",
	shortcutsMarkdown: "Biçim kısayolları (satır başında + boşluk):",
	imageSettings: "Görsel Ayarları",
	imageAlt: "ALT metni",
	imageAltPlaceholder: "Görsel açıklaması...",
	imageTitle: "Başlık / açıklama",
	imageDecorative: "Dekoratif görsel (ekran okuyucular atlasın, ALT gerekmez)",
	captionPlaceholder: "Görselin altında görünecek yazı",
	imageAlign: "Hizalama",
	alignNone: "Yok",
	left: "Sol",
	center: "Orta",
	right: "Sağ",
	size: "Boyut",
	sizeAuto: "Otomatik",
	sizeCustom: "Özel boyut",
	width: "Genişlik",
	height: "Yükseklik",
	uploading: "Yükleniyor...",
	uploadFailed: "Yükleme başarısız",
	uploadNotConfigured: "Görsel yüklemek için medya ayarı yapılmamış.",
	tooLarge: "Dosya çok büyük (en fazla {max} MB).",
	badType: "Bu dosya türü desteklenmiyor.",
	finderTitle: "Ortam Kütüphanesi",
	library: "Kütüphane",
	upload: "Yükle",
	search: "Medya ara...",
	allFolders: "Tüm dosyalar",
	rootFolder: "Ana klasör",
	newFolder: "Yeni klasör",
	folderName: "Klasör adı",
	deleteFolder: "Klasörü sil",
	deleteFolderConfirm: "Klasör silinsin mi? (Sadece boş klasörler silinebilir)",
	moveTo: "Taşı",
	emptyLibrary: "Henüz medya yok",
	noResults: "Sonuç bulunamadı",
	loadMore: "Daha fazla",
	loading: "Yükleniyor...",
	loadFailed: "Medya yüklenemedi.",
	retry: "Tekrar dene",
	dropHere: "Dosyaları sürükleyip bırakın, yapıştırın ya da tıklayın",
	dropHint: "{types} (en fazla {max} MB)",
	altRequired: "ALT metni (zorunlu)",
	altForArticle: "ALT metni (bu içerik için)",
	uploadFiles: "{n} dosya yükle",
	insertImage: "Görseli ekle",
	insertImages: "{n} görseli ekle",
	selectFile: "Seç",
	selected: "{n} seçili",
	clearSelection: "Seçimi temizle",
	deleteSelected: "Seçilenleri sil",
	deleteConfirm: "{n} dosya kalıcı olarak silinsin mi?",
	copyUrl: "URL kopyala",
	copied: "Kopyalandı",
	details: "Ayrıntılar",
	filename: "Dosya adı",
	caption: "Alt yazı",
	dimensions: "Boyutlar",
	fileSize: "Dosya boyutu",
	uploadedAt: "Yüklenme",
	usage: "Kullanım",
	unused: "Kullanılmayanlar",
	allMedia: "Tümü",
	notUsed: "Hiçbir yerde kullanılmıyor",
	usedIn: "{n} yerde kullanılıyor",
	sortNewest: "En yeni",
	sortOldest: "En eski",
	sortName: "Ada göre",
	sortSize: "Boyuta göre",
	gridView: "Izgara görünümü",
	listView: "Liste görünümü",
	saved: "Kaydedildi",
	back: "Geri",
	draftFound: "Kaydedilmemiş bir taslak bulundu.",
	restore: "Geri yükle",
	dismiss: "Yoksay",
	toolbarLabel: "Biçimlendirme araç çubuğu",
	more: "Diğer araçlar (Shift+Alt+Z)",
	slashTitle: "Komutlar",
	slashParagraph: "Düz metin",
	slashHeading: "Bölüm başlığı",
	slashBullet: "Madde listesi",
	slashBulletHint: "Madde imli liste",
	slashOrdered: "Numaralı liste",
	slashOrderedHint: "1, 2, 3 diye sıralı",
	slashQuote: "Alıntı",
	slashQuoteHint: "Öne çıkan söz",
	slashCode: "Kod bloğu",
	slashCodeHint: "Önceden biçimlenmiş kod",
	slashTableHint: "3 × 3 tablo",
	slashImage: "Görsel",
	slashImageHint: "Kütüphaneden ya da yükleyerek",
	slashYoutubeHint: "Video göm",
	slashHrHint: "Bölüm ayırıcı",
	path: "Konum",
	formatMenu: "Biçim",
	editorLabel: "İçerik editörü"
}, S = {
	tr: x,
	en: {
		addMedia: "Add Media",
		visual: "Visual",
		source: "Code",
		sourcePlaceholder: "Write HTML here...",
		placeholder: "Start writing...",
		words: "words",
		chars: "characters",
		paragraph: "Paragraph",
		heading: "Heading",
		preformatted: "Preformatted",
		bold: "Bold (Ctrl+B)",
		italic: "Italic (Ctrl+I)",
		underline: "Underline (Ctrl+U)",
		strike: "Strikethrough (Shift+Alt+D)",
		code: "Inline code",
		superscript: "Superscript",
		subscript: "Subscript",
		localImagesDropped: "{n} image(s) from Word are on your computer and could not be pasted. Upload them with Add Media.",
		bulletList: "Bulleted list (Shift+Alt+U)",
		orderedList: "Numbered list (Shift+Alt+O)",
		blockquote: "Blockquote (Shift+Alt+Q)",
		alignLeft: "Align left (Shift+Alt+L)",
		alignCenter: "Align center (Shift+Alt+C)",
		alignRight: "Align right (Shift+Alt+R)",
		alignJustify: "Justify (Shift+Alt+J)",
		link: "Insert link (Ctrl+K)",
		unlink: "Remove link (Shift+Alt+S)",
		table: "Insert table",
		tableMenu: "Table",
		tableAddRowBefore: "Add row above",
		tableAddRowAfter: "Add row below",
		tableAddColBefore: "Add column left",
		tableToggleHeaderCol: "Toggle header column",
		tableCellBg: "Cell background",
		tableToolbar: "Table tools",
		tableAddColAfter: "Add column right",
		tableDeleteRow: "Delete row",
		tableDeleteCol: "Delete column",
		tableToggleHeader: "Toggle header row",
		tableMerge: "Merge / split cells",
		tableDelete: "Delete table",
		toolbarToggle: "Toolbar toggle (Shift+Alt+Z)",
		fullscreen: "Fullscreen",
		exitFullscreen: "Exit fullscreen",
		hr: "Horizontal line",
		textColor: "Text color",
		bgColor: "Background color",
		removeColor: "Remove color",
		recentColors: "Recent",
		customColor: "Custom color",
		removeFormat: "Clear formatting",
		specialChars: "Special characters",
		outdent: "Decrease indent",
		indent: "Increase indent",
		undo: "Undo (Ctrl+Z)",
		redo: "Redo (Ctrl+Y)",
		help: "Keyboard shortcuts (Shift+Alt+H)",
		image: "Insert image (Shift+Alt+M)",
		youtube: "Insert YouTube video",
		youtubePrompt: "YouTube URL",
		youtubeInvalid: "Enter a valid YouTube URL.",
		urlPlaceholder: "Paste URL",
		apply: "Apply",
		advanced: "Link options",
		openLink: "Open link in new tab",
		linkTitle: "Insert Link",
		linkUrl: "URL",
		linkText: "Link text",
		linkTitleAttr: "Title",
		linkNewTab: "Open in new tab",
		linkNofollow: "Add nofollow",
		linkSponsored: "Add sponsored",
		linkInvalid: "This link type is not allowed.",
		cancel: "Cancel",
		save: "Save",
		close: "Close",
		insert: "Insert",
		delete: "Delete",
		edit: "Edit",
		shortcutsTitle: "Keyboard shortcuts",
		shortcutsCtrl: "Default shortcuts, Ctrl + letter:",
		shortcutsShiftAlt: "Additional shortcuts, Shift + Alt + letter:",
		shortcutsMarkdown: "Formatting shortcuts (line start + space):",
		imageSettings: "Image Settings",
		imageAlt: "Alt text",
		imageAltPlaceholder: "Describe the image...",
		imageTitle: "Title / caption",
		imageDecorative: "Decorative image (screen readers skip it, no alt needed)",
		captionPlaceholder: "Text shown below the image",
		imageAlign: "Alignment",
		alignNone: "None",
		left: "Left",
		center: "Center",
		right: "Right",
		size: "Size",
		sizeAuto: "Auto",
		sizeCustom: "Custom size",
		width: "Width",
		height: "Height",
		uploading: "Uploading...",
		uploadFailed: "Upload failed",
		uploadNotConfigured: "Image upload is not configured.",
		tooLarge: "File is too large (max {max} MB).",
		badType: "This file type is not supported.",
		finderTitle: "Media Library",
		library: "Library",
		upload: "Upload",
		search: "Search media...",
		allFolders: "All files",
		rootFolder: "Root",
		newFolder: "New folder",
		folderName: "Folder name",
		deleteFolder: "Delete folder",
		deleteFolderConfirm: "Delete this folder? (Only empty folders can be deleted)",
		moveTo: "Move",
		emptyLibrary: "No media yet",
		noResults: "No results",
		loadMore: "Load more",
		loading: "Loading...",
		loadFailed: "Could not load media.",
		retry: "Retry",
		dropHere: "Drop files, paste, or click to upload",
		dropHint: "{types} (max {max} MB)",
		altRequired: "Alt text (required)",
		altForArticle: "Alt text (for this content)",
		uploadFiles: "Upload {n} files",
		insertImage: "Insert image",
		insertImages: "Insert {n} images",
		selectFile: "Select",
		selected: "{n} selected",
		clearSelection: "Clear selection",
		deleteSelected: "Delete selected",
		deleteConfirm: "Permanently delete {n} files?",
		copyUrl: "Copy URL",
		copied: "Copied",
		details: "Details",
		filename: "File name",
		caption: "Caption",
		dimensions: "Dimensions",
		fileSize: "File size",
		uploadedAt: "Uploaded",
		usage: "Usage",
		unused: "Unused",
		allMedia: "All",
		notUsed: "Not used anywhere",
		usedIn: "Used in {n} places",
		sortNewest: "Newest",
		sortOldest: "Oldest",
		sortName: "Name",
		sortSize: "Size",
		gridView: "Grid view",
		listView: "List view",
		saved: "Saved",
		back: "Back",
		draftFound: "An unsaved draft was found.",
		restore: "Restore",
		dismiss: "Dismiss",
		toolbarLabel: "Formatting toolbar",
		more: "More tools (Shift+Alt+Z)",
		slashTitle: "Commands",
		slashParagraph: "Plain text",
		slashHeading: "Section heading",
		slashBullet: "Bulleted list",
		slashBulletHint: "Simple bulleted list",
		slashOrdered: "Numbered list",
		slashOrderedHint: "Ordered 1, 2, 3",
		slashQuote: "Quote",
		slashQuoteHint: "Capture a quote",
		slashCode: "Code block",
		slashCodeHint: "Preformatted code",
		slashTableHint: "3 × 3 table",
		slashImage: "Image",
		slashImageHint: "From library or upload",
		slashYoutubeHint: "Embed a video",
		slashHrHint: "Section divider",
		path: "Path",
		formatMenu: "Format",
		editorLabel: "Content editor"
	}
};
function C() {
	return typeof document > "u" ? "en" : (document.documentElement.lang || (typeof navigator < "u" ? navigator.language : "") || "").toLowerCase().startsWith("tr") ? "tr" : "en";
}
function w(e) {
	return e ? typeof e == "string" ? S[e] ?? x : {
		...x,
		...e
	} : S[C()];
}
function T(e, t) {
	return e.replace(/\{(\w+)\}/g, (e, n) => String(t[n] ?? ""));
}
//#endregion
//#region src/icons.ts
var E = (e, t = 20, n = "0 0 24 24") => `<svg width="${t}" height="${t}" viewBox="${n}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${e}</svg>`, D = (e, t = 20, n = "0 0 24 24") => `<svg width="${t}" height="${t}" viewBox="${n}" fill="currentColor" aria-hidden="true" focusable="false">${e}</svg>`, O = {
	bold: D("<path d=\"M14.6 11.8c.9-.6 1.4-1.4 1.4-2.3 0-2-1.6-3.5-3.5-3.5H7v12h6.3c1.7 0 3.2-1.5 3.2-3.3 0-1.3-.8-2.4-1.9-2.9ZM9.5 8h2.8a1.5 1.5 0 1 1 0 3H9.4V8Zm3.3 8H9.4v-3h3.3a1.5 1.5 0 1 1 0 3Z\"/>"),
	italic: D("<path d=\"M10 6v2h2.6l-3.7 8H6v2h8v-2h-2.6l3.7-8H18V6z\"/>"),
	underline: D("<path d=\"M12 16a5 5 0 0 0 5-5V4h-2.5v7a2.5 2.5 0 0 1-5 0V4H7v7a5 5 0 0 0 5 5Zm-5 2v2h10v-2H7Z\"/>"),
	strikethrough: E("<line x1=\"4\" y1=\"12\" x2=\"20\" y2=\"12\"/><path d=\"M17.5 7.5c0-2-1.5-3.5-3.5-3.5H10c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5h4c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5H10c-2 0-3.5-1.5-3.5-3.5\"/>"),
	code: E("<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>"),
	link: D("<path d=\"M312.5 199.6a116 116 0 0 0-20.1-16.1 119.5 119.5 0 0 0-64.4-18.9 119 119 0 0 0-84.5 35L35 308.2a119.5 119.5 0 0 0-35 84.3c0 66 53.4 119.5 119.4 119.5 32.5 0 62-12.8 84.4-34.8l89.6-89.6a8.5 8.5 0 0 0-6.1-14.6h-3.4a143.6 143.6 0 0 1-54.6-10.6 8.5 8.5 0 0 0-9.3 1.9l-64.4 64.5c-20 20-52.5 20-72.5 0s-20-52.4 0-72.4l109-108.9c20-20 52.4-20 72.4 0 13.5 12.7 34.5 12.7 48 0a34.1 34.1 0 0 0 9.9-21.7 34.1 34.1 0 0 0-9.9-26.3z\"/><path d=\"M477.1 35c-46.7-46.7-122.3-46.7-169 0l-89.5 89.4a8.5 8.5 0 0 0 6.2 14.6h3.2a143.4 143.4 0 0 1 54.5 10.7 8.5 8.5 0 0 0 9.3-1.9l64.3-64.2c20-20 52.4-20 72.4 0s20 52.5 0 72.5l-80 80-.7.7-28 27.8c-20 20-52.4 20-72.4 0-13.5-12.7-34.5-12.7-48 0a34.1 34.1 0 0 0 0 48.1 118.4 118.4 0 0 0 34.1 23.9l5.4 2.3 5.5 2a68 68 0 0 0 5.4 1.8l5 1.4c3.4.8 6.8 1.5 10.3 2.1 4.2.6 8.5 1 12.7 1.2h7.3l5.1-.6c1.9-.1 3.8-.5 6.1-.5h2.9l5.9-.9 2.7-.5 5-1h.9a119.5 119.5 0 0 0 55.4-31.4l108.6-108.6c46.7-46.7 46.7-122.3 0-169z\"/>", 18, "0 0 512 512"),
	unlink: E("<path d=\"m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71\"/><path d=\"m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"5\"/><line x1=\"2\" y1=\"8\" x2=\"5\" y2=\"8\"/><line x1=\"16\" y1=\"19\" x2=\"16\" y2=\"22\"/><line x1=\"19\" y1=\"16\" x2=\"22\" y2=\"16\"/>"),
	bulletList: E("<line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/>"),
	orderedList: E("<line x1=\"10\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"10\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"10\" y1=\"18\" x2=\"21\" y2=\"18\"/><path d=\"M4 6h1v4\"/><path d=\"M4 10h2\"/><path d=\"M6 18H4c0-1 2-2 2-3s-1-1.5-2-1\"/>"),
	quote: E("<path d=\"M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z\"/><path d=\"M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z\"/>"),
	alignLeft: E("<line x1=\"17\" y1=\"10\" x2=\"3\" y2=\"10\"/><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"/><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"/><line x1=\"17\" y1=\"18\" x2=\"3\" y2=\"18\"/>"),
	alignCenter: E("<line x1=\"18\" y1=\"10\" x2=\"6\" y2=\"10\"/><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"/><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"/><line x1=\"18\" y1=\"18\" x2=\"6\" y2=\"18\"/>"),
	alignRight: E("<line x1=\"21\" y1=\"10\" x2=\"7\" y2=\"10\"/><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"/><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"/><line x1=\"21\" y1=\"18\" x2=\"7\" y2=\"18\"/>"),
	alignJustify: E("<line x1=\"21\" y1=\"10\" x2=\"3\" y2=\"10\"/><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"/><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"/><line x1=\"21\" y1=\"18\" x2=\"3\" y2=\"18\"/>"),
	alignNone: E("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"9\" y1=\"3\" x2=\"9\" y2=\"21\" opacity=\"0.4\"/><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\" opacity=\"0.4\"/>"),
	table: D("<path d=\"M55.46 2.5H8.54a6 6 0 0 0-6 6v46.96a6 6 0 0 0 6 6h46.92a6 6 0 0 0 6-6V8.54a6 6 0 0 0-6-6.04zm-34.29 56H8.54a3 3 0 0 1-3-3v-5.2h15.63zm0-11.2H5.5v-8.2h15.67zm0-11.2H5.5v-8.2h15.67zm0-11.2H5.5v-8.2h15.67zm18.66 33.6H24.17v-8.2h15.66zm0-11.2H24.17v-8.2h15.66zm0-11.2H24.17v-8.2h15.66zm0-11.2H24.17v-8.2h15.66zM58.5 55.46a3 3 0 0 1-3 3H42.83V50.3H58.5zm0-8.16H42.83v-8.2H58.5zm0-11.2H42.83v-8.2H58.5zm0-11.2H42.83v-8.2H58.5z\"/>", 18, "0 0 64 64"),
	toolbarToggle: D("<path d=\"M30 6v5c0 2.2-1.8 4-4 4h-5c-2.2 0-4-1.8-4-4V6c0-2.2 1.8-4 4-4h5c2.2 0 4 1.8 4 4zM11 17H6c-2.2 0-4 1.8-4 4v5c0 2.2 1.8 4 4 4h5c2.2 0 4-1.8 4-4v-5c0-2.2-1.8-4-4-4zm18 9H18a1 1 0 1 0 0 2h11a1 1 0 1 0 0-2zM11 2H6C3.8 2 2 3.8 2 6v5c0 2.2 1.8 4 4 4h5c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4zm18 20H18a1 1 0 1 0 0 2h11a1 1 0 1 0 0-2zm0-4H18a1 1 0 1 0 0 2h11a1 1 0 1 0 0-2z\"/>", 18, "0 0 32 32"),
	textColor: (e) => `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M11 2 5.5 16h2.2l1.1-3h6.4l1.1 3h2.2L13 2h-2Zm-1.3 9L12 4.8 14.3 11H9.7Z"/><rect fill="${e}" x="4" y="18" width="16" height="3" rx="0.5"/></svg>`,
	bgColor: (e) => `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m19.4 7.6-3-3a1 1 0 0 0-1.4 0L5.3 14.3a1 1 0 0 0-.3.7v3a1 1 0 0 0 1 1h3a1 1 0 0 0 .7-.3L19.4 9a1 1 0 0 0 0-1.4ZM8.6 17H7v-1.6l8-8L16.6 9l-8 8Z"/><rect fill="${e}" x="4" y="18" width="16" height="3" rx="0.5"/></svg>`,
	omega: D("<path d=\"M4 19h4.5v-2H6.8c.8-1.1 1.2-2.5 1.2-4 0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.5.4 2.9 1.2 4h-1.7v2H24v-2h-2.3c-.5-.9-.7-1.9-.7-3 0-4.4-3.6-8-8-8s-8 3.6-8 8c0 1.1-.2 2.1-.7 3H2v2h2Z\"/>"),
	hr: E("<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/>"),
	removeFormat: E("<path d=\"M4 7V4h16v3\"/><path d=\"M9 20h6\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/><line x1=\"17\" y1=\"4\" x2=\"7\" y2=\"20\" opacity=\"0.5\"/>"),
	outdent: E("<polyline points=\"7 8 3 12 7 16\"/><line x1=\"21\" y1=\"12\" x2=\"11\" y2=\"12\"/><line x1=\"21\" y1=\"6\" x2=\"11\" y2=\"6\"/><line x1=\"21\" y1=\"18\" x2=\"11\" y2=\"18\"/>"),
	indent: E("<polyline points=\"3 8 7 12 3 16\"/><line x1=\"21\" y1=\"12\" x2=\"11\" y2=\"12\"/><line x1=\"21\" y1=\"6\" x2=\"11\" y2=\"6\"/><line x1=\"21\" y1=\"18\" x2=\"11\" y2=\"18\"/>"),
	undo: D("<path d=\"M6.4 8H12a6 6 0 0 1 0 12H8v-2h4a4 4 0 0 0 0-8H6.4l2.3 2.3-1.4 1.4L3 9.3l4.3-4.6 1.4 1.4L6.4 8Z\"/>"),
	redo: D("<path d=\"M17.6 8H12a6 6 0 0 0 0 12h4v-2h-4a4 4 0 0 1 0-8h5.6l-2.3 2.3 1.4 1.4L21 9.3l-4.3-4.6-1.4 1.4L17.6 8Z\"/>"),
	help: E("<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/>"),
	maximize: E("<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/>"),
	minimize: E("<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" y1=\"10\" x2=\"21\" y2=\"3\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/>"),
	eye: E("<path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", 14),
	codeSmall: E("<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>", 14),
	image: E("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21 15-5-5L5 21\"/>"),
	imagePlus: E("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21 15-5-5L5 21\"/>", 16),
	imageBig: E("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21 15-5-5L5 21\"/>", 48),
	youtube: E("<path d=\"M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17\"/><path d=\"m10 15 5-3-5-3z\"/>"),
	enter: E("<polyline points=\"9 10 4 15 9 20\"/><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"/>", 16),
	settings: E("<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42\"/>", 16),
	external: E("<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>", 16),
	pencil: E("<path d=\"M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\"/>", 16),
	x: E("<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>", 16),
	check: E("<polyline points=\"20 6 9 17 4 12\"/>", 14),
	upload: E("<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17,8 12,3 7,8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/>", 16),
	uploadBig: E("<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17,8 12,3 7,8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/>", 40),
	search: E("<circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/>", 16),
	folder: E("<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>", 16),
	folderPlus: E("<path d=\"M12 10v6\"/><path d=\"M9 13h6\"/><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>", 16),
	grid: E("<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/>", 16),
	list: E("<line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/>", 16),
	trash: E("<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", 16),
	copy: E("<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"/>", 16),
	superscript: E("<path d=\"m4 19 8-8\"/><path d=\"m12 19-8-8\"/><path d=\"M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06\"/>"),
	subscript: E("<path d=\"m4 5 8 8\"/><path d=\"m12 5-8 8\"/><path d=\"M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07\"/>"),
	rowAbove: E("<rect x=\"3\" y=\"11\" width=\"18\" height=\"10\" rx=\"1.5\"/><line x1=\"3\" y1=\"16\" x2=\"21\" y2=\"16\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"8\"/><line x1=\"9\" y1=\"5\" x2=\"15\" y2=\"5\"/>"),
	rowBelow: E("<rect x=\"3\" y=\"3\" width=\"18\" height=\"10\" rx=\"1.5\"/><line x1=\"3\" y1=\"8\" x2=\"21\" y2=\"8\"/><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"22\"/><line x1=\"9\" y1=\"19\" x2=\"15\" y2=\"19\"/>"),
	colLeft: E("<rect x=\"11\" y=\"3\" width=\"10\" height=\"18\" rx=\"1.5\"/><line x1=\"16\" y1=\"3\" x2=\"16\" y2=\"21\"/><line x1=\"2\" y1=\"12\" x2=\"8\" y2=\"12\"/><line x1=\"5\" y1=\"9\" x2=\"5\" y2=\"15\"/>"),
	colRight: E("<rect x=\"3\" y=\"3\" width=\"10\" height=\"18\" rx=\"1.5\"/><line x1=\"8\" y1=\"3\" x2=\"8\" y2=\"21\"/><line x1=\"16\" y1=\"12\" x2=\"22\" y2=\"12\"/><line x1=\"19\" y1=\"9\" x2=\"19\" y2=\"15\"/>"),
	rowDelete: E("<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"1.5\"/><line x1=\"9\" y1=\"10\" x2=\"15\" y2=\"14\"/><line x1=\"15\" y1=\"10\" x2=\"9\" y2=\"14\"/>"),
	colDelete: E("<rect x=\"7\" y=\"3\" width=\"10\" height=\"18\" rx=\"1.5\"/><line x1=\"10\" y1=\"9\" x2=\"14\" y2=\"15\"/><line x1=\"14\" y1=\"9\" x2=\"10\" y2=\"15\"/>"),
	merge: E("<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"1.5\"/><path d=\"M8 12h8\"/><path d=\"m6 10 2 2-2 2\"/><path d=\"m18 10-2 2 2 2\"/>"),
	headerRow: E("<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"1.5\"/><rect x=\"3\" y=\"4\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"currentColor\" stroke=\"none\" opacity=\".35\"/><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"20\"/>"),
	headerCol: E("<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"1.5\"/><rect x=\"3\" y=\"4\" width=\"6\" height=\"16\" rx=\"1.5\" fill=\"currentColor\" stroke=\"none\" opacity=\".35\"/><line x1=\"9\" y1=\"4\" x2=\"9\" y2=\"20\"/><line x1=\"9\" y1=\"12\" x2=\"21\" y2=\"12\"/>"),
	sort: E("<path d=\"m3 16 4 4 4-4\"/><path d=\"M7 20V4\"/><path d=\"M11 4h10\"/><path d=\"M11 8h7\"/><path d=\"M11 12h4\"/>", 16),
	filter: E("<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"/>", 16),
	folderMove: E("<path d=\"M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2\"/><path d=\"m8 16 3-3-3-3\"/><path d=\"M2 13h9\"/>", 16),
	more: D("<circle cx=\"5\" cy=\"12\" r=\"1.8\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\"/><circle cx=\"19\" cy=\"12\" r=\"1.8\"/>"),
	linkSmall: E("<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>", 16),
	info: E("<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"/>", 16),
	checkBig: E("<polyline points=\"20 6 9 17 4 12\"/>", 18),
	close: E("<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>", 18),
	chevronLeft: E("<polyline points=\"15 18 9 12 15 6\"/>", 16),
	chevronDown: E("<polyline points=\"6 9 12 15 18 9\"/>", 14),
	file: E("<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\"/><polyline points=\"14 2 14 8 20 8\"/>", 32)
};
//#endregion
//#region src/ui/components.ts
function k(e, t = {}, ...n) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) n != null && n !== !1 && (e === "class" ? r.className = n : e === "html" ? r.innerHTML = n : e === "style" && typeof n == "object" ? Object.assign(r.style, n) : e.startsWith("on") && typeof n == "function" ? r.addEventListener(e.slice(2).toLowerCase(), n) : e in r && typeof n != "string" ? r[e] = n : r.setAttribute(e, n === !0 ? "" : String(n)));
	for (let e of n) e != null && e !== !1 && r.append(e);
	return r;
}
var A = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])", j = [], M = class {
	constructor(e) {
		this.opts = e, this.overlay = null, this.dialog = null, this.bodyEl = null, this.isOpen = !1, this.prevFocus = null, this.onKeyDown = (e) => {
			if (j[j.length - 1] === this) {
				if (e.key === "Escape") e.preventDefault(), e.stopPropagation(), this.close();
				else if (e.key === "Tab" && this.dialog) {
					let t = Array.from(this.dialog.querySelectorAll(A)).filter((e) => e.offsetParent !== null);
					if (!t.length) return;
					let n = t[0], r = t[t.length - 1];
					e.shiftKey && document.activeElement === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n.focus());
				}
			}
		};
	}
	open(e) {
		if (this.isOpen) return this;
		this.isOpen = !0, this.prevFocus = document.activeElement;
		let t = "zoro-dlg-" + Math.random().toString(36).slice(2, 8);
		this.overlay = k("div", { class: `zoro-root zoro-dialog-overlay ${this.opts.themeClass ?? ""}` }), this.overlay.addEventListener("mousedown", (e) => {
			e.target === this.overlay && this.close();
		}), this.dialog = k("div", {
			class: `zoro-dialog zoro-dialog-${this.opts.size ?? "md"}`,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": t
		});
		let n = k("div", { class: "zoro-dialog-header" }, k("h3", {
			class: "zoro-dialog-title",
			id: t
		}, this.opts.title), k("button", {
			type: "button",
			class: "zoro-dialog-close",
			"aria-label": this.opts.closeLabel ?? "Kapat",
			title: this.opts.closeLabel ?? "Kapat",
			html: "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>",
			onclick: () => this.close()
		}));
		return this.bodyEl = k("div", { class: "zoro-dialog-body" }), this.setBody(e), this.dialog.append(n, this.bodyEl), this.overlay.appendChild(this.dialog), document.body.appendChild(this.overlay), document.body.classList.add("zoro-scroll-lock"), j.push(this), this.dialog.addEventListener("keydown", this.onKeyDown), requestAnimationFrame(() => {
			(this.bodyEl?.querySelector("input:not([type=hidden]),textarea,select") ?? this.dialog?.querySelector(A))?.focus();
		}), this;
	}
	setBody(e) {
		this.bodyEl && (this.bodyEl.innerHTML = "", typeof e == "string" ? this.bodyEl.innerHTML = e : this.bodyEl.appendChild(e));
	}
	addFooter(e) {
		if (!this.dialog) return;
		this.dialog.querySelector(".zoro-dialog-footer")?.remove();
		let t = k("div", { class: "zoro-dialog-footer" }, e);
		return this.dialog.appendChild(t), t;
	}
	close() {
		if (!this.isOpen) return;
		this.isOpen = !1;
		let e = j.indexOf(this);
		e >= 0 && j.splice(e, 1), j.length || document.body.classList.remove("zoro-scroll-lock"), this.overlay?.remove(), this.overlay = this.dialog = this.bodyEl = null, this.prevFocus instanceof HTMLElement && document.contains(this.prevFocus) && this.prevFocus.focus({ preventScroll: !0 }), this.opts.onClose?.();
	}
}, N = class {
	constructor(e = "", t) {
		this.themeClass = e, this.onClose = t, this.el = null, this.isOpen = !1, this.anchor = null, this.onOutside = (e) => {
			let t = e.target;
			this.el?.contains(t) || this.anchor?.contains(t) || this.close();
		}, this.onKey = (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), this.close());
		}, this.onViewportChange = (e) => {
			e.type === "scroll" && this.el?.contains(e.target) || this.anchor && document.contains(this.anchor) && this.position(this.anchor.getBoundingClientRect());
		};
	}
	open(e, t, n = "") {
		return this.close(), this.isOpen = !0, this.anchor = t instanceof Element ? t : null, this.el = k("div", {
			class: `zoro-root zoro-popover ${n} ${this.themeClass}`,
			role: "dialog"
		}, e), document.body.appendChild(this.el), this.position(t instanceof Element ? t.getBoundingClientRect() : t), clearTimeout(this.listenTimer), this.listenTimer = setTimeout(() => {
			this.isOpen && (document.addEventListener("pointerdown", this.onOutside, !0), document.addEventListener("keydown", this.onKey, !0), window.addEventListener("resize", this.onViewportChange), window.addEventListener("scroll", this.onViewportChange, !0));
		}, 0), this.el;
	}
	position(e) {
		if (!this.el) return;
		let t = document.documentElement.clientWidth, n = window.innerHeight, r = this.el.getBoundingClientRect(), i = e.bottom + 6, a = e.left + e.width / 2 - r.width / 2;
		e.width < 60 && (a = e.left), a = Math.max(8, Math.min(a, t - r.width - 8)), i + r.height > n - 8 && e.top - r.height - 6 > 8 && (i = e.top - r.height - 6), this.el.style.top = `${Math.max(8, i)}px`, this.el.style.left = `${a}px`;
	}
	close() {
		this.isOpen && (this.isOpen = !1, clearTimeout(this.listenTimer), document.removeEventListener("pointerdown", this.onOutside, !0), document.removeEventListener("keydown", this.onKey, !0), window.removeEventListener("resize", this.onViewportChange), window.removeEventListener("scroll", this.onViewportChange, !0), this.el?.remove(), this.el = null, this.onClose?.());
	}
}, ee = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"20 6 9 17 4 12\"/></svg>", te = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"6 9 12 15 18 9\"/></svg>", P = class {
	constructor(e) {
		this.opts = e, this.dropdown = null, this.activeIndex = -1, this.isOpen = !1, this.onOutside = (e) => {
			this.wrapper.contains(e.target) || this.close();
		}, this.onScrollClose = (e) => {
			e.type === "scroll" && this.dropdown?.contains(e.target) || this.close();
		};
	}
	get value() {
		return this.opts.value;
	}
	render() {
		let e = this.opts.variant === "field";
		return this.trigger = k("button", {
			type: "button",
			class: e ? `zoro-select-field${this.opts.size === "sm" ? " sm" : ""}` : "zoro-select-trigger",
			"aria-haspopup": "listbox",
			"aria-expanded": "false",
			"aria-label": this.opts.label
		}), e || this.trigger.addEventListener("mousedown", (e) => e.preventDefault()), this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open()), this.trigger.addEventListener("keydown", (e) => {
			!this.isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") ? (e.preventDefault(), this.open()) : this.isOpen && this.onKey(e);
		}), this.wrapper = k("div", { class: "zoro-select-wrapper" + (e ? " zoro-select-wrapper-field" : "") }, this.trigger), this.updateTrigger(), this.wrapper;
	}
	setValue(e) {
		this.opts.value !== e && (this.opts.value = e, this.updateTrigger());
	}
	setItems(e) {
		this.opts.items = e, this.updateTrigger(), this.isOpen && (this.close(), this.open());
	}
	current() {
		return this.opts.items.find((e) => e.value === this.opts.value);
	}
	updateTrigger() {
		if (!this.trigger) return;
		let e = this.current(), t = this.opts.variant === "field";
		this.trigger.innerHTML = "";
		let n = e?.icon ?? this.opts.icon;
		t && n && this.trigger.append(k("span", {
			class: "zoro-select-icon",
			html: n
		}));
		let r = e?.label ?? this.opts.placeholder ?? this.opts.items[0]?.label ?? "";
		this.trigger.append(k("span", { class: "zoro-select-label" + (!e && this.opts.placeholder ? " placeholder" : "") }, r)), t && this.trigger.append(k("span", {
			class: "zoro-select-chevron",
			html: te
		}));
	}
	open() {
		if (this.isOpen) return;
		this.isOpen = !0;
		let e = this.opts.variant === "field";
		this.trigger.setAttribute("aria-expanded", "true"), this.dropdown = k("div", {
			class: "zoro-select-dropdown" + (e ? " zoro-select-dropdown-field" : ""),
			role: "listbox"
		}), this.opts.items.forEach((t, n) => {
			let r = t.value === this.opts.value, i = k("span", { class: "zoro-format-text" }, t.label);
			t.style && Object.assign(i.style, t.style);
			let a = k("div", {
				class: "zoro-select-option" + (r ? " active" : ""),
				role: "option",
				"aria-selected": String(r),
				style: t.depth ? { paddingLeft: `${10 + t.depth * 16}px` } : void 0
			}, t.icon ? k("span", {
				class: "zoro-select-icon",
				html: t.icon
			}) : null, i, t.meta ? k("span", { class: "zoro-select-meta" }, t.meta) : null, t.shortcut ? k("span", { class: "zoro-select-shortcut" }, t.shortcut) : null, e ? k("span", {
				class: "zoro-select-check",
				html: r ? ee : ""
			}) : null);
			a.addEventListener("mousedown", (e) => e.preventDefault()), a.addEventListener("click", () => this.choose(n)), a.addEventListener("mouseenter", () => {
				this.activeIndex = n, this.highlight(!1);
			}), this.dropdown.appendChild(a);
		}), this.wrapper.appendChild(this.dropdown);
		let t = this.trigger.getBoundingClientRect(), n = this.dropdown;
		n.style.position = "fixed", e && (n.style.minWidth = `${Math.max(t.width, 180)}px`), n.style.top = `${t.bottom + 4}px`, n.style.left = `${Math.max(8, Math.min(t.left, document.documentElement.clientWidth - n.offsetWidth - 8))}px`;
		let r = window.innerHeight - t.bottom - 12;
		r < Math.min(n.offsetHeight, 260) && t.top > r && (n.style.top = "auto", n.style.bottom = `${window.innerHeight - t.top + 4}px`), window.addEventListener("scroll", this.onScrollClose, !0), window.addEventListener("resize", this.onScrollClose), this.activeIndex = Math.max(0, this.opts.items.findIndex((e) => e.value === this.opts.value)), this.highlight(), setTimeout(() => {
			this.isOpen && document.addEventListener("pointerdown", this.onOutside, !0);
		}, 0);
	}
	close() {
		this.isOpen && (this.isOpen = !1, this.trigger.setAttribute("aria-expanded", "false"), document.removeEventListener("pointerdown", this.onOutside, !0), window.removeEventListener("scroll", this.onScrollClose, !0), window.removeEventListener("resize", this.onScrollClose), this.dropdown?.remove(), this.dropdown = null);
	}
	choose(e) {
		let t = this.opts.items[e];
		t && (this.close(), this.opts.resetAfterChange ? (this.trigger.focus(), this.opts.onChange(t.value)) : (this.opts.value = t.value, this.updateTrigger(), this.opts.onChange(t.value)));
	}
	highlight(e = !0) {
		this.dropdown?.querySelectorAll(".zoro-select-option").forEach((t, n) => {
			t.classList.toggle("focused", n === this.activeIndex), e && n === this.activeIndex && t.scrollIntoView?.({ block: "nearest" });
		});
	}
	onKey(e) {
		let t = this.opts.items.length;
		e.key === "ArrowDown" ? (e.preventDefault(), this.activeIndex = (this.activeIndex + 1) % t, this.highlight()) : e.key === "ArrowUp" ? (e.preventDefault(), this.activeIndex = (this.activeIndex - 1 + t) % t, this.highlight()) : e.key === "Home" ? (e.preventDefault(), this.activeIndex = 0, this.highlight()) : e.key === "End" ? (e.preventDefault(), this.activeIndex = t - 1, this.highlight()) : e.key === "Enter" || e.key === " " ? (e.preventDefault(), this.choose(this.activeIndex)) : e.key === "Escape" ? (e.preventDefault(), e.stopPropagation(), this.close()) : e.key === "Tab" && this.close();
	}
	destroy() {
		this.close();
	}
}, ne = class {
	constructor(e) {
		this.opts = e, this.buttons = {}, this.panels = {};
	}
	render() {
		let e = k("div", {
			class: "zoro-tabs-list",
			role: "tablist"
		});
		this.container = k("div", { class: "zoro-tabs" }, e);
		for (let t of this.opts.tabs) {
			let n = k("button", {
				type: "button",
				class: "zoro-tab" + (t.id === this.opts.active ? " active" : ""),
				role: "tab",
				"aria-selected": String(t.id === this.opts.active),
				html: (t.icon ?? "") + `<span>${t.label}</span>`,
				onclick: () => this.setActive(t.id)
			});
			this.buttons[t.id] = n, e.appendChild(n);
			let r = k("div", {
				class: "zoro-tab-content" + (t.id === this.opts.active ? " active" : ""),
				role: "tabpanel"
			});
			this.panels[t.id] = r, this.container.appendChild(r);
		}
		return this.container;
	}
	setActive(e) {
		if (!this.panels[e]) return;
		let t = this.opts.active !== e;
		this.opts.active = e;
		for (let [t, n] of Object.entries(this.buttons)) n.classList.toggle("active", t === e), n.setAttribute("aria-selected", String(t === e));
		for (let [t, n] of Object.entries(this.panels)) n.classList.toggle("active", t === e);
		t && this.opts.onChange?.(e);
	}
	get active() {
		return this.opts.active;
	}
	panel(e) {
		return this.panels[e];
	}
};
function F(e, t = "info", n = "", r = 2600) {
	let i = document.querySelector(".zoro-toast-host");
	i || (i = k("div", {
		class: "zoro-root zoro-toast-host",
		"aria-live": "polite"
	}), document.body.appendChild(i)), n && (i.className = `zoro-root zoro-toast-host ${n}`);
	let a = k("div", {
		class: `zoro-toast zoro-toast-${t}`,
		role: t === "error" ? "alert" : "status"
	}, e);
	i.appendChild(a);
	let o = !1, s = () => {
		o || (o = !0, a.classList.add("leaving"), setTimeout(() => a.remove(), 200));
	};
	return r > 0 && setTimeout(s, r), s;
}
function re(e, t) {
	return new Promise((n) => {
		let r = !1, i = new M({
			title: t.title,
			size: "sm",
			themeClass: t.themeClass,
			closeLabel: t.cancel,
			onClose: () => n(r)
		});
		i.open(k("p", { class: "zoro-confirm-text" }, e)), i.addFooter(k("div", { class: "zoro-btn-row" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => i.close()
		}, t.cancel), k("button", {
			type: "button",
			class: `zoro-btn ${t.danger ? "zoro-btn-danger" : "zoro-btn-primary"}`,
			onclick: () => {
				r = !0, i.close();
			}
		}, t.ok)));
	});
}
function ie(e) {
	return new Promise((t) => {
		let n = null, r = k("input", {
			type: "text",
			class: "zoro-input",
			value: e.value ?? "",
			placeholder: e.placeholder ?? ""
		}), i = k("p", {
			class: "zoro-field-error",
			role: "alert"
		}), a = new M({
			title: e.title,
			size: "sm",
			themeClass: e.themeClass,
			closeLabel: e.cancel,
			onClose: () => t(n)
		}), o = () => {
			let t = r.value.trim(), o = e.validate?.(t) ?? null;
			o ? i.textContent = o : (n = t, a.close());
		};
		r.addEventListener("keydown", (e) => {
			e.key === "Enter" && (e.preventDefault(), o());
		}), a.open(k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, e.label), r, i)), a.addFooter(k("div", { class: "zoro-btn-row" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => a.close()
		}, e.cancel), k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-primary",
			onclick: o
		}, e.ok)));
	});
}
var ae = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
function oe(e) {
	let t = /^(.*?)\s*\(([^()]*(?:Ctrl|Alt|Shift|⌘)[^()]*)\)\s*$/.exec(e);
	if (!t) return {
		label: e,
		keys: ""
	};
	let n = t[2];
	return ae && (n = n.replace(/Ctrl\+/g, "⌘").replace(/Shift\+/g, "⇧").replace(/Alt\+/g, "⌥")), {
		label: t[1],
		keys: n
	};
}
var I = null, se, ce = 0, le = null;
function L() {
	clearTimeout(se), I && (I.remove(), I = null, ce = Date.now()), le = null;
}
function ue(e) {
	let t = e.getAttribute("data-tip");
	if (!t || !e.isConnected) return;
	L(), le = e;
	let { label: n, keys: r } = oe(t), i = e.closest(".zoro-root");
	I = k("div", {
		class: `zoro-root zoro-tooltip ${i ? Array.from(i.classList).filter((e) => e.startsWith("zoro-skin-") || e.startsWith("zoro-theme-")).join(" ") : ""}`,
		role: "tooltip"
	}, k("span", {}, n), r ? k("kbd", {}, r) : null), document.body.append(I);
	let a = e.getBoundingClientRect(), o = I.getBoundingClientRect(), s = document.documentElement.clientWidth, c = a.bottom + 6;
	c + o.height > window.innerHeight - 4 && (c = a.top - o.height - 6), I.style.top = `${Math.round(c)}px`, I.style.left = `${Math.round(Math.max(4, Math.min(a.left + a.width / 2 - o.width / 2, s - o.width - 4)))}px`;
}
function de() {
	typeof document > "u" || document.__zoroTips || (document.__zoroTips = !0, document.addEventListener("pointerover", (e) => {
		if (e.pointerType === "touch") return;
		let t = e.target?.closest?.(".zoro-root [data-tip]");
		if (!t || t === le) return;
		clearTimeout(se);
		let n = I || Date.now() - ce < 400 ? 60 : 300;
		se = setTimeout(() => ue(t), n);
	}), document.addEventListener("pointerout", (e) => {
		let t = e.target?.closest?.("[data-tip]"), n = e.relatedTarget;
		t && (!n || !t.contains(n)) && L();
	}), document.addEventListener("focusin", (e) => {
		let t = e.target?.closest?.(".zoro-root [data-tip]");
		t && t.matches(":focus-visible") && ue(t);
	}), document.addEventListener("focusout", L), document.addEventListener("pointerdown", L, !0), document.addEventListener("keydown", (e) => {
		e.key === "Escape" && L();
	}, !0), window.addEventListener("scroll", L, !0));
}
//#endregion
//#region src/extensions/resizable-image.ts
var R = /* @__PURE__ */ new Map(), z = /* @__PURE__ */ new Map(), B = {
	get: (e) => R.get(e),
	set(e, t) {
		R.set(e, {
			progress: null,
			...R.get(e),
			...t
		}), z.get(e)?.forEach((e) => e());
	},
	delete(e) {
		R.delete(e), z.get(e)?.forEach((e) => e()), z.delete(e);
	},
	subscribe(e, t) {
		return z.has(e) || z.set(e, /* @__PURE__ */ new Set()), z.get(e).add(t), () => z.get(e)?.delete(t);
	}
}, fe = {
	none: "",
	left: "float:left;margin:0.25em 1.5em 1em 0",
	center: "display:block;margin-left:auto;margin-right:auto",
	right: "float:right;margin:0.25em 0 1em 1.5em"
};
function pe(e) {
	if (!e) return null;
	let t = parseInt(e, 10);
	return Number.isFinite(t) && t > 0 ? t : null;
}
var V = (e) => e.tagName === "FIGURE" ? e.querySelector("img") ?? e : e, H = (e) => (t) => V(t).getAttribute(e);
function me(e) {
	for (let t of [e, V(e)]) {
		let e = t.getAttribute("data-alignment");
		if (e === "left" || e === "right" || e === "center") return e;
		let n = t.className || "";
		if (/\balignleft\b/.test(n)) return "left";
		if (/\baligncenter\b/.test(n)) return "center";
		if (/\balignright\b/.test(n)) return "right";
		let r = t.style;
		if (r.float === "left") return "left";
		if (r.float === "right") return "right";
		if (r.marginLeft === "auto" && r.marginRight === "auto") return "center";
		if (r.marginLeft === "auto") return "right";
	}
	return "none";
}
function he(e) {
	return e === "none" ? {} : {
		"data-alignment": e,
		class: `align${e}`,
		style: fe[e]
	};
}
var ge = t.create({
	name: "image",
	group: "block",
	inline: !1,
	draggable: !0,
	selectable: !0,
	atom: !0,
	addOptions() {
		return {
			messages: null,
			themeClass: () => "",
			HTMLAttributes: {}
		};
	},
	addAttributes() {
		return {
			src: {
				default: null,
				parseHTML: H("src")
			},
			alt: {
				default: null,
				parseHTML: H("alt")
			},
			title: {
				default: null,
				parseHTML: H("title")
			},
			srcset: {
				default: null,
				parseHTML: H("srcset")
			},
			sizes: {
				default: null,
				parseHTML: H("sizes")
			},
			caption: {
				default: null,
				parseHTML: (e) => e.tagName === "FIGURE" && e.querySelector("figcaption")?.textContent?.trim() || null,
				rendered: !1
			},
			decorative: {
				default: !1,
				parseHTML: (e) => V(e).getAttribute("role") === "presentation" || V(e).getAttribute("alt") === "",
				rendered: !1
			},
			alignment: {
				default: "none",
				parseHTML: (e) => me(e),
				rendered: !1
			},
			width: {
				default: null,
				parseHTML: (e) => pe(V(e).getAttribute("width") || V(e).style.width),
				rendered: !1
			},
			height: {
				default: null,
				parseHTML: (e) => pe(V(e).getAttribute("height") || V(e).style.height),
				rendered: !1
			},
			uploadId: {
				default: null,
				rendered: !1,
				parseHTML: () => null
			}
		};
	},
	parseHTML() {
		return [{
			tag: "figure",
			priority: 60,
			getAttrs: (e) => e.querySelector("img[src]") ? null : !1
		}, { tag: "img[src]" }];
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		let n = e.attrs, i = n.alignment || "none", a = r(this.options.HTMLAttributes, {
			loading: "lazy",
			decoding: "async"
		}, t);
		if (n.width && (a.width = n.width), n.height && (a.height = n.height), n.decorative && (a.alt = "", a.role = "presentation"), !n.caption) return ["img", {
			...a,
			...he(i)
		}];
		let o = he(i), s = [o.style, n.width ? `width:${n.width}px;max-width:100%` : ""].filter(Boolean).join(";");
		return [
			"figure",
			{
				...o,
				class: ["wp-caption", o.class].filter(Boolean).join(" "),
				...s ? { style: s } : {}
			},
			["img", a],
			[
				"figcaption",
				{ class: "wp-caption-text" },
				n.caption
			]
		];
	},
	addCommands() {
		return {
			setImage: (e) => ({ commands: t }) => t.insertContent({
				type: this.name,
				attrs: e
			}),
			updateImageByUploadId: (e, t) => ({ tr: n, state: r, dispatch: i }) => {
				let a = !1;
				return r.doc.descendants((r, o) => a ? !1 : r.type.name === this.name && r.attrs.uploadId === e ? (a = !0, i && (t === null ? n.delete(o, o + r.nodeSize) : n.setNodeMarkup(o, void 0, {
					...r.attrs,
					...t,
					uploadId: null
				}), n.setMeta("addToHistory", !1)), !1) : !0), a;
			}
		};
	},
	addNodeView() {
		return (e) => _e(e, this.options);
	}
});
function _e(e, t) {
	let { editor: n, getPos: r } = e, i = e.node, a = t.messages, o = k("div", {
		class: "zoro-image-wrapper",
		"data-drag-handle": ""
	}), s = k("div", { class: "zoro-image-container" }), c = k("img", { draggable: !1 }), l = k("div", {
		class: "zoro-image-caption",
		contenteditable: "false"
	}), u = k("div", {
		class: "zoro-upload-overlay",
		contenteditable: "false"
	});
	u.hidden = !0, s.append(c, u, l);
	let d = null, f = null, p = 2 * Math.PI * 18, m = () => {
		let e = i.attrs.uploadId, t = e ? B.get(e) : void 0;
		if (u.hidden = !e, !e) return;
		if (u.innerHTML = "", t?.error) {
			u.classList.add("error"), u.append(k("div", { class: "zoro-upload-error-text" }, `${a.uploadFailed}${t.error ? ": " + t.error : ""}`), k("div", { class: "zoro-upload-error-actions" }, k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-primary zoro-btn-sm",
				onmousedown: (e) => e.preventDefault(),
				onclick: (e) => {
					e.stopPropagation(), t.retry?.();
				}
			}, a.retry), k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-secondary zoro-btn-sm",
				onmousedown: (e) => e.preventDefault(),
				onclick: (e) => {
					e.stopPropagation(), t.remove?.();
				}
			}, a.delete)));
			return;
		}
		u.classList.remove("error");
		let n = t?.progress, r = k("div", {
			class: "zoro-upload-ring" + (n == null ? " indeterminate" : ""),
			role: "progressbar",
			"aria-label": a.uploading,
			...n == null ? {} : {
				"aria-valuenow": String(n),
				"aria-valuemin": "0",
				"aria-valuemax": "100"
			},
			html: `<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" class="track"/><circle cx="22" cy="22" r="18" class="bar" stroke-dasharray="${p}" stroke-dashoffset="${n == null ? p * .7 : p * (1 - n / 100)}"/></svg>${n == null ? "" : `<span>${n}%</span>`}`
		});
		u.append(r);
	}, h = () => {
		let e = i.attrs.uploadId;
		e !== f && (d?.(), d = null, f = e, e && (d = B.subscribe(e, m)));
	};
	o.appendChild(s);
	let g = null, _ = [], v = null, b = !1, x = () => {
		let e = i.attrs;
		c.getAttribute("src") !== e.src && (c.src = e.src || ""), c.alt = e.alt || "", e.title ? c.title = e.title : c.removeAttribute("title"), e.srcset ? c.srcset = e.srcset : c.removeAttribute("srcset"), e.sizes ? c.sizes = e.sizes : c.removeAttribute("sizes"), c.style.width = e.width ? `${e.width}px` : "", c.style.height = e.width && e.height ? "auto" : "", s.style.width = e.width ? `${e.width}px` : "fit-content", s.dataset.alignment = e.alignment || "none", o.dataset.alignment = e.alignment || "none", e.decorative && (c.alt = ""), l.textContent = e.caption || "", l.hidden = !e.caption, s.classList.toggle("uploading", !!e.uploadId), h(), m(), v && (v.textContent = e.width ? `${e.width} × ${e.height ?? ""}`.trim() : "");
	}, S = () => typeof r == "function" ? r() : void 0, C = (e) => {
		let t = S();
		t !== void 0 && n.view.dispatch(n.state.tr.setNodeMarkup(t, void 0, {
			...i.attrs,
			...e
		}));
	}, w = () => {
		let e = S();
		e !== void 0 && n.view.dispatch(n.state.tr.setSelection(y.create(n.state.doc, e)));
	}, T = () => {
		let e = S();
		e !== void 0 && n.chain().focus().deleteRange({
			from: e,
			to: e + i.nodeSize
		}).run();
	}, E = () => {
		g?.remove();
		let e = i.attrs.alignment || "none";
		g = k("div", {
			class: `zoro-root zoro-image-toolbar ${t.themeClass()}`,
			role: "toolbar",
			"aria-label": a.imageSettings
		});
		let r = (e, t, n, r = "") => {
			let i = k("button", {
				type: "button",
				class: `zoro-image-toolbar-btn ${r}`,
				"data-tip": t,
				"aria-label": t,
				html: e
			});
			return i.addEventListener("mousedown", (e) => e.preventDefault()), i.addEventListener("click", (e) => {
				e.preventDefault(), e.stopPropagation(), n();
			}), i;
		}, o = [
			[
				"left",
				O.alignLeft,
				a.left
			],
			[
				"center",
				O.alignCenter,
				a.center
			],
			[
				"right",
				O.alignRight,
				a.right
			],
			[
				"none",
				O.alignNone,
				a.alignNone
			]
		];
		for (let [t, a, s] of o) g.appendChild(r(a, s, () => {
			let e = { alignment: t };
			if ((t === "left" || t === "right") && !i.attrs.width) {
				let t = Math.round((n.view.dom.clientWidth || 800) * .5), r = c.naturalWidth || c.offsetWidth;
				if (r > t) {
					let n = (c.naturalHeight || c.offsetHeight) / (r || 1);
					e.width = t, e.height = Math.round(t * n);
				}
			}
			C(e), w();
		}, e === t ? "active" : ""));
		g.appendChild(k("div", { class: "zoro-image-toolbar-divider" })), g.appendChild(r(O.pencil, a.edit, P)), g.appendChild(r(O.x, a.delete, T, "danger")), document.body.appendChild(g), D();
	}, D = () => {
		if (!g) return;
		let e = c.getBoundingClientRect(), t = g.getBoundingClientRect(), n = document.documentElement.clientWidth, r = window.innerHeight, i = e.top - t.height - 8;
		i < 8 && (i = e.top + 8), (i + t.height > r - 8 || e.bottom < 0) && (i = Math.min(r - t.height - 8, Math.max(8, e.bottom + 8)));
		let a = Math.max(8, Math.min(e.left + e.width / 2 - t.width / 2, n - t.width - 8));
		g.style.top = `${Math.round(i)}px`, g.style.left = `${Math.round(a)}px`, g.style.visibility = e.bottom < 0 || e.top > r || !c.offsetParent ? "hidden" : "";
	}, A = () => D(), j = (e) => {
		if (!g) return;
		let t = e.target, n = s.contains(t) || g.contains(t);
		g.hidden = !n, n && requestAnimationFrame(D);
	}, N = () => {
		if (n.isEditable) {
			E();
			for (let e of [
				"nw",
				"ne",
				"sw",
				"se"
			]) {
				let t = k("div", {
					class: `zoro-resize-handle zoro-resize-${e}`,
					contenteditable: "false"
				});
				t.addEventListener("pointerdown", (t) => te(t, e)), s.appendChild(t), _.push(t);
			}
			v = k("div", { class: "zoro-resize-info" }), s.appendChild(v), window.addEventListener("scroll", A, !0), window.addEventListener("resize", A), document.addEventListener("pointerdown", j, !0), x();
		}
	}, ee = () => {
		window.removeEventListener("scroll", A, !0), window.removeEventListener("resize", A), document.removeEventListener("pointerdown", j, !0), g?.remove(), g = null, _.forEach((e) => e.remove()), _ = [], v?.remove(), v = null;
	};
	function te(e, t) {
		e.preventDefault(), e.stopPropagation();
		let r = e.currentTarget;
		r.setPointerCapture?.(e.pointerId), s.classList.add("resizing");
		let a = e.clientX, o = c.offsetWidth || 1, l = o / (c.offsetHeight || 1), u = n.view.dom.clientWidth || 4e3, d = o, f = Math.round(o / l), p = (e) => {
			let n = e.clientX - a, r = (i.attrs.alignment || "none") === "center" ? 2 : 1;
			d = Math.round(Math.min(u, Math.max(50, t.endsWith("e") ? o + n * r : o - n * r))), f = Math.round(d / l), c.style.width = `${d}px`, s.style.width = `${d}px`, v && (v.textContent = `${d} × ${f}`), D();
		}, m = () => {
			r.removeEventListener("pointermove", p), r.removeEventListener("pointerup", m), r.removeEventListener("pointercancel", m), s.classList.remove("resizing"), C({
				width: d,
				height: f
			}), w();
		};
		r.addEventListener("pointermove", p), r.addEventListener("pointerup", m), r.addEventListener("pointercancel", m);
	}
	function P() {
		let e = i.attrs, r = k("input", {
			type: "text",
			class: "zoro-input",
			value: e.alt || "",
			placeholder: a.imageAltPlaceholder
		}), o = k("textarea", {
			class: "zoro-input",
			rows: 2,
			placeholder: a.captionPlaceholder
		});
		o.value = e.caption || "";
		let s = k("input", {
			type: "checkbox",
			checked: !!e.decorative
		}), l = () => {
			r.disabled = s.checked;
		};
		s.addEventListener("change", l), l();
		let u = e.alignment || "none", d = k("div", {
			class: "zoro-segmented",
			role: "group"
		}), f = [
			["left", a.left],
			["center", a.center],
			["right", a.right],
			["none", a.alignNone]
		], p = () => {
			d.innerHTML = "";
			for (let [e, t] of f) d.appendChild(k("button", {
				type: "button",
				class: "zoro-segment" + (u === e ? " active" : ""),
				"aria-pressed": String(u === e),
				onclick: () => {
					u = e, p();
				}
			}, t));
		};
		p();
		let m = { value: e.width ? "custom" : "auto" }, h = k("div", {
			class: "zoro-segmented",
			role: "group",
			"aria-label": a.size
		}), g = () => {
			h.innerHTML = "";
			for (let [e, t] of [["auto", a.sizeAuto], ["custom", a.sizeCustom]]) h.append(k("button", {
				type: "button",
				class: "zoro-segment" + (m.value === e ? " active" : ""),
				"aria-pressed": String(m.value === e),
				onclick: () => {
					m.value = e, g(), b.style.display = e === "custom" ? "flex" : "none";
				}
			}, t));
		}, _ = k("input", {
			type: "number",
			class: "zoro-input",
			min: 10,
			value: e.width ?? "",
			placeholder: a.width,
			"aria-label": a.width
		}), v = k("input", {
			type: "number",
			class: "zoro-input",
			min: 10,
			value: e.height ?? "",
			placeholder: a.height,
			"aria-label": a.height
		}), y = c.naturalWidth && c.naturalHeight ? c.naturalWidth / c.naturalHeight : null;
		_.addEventListener("input", () => {
			y && _.value && (v.value = String(Math.round(+_.value / y)));
		}), v.addEventListener("input", () => {
			y && v.value && (_.value = String(Math.round(+v.value * y)));
		});
		let b = k("div", {
			class: "zoro-size-row",
			style: { display: e.width ? "flex" : "none" }
		}, _, k("span", {}, "×"), v);
		g();
		let x = k("div", { class: "zoro-form" }, k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, a.imageAlt), r), k("label", { class: "zoro-checkbox-group" }, s, k("span", {}, a.imageDecorative)), k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, a.caption), o), k("div", { class: "zoro-field" }, k("span", { class: "zoro-label" }, a.imageAlign), d), k("div", { class: "zoro-field" }, k("span", { class: "zoro-label" }, a.size), h, b)), S = new M({
			title: a.imageSettings,
			size: "sm",
			themeClass: t.themeClass(),
			closeLabel: a.close
		});
		S.open(x), S.addFooter(k("div", { class: "zoro-btn-row" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => S.close()
		}, a.cancel), k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-primary",
			onclick: () => {
				let e = m.value === "custom";
				C({
					alt: s.checked ? null : r.value.trim() || null,
					decorative: s.checked,
					caption: o.value.trim() || null,
					alignment: u,
					width: e ? pe(_.value) : null,
					height: e ? pe(v.value) : null
				}), S.close(), n.commands.focus(), w();
			}
		}, a.save)));
	}
	return c.addEventListener("dblclick", (e) => {
		e.preventDefault(), n.isEditable && P();
	}), x(), {
		dom: o,
		update(e) {
			if (e.type !== i.type) return !1;
			let t = e.attrs.alignment !== i.attrs.alignment;
			return i = e, x(), b && t ? E() : b && requestAnimationFrame(D), !0;
		},
		selectNode() {
			b = !0, s.classList.add("selected"), N();
		},
		deselectNode() {
			b = !1, s.classList.remove("selected"), ee();
		},
		stopEvent(e) {
			return !!e.target.closest?.(".zoro-image-toolbar, .zoro-resize-handle");
		},
		ignoreMutation() {
			return !0;
		},
		destroy() {
			ee(), d?.();
		}
	};
}
//#endregion
//#region src/finder/adapters.ts
function ve(e) {
	return {
		id: e.id,
		url: e.url,
		filename: e.filename ?? e.originalFilename ?? e.original_filename ?? String(e.url ?? "").split("/").pop() ?? "",
		alt: e.alt ?? e.altText ?? e.alt_text ?? "",
		caption: e.caption ?? "",
		title: e.title ?? "",
		mime: e.mime ?? e.mimeType ?? e.mime_type,
		size: e.size ?? e.fileSize ?? e.file_size,
		width: e.width ?? null,
		height: e.height ?? null,
		folder: e.folder ?? "",
		srcset: e.srcset ?? null,
		variants: e.variants ?? void 0,
		createdAt: e.createdAt ?? e.created_at,
		usageCount: e.usageCount ?? e.usage_count
	};
}
var U = class extends Error {
	constructor(e, t) {
		super(e), this.status = t, this.name = "MediaApiError";
	}
}, ye = class {
	constructor(e) {
		this.opts = e, this.transform = e.transform ?? ve;
	}
	url(e, t = {}) {
		let n = new URL(this.opts.endpoint, typeof location < "u" ? location.href : "http://localhost/");
		n.searchParams.set("action", e);
		for (let [e, r] of Object.entries(t)) r != null && (r !== "" || e === "folder") && n.searchParams.set(e, String(r));
		return n.toString();
	}
	headers() {
		let e = this.opts.headers;
		return {
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest",
			...typeof e == "function" ? e() : e ?? {}
		};
	}
	async request(e, t = {}) {
		let { params: n, ...r } = t, i = await fetch(this.url(e, n), {
			credentials: this.opts.credentials ?? "same-origin",
			...r,
			headers: {
				...this.headers(),
				...r.body && !(r.body instanceof FormData) ? { "Content-Type": "application/json" } : {},
				...r.headers
			}
		}), a = null;
		try {
			a = await i.json();
		} catch {}
		if (!i.ok || a?.error) throw new U(a?.error || `HTTP ${i.status}`, i.status);
		return a;
	}
	async list(e) {
		let t = await this.request("list", { params: { ...e } }), n = (t.items ?? t.media ?? []).map(this.transform);
		return {
			items: n,
			total: t.total ?? n.length,
			hasMore: !!t.hasMore,
			folders: t.folders
		};
	}
	upload(e, t) {
		return new Promise((n, r) => {
			let i = new XMLHttpRequest();
			i.open("POST", this.url("upload")), i.withCredentials = (this.opts.credentials ?? "same-origin") === "include";
			for (let [e, t] of Object.entries(this.headers())) i.setRequestHeader(e, t);
			i.upload.onprogress = (e) => {
				e.lengthComputable && t.onProgress?.(Math.round(e.loaded / e.total * 95));
			}, i.onload = () => {
				let e = null;
				try {
					e = JSON.parse(i.responseText);
				} catch {}
				i.status >= 200 && i.status < 300 && e && !e.error ? (t.onProgress?.(100), n(this.transform(e.item ?? e.image ?? e))) : r(new U(e?.error || `HTTP ${i.status}`, i.status));
			}, i.onerror = () => r(new U("Network error", 0)), i.onabort = () => r(new U("Aborted", 0)), t.signal?.addEventListener("abort", () => i.abort());
			let a = new FormData();
			a.append("file", e), a.append("alt", t.alt), t.folder && a.append("folder", t.folder), i.send(a);
		});
	}
	async update(e, t) {
		let n = await this.request("update", {
			method: "POST",
			params: { id: e },
			body: JSON.stringify(t)
		});
		return this.transform(n.item ?? n.image ?? n);
	}
	async remove(e) {
		await this.request("delete", {
			method: "POST",
			body: JSON.stringify({ ids: e })
		});
	}
	async move(e, t) {
		await this.request("move", {
			method: "POST",
			body: JSON.stringify({
				ids: e,
				folder: t
			})
		});
	}
	async createFolder(e) {
		await this.request("folder-create", {
			method: "POST",
			body: JSON.stringify({ path: e })
		});
	}
	async deleteFolder(e) {
		await this.request("folder-delete", {
			method: "POST",
			body: JSON.stringify({ path: e })
		});
	}
}, be = class {
	constructor(e = []) {
		this.items = [], this.folders = /* @__PURE__ */ new Set(), this.seq = 1;
		for (let t of e) this.items.push({
			id: this.seq++,
			filename: t.url.split("/").pop() || "image",
			folder: "",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			...t
		});
		for (let e of this.items) e.folder && this.folders.add(e.folder);
	}
	async list(e) {
		let t = [...this.items];
		if (e.folder !== void 0 && e.folder !== "*" && (t = t.filter((t) => (t.folder ?? "") === e.folder)), e.search) {
			let n = e.search.toLocaleLowerCase("tr");
			t = t.filter((e) => `${e.filename} ${e.alt ?? ""}`.toLocaleLowerCase("tr").includes(n));
		}
		e.filter === "unused" && (t = t.filter((e) => !e.usageCount));
		let n = e.sort ?? "newest";
		t.sort((e, t) => n === "name" ? e.filename.localeCompare(t.filename, "tr") : n === "size" ? (t.size ?? 0) - (e.size ?? 0) : n === "oldest" ? String(e.createdAt).localeCompare(String(t.createdAt)) || +e.id - t.id : String(t.createdAt).localeCompare(String(e.createdAt)) || +t.id - e.id);
		let r = (e.page - 1) * e.limit, i = [...this.folders].sort().map((e) => ({
			path: e,
			name: e.split("/").pop(),
			count: this.items.filter((t) => t.folder === e).length
		}));
		return {
			items: t.slice(r, r + e.limit),
			total: t.length,
			hasMore: r + e.limit < t.length,
			folders: i
		};
	}
	async upload(e, t) {
		for (let e of [
			30,
			70,
			100
		]) await new Promise((e) => setTimeout(e, 60)), t.onProgress?.(e);
		let n = URL.createObjectURL(e), r = await new Promise((e) => {
			let t = new Image();
			t.onload = () => e({
				w: t.naturalWidth,
				h: t.naturalHeight
			}), t.onerror = () => e(null), t.src = n, setTimeout(() => e(null), 1500);
		}), i = {
			id: this.seq++,
			url: n,
			filename: e.name,
			alt: t.alt,
			mime: e.type,
			size: e.size,
			width: r?.w ?? null,
			height: r?.h ?? null,
			folder: t.folder ?? "",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			usageCount: 0
		};
		return this.items.push(i), i;
	}
	async update(e, t) {
		let n = this.items.find((t) => t.id === e);
		if (!n) throw new U("Not found", 404);
		return Object.assign(n, t), n;
	}
	async remove(e) {
		this.items = this.items.filter((t) => !e.includes(t.id));
	}
	async move(e, t) {
		for (let n of this.items) e.includes(n.id) && (n.folder = t);
	}
	async createFolder(e) {
		this.folders.add(e);
	}
	async deleteFolder(e) {
		if (this.items.some((t) => t.folder === e)) throw new U("Folder is not empty", 409);
		this.folders.delete(e);
	}
};
function W(e) {
	return !e && e !== 0 ? "" : e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1048576).toFixed(1)} MB`;
}
function G(e, t = "lg") {
	let n = e.variants?.[t], r = n?.url ?? e.url, i = e.srcset ?? null;
	if (!i && e.variants) {
		let t = Object.entries(e.variants).filter(([e, t]) => e !== "thumb" && t.width).map(([, e]) => `${e.url} ${e.width}w`);
		e.width && t.push(`${e.url} ${e.width}w`), i = t.length > 1 ? t.join(", ") : null;
	}
	return {
		src: r,
		srcset: i,
		width: n?.width ?? e.width ?? null,
		height: n?.height ?? e.height ?? null
	};
}
//#endregion
//#region src/finder/finder.ts
var xe = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif"
], Se = 40;
function Ce(e, t) {
	try {
		return localStorage.getItem("zoro-finder-" + e) ?? t;
	} catch {
		return t;
	}
}
function we(e, t) {
	try {
		localStorage.setItem("zoro-finder-" + e, t);
	} catch {}
}
function Te(e) {
	return e.adapter ? e.adapter : e.endpoint ? new ye({
		endpoint: e.endpoint,
		headers: e.headers,
		credentials: e.credentials,
		transform: e.transform
	}) : null;
}
var Ee = class {
	constructor(e) {
		this.opts = e, this.dialog = null, this.tabs = null, this.items = [], this.folders = [], this.total = 0, this.hasMore = !1, this.loading = !1, this.error = null, this.selected = /* @__PURE__ */ new Map(), this.focused = null, this.insertAlts = /* @__PURE__ */ new Map(), this.reqSeq = 0, this.queue = [], this.uploading = !1, this.el = {}, this.onPaste = (e) => {
			let t = Array.from(e.clipboardData?.files ?? []);
			t.length && (e.preventDefault(), this.tabs?.setActive("upload"), this.addFiles(t));
		}, this.t = e.messages ?? w(e.locale);
		let t = Te(e);
		if (!t) throw Error("ZoroFinder: an \"adapter\" or \"endpoint\" option is required.");
		this.adapter = t, this.themeClass = e.themeClass ?? [`zoro-skin-${e.skin === "classic" ? "classic" : "modern"}`, e.theme && e.theme !== "light" ? `zoro-theme-${e.theme}` : ""].filter(Boolean).join(" "), this.view = Ce("view", "grid") === "list" ? "list" : "grid", this.params = {
			page: 1,
			limit: Se,
			search: "",
			folder: "*",
			type: "",
			sort: "newest",
			filter: ""
		};
	}
	get canFolders() {
		return this.opts.folders !== !1 && !!this.adapter.createFolder;
	}
	get accept() {
		return this.opts.accept ?? xe;
	}
	get maxMB() {
		return this.opts.maxSizeMB ?? 20;
	}
	get requireAlt() {
		return this.opts.requireAlt !== !1;
	}
	open() {
		let e = this.t;
		this.dialog = new M({
			title: this.opts.title ?? e.finderTitle,
			size: "xl",
			themeClass: `${this.themeClass} zoro-finder-dialog`,
			closeLabel: e.close,
			onClose: () => this.cleanup()
		}), this.tabs = new ne({
			tabs: [{
				id: "library",
				label: e.library,
				icon: O.image.replace(/20/g, "16")
			}, {
				id: "upload",
				label: e.upload,
				icon: O.upload
			}],
			active: this.opts.tab ?? "library",
			onChange: () => this.renderFooter()
		});
		let t = this.tabs.render();
		return t.classList.add("zoro-finder"), this.dialog.open(t), this.buildLibrary(this.tabs.panel("library")), this.buildUpload(this.tabs.panel("upload")), this.el.footer = k("div", { class: "zoro-finder-footer" }), this.dialog.addFooter(this.el.footer), this.dialog.dialog?.addEventListener("paste", this.onPaste), this.renderFooter(), this.load(), this;
	}
	close() {
		this.dialog?.close();
	}
	cleanup() {
		clearTimeout(this.searchTimer);
		for (let e of this.queue) URL.revokeObjectURL(e.preview);
		this.queue = [], this.opts.onClose?.();
	}
	buildLibrary(e) {
		let t = this.t;
		this.el.search = k("input", {
			type: "search",
			placeholder: t.search,
			"aria-label": t.search,
			enterkeyhint: "search"
		}), this.el.search.addEventListener("input", () => {
			clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => this.reload({ search: this.el.search.value.trim() }), 300);
		}), this.el.folderSelect = new P({
			variant: "field",
			label: t.allFolders,
			icon: O.folder,
			value: "*",
			items: [],
			onChange: (e) => this.reload({ folder: e })
		});
		let n = this.el.folderSelect.render();
		n.classList.add("zoro-finder-folder");
		let r = new P({
			variant: "field",
			label: t.sortNewest,
			icon: O.sort,
			value: "newest",
			items: [
				{
					value: "newest",
					label: t.sortNewest
				},
				{
					value: "oldest",
					label: t.sortOldest
				},
				{
					value: "name",
					label: t.sortName
				},
				{
					value: "size",
					label: t.sortSize
				}
			],
			onChange: (e) => this.reload({ sort: e })
		}), i = new P({
			variant: "field",
			label: t.unused,
			icon: O.filter,
			value: "",
			items: [{
				value: "",
				label: t.allMedia
			}, {
				value: "unused",
				label: t.unused
			}],
			onChange: (e) => this.reload({ filter: e })
		}).render();
		i.classList.add("zoro-finder-usage"), i.hidden = !0, this.el.viewBtn = k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-icon",
			onclick: () => this.toggleView()
		}), this.updateViewBtn();
		let a = this.canFolders ? k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-icon",
			title: t.newFolder,
			"aria-label": t.newFolder,
			html: O.folderPlus,
			onclick: () => this.createFolder()
		}) : null, o = k("div", { class: "zoro-finder-bar" }, k("div", { class: "zoro-media-search" }, k("span", { html: O.search }), this.el.search), k("div", { class: "zoro-finder-filters" }, this.canFolders || this.adapter.move ? n : null, a, i, r.render(), this.el.viewBtn));
		this.el.count = k("span", { class: "zoro-finder-count" }), this.el.grid = k("div", {
			class: "zoro-finder-grid-wrap",
			tabindex: "-1"
		}), this.el.grid.addEventListener("scroll", () => {
			let e = this.el.grid;
			this.hasMore && !this.loading && e.scrollTop + e.clientHeight > e.scrollHeight - 200 && this.load(!0);
		}), this.el.details = k("aside", {
			class: "zoro-finder-details",
			"aria-label": t.details
		}), this.el.root = k("div", { class: "zoro-finder-body" }, this.el.grid, this.el.details), e.append(o, this.el.root), this.renderFolders();
	}
	updateViewBtn() {
		let e = this.t, t = this.view === "grid";
		this.el.viewBtn.innerHTML = t ? O.list : O.grid, this.el.viewBtn.title = t ? e.listView : e.gridView, this.el.viewBtn.setAttribute("aria-label", this.el.viewBtn.title);
	}
	toggleView() {
		this.view = this.view === "grid" ? "list" : "grid", we("view", this.view), this.updateViewBtn(), this.renderGrid();
	}
	reload(e) {
		this.params = {
			...this.params,
			...e,
			page: 1
		}, this.el.grid.scrollTop = 0, this.load();
	}
	async load(e = !1) {
		e && this.params.page++;
		let t = ++this.reqSeq;
		this.loading = !0, this.error = null, e || this.renderGrid();
		try {
			let n = {
				...this.params,
				folder: this.params.folder === "*" ? void 0 : this.params.folder
			}, r = await this.adapter.list(n);
			if (t !== this.reqSeq) return;
			if (this.items = e ? [...this.items, ...r.items] : r.items, this.items.some((e) => e.usageCount !== void 0)) {
				let e = this.dialog?.dialog?.querySelector(".zoro-finder-usage");
				e && (e.hidden = !1);
			}
			this.total = r.total, this.hasMore = r.hasMore, r.folders && (this.folders = r.folders, this.renderFolders());
		} catch (n) {
			if (t !== this.reqSeq) return;
			this.error = n?.message || this.t.loadFailed, e && this.params.page--;
		} finally {
			t === this.reqSeq && (this.loading = !1, this.renderGrid());
		}
	}
	renderFolders() {
		let e = this.el.folderSelect;
		if (!e) return;
		let t = this.t;
		e.setItems([
			{
				value: "*",
				label: t.allFolders,
				icon: O.grid
			},
			{
				value: "",
				label: t.rootFolder,
				icon: O.folder
			},
			...this.folders.map((e) => ({
				value: e.path,
				label: e.name,
				icon: O.folder,
				depth: e.path.split("/").length,
				meta: e.count == null ? void 0 : String(e.count)
			}))
		]), e.setValue(this.params.folder ?? "*");
	}
	renderGrid() {
		let e = this.t, t = this.el.grid;
		if (t.innerHTML = "", this.error && !this.items.length) {
			t.append(k("div", {
				class: "zoro-media-empty",
				role: "alert"
			}, k("p", {}, this.error), k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-secondary",
				onclick: () => this.load()
			}, e.retry)));
			return;
		}
		if (!this.items.length) {
			if (this.loading) {
				let e = k("div", { class: `zoro-media-grid zoro-view-${this.view}` });
				for (let t = 0; t < 12; t++) e.append(k("div", { class: "zoro-media-item zoro-skeleton" }));
				t.append(e);
				return;
			}
			let n = !!(this.params.search || this.params.filter || this.params.folder && this.params.folder !== "*");
			t.append(k("div", {
				class: "zoro-media-empty",
				html: O.imageBig + `<p>${n ? e.noResults : e.emptyLibrary}</p>`
			})), this.canFolders && this.params.folder && this.params.folder !== "*" && !this.params.search && t.append(k("div", { class: "zoro-center" }, k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-ghost zoro-btn-sm",
				onclick: () => this.deleteFolder(this.params.folder)
			}, e.deleteFolder)));
			return;
		}
		let n = k("div", {
			class: `zoro-media-grid zoro-view-${this.view}`,
			role: "listbox",
			"aria-multiselectable": String(!!this.opts.multiple)
		});
		for (let e of this.items) n.append(this.renderItem(e));
		t.append(n), this.hasMore && t.append(k("div", { class: "zoro-center" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			disabled: this.loading,
			onclick: () => this.load(!0)
		}, this.loading ? e.loading : e.loadMore))), this.renderDetails();
	}
	thumbOf(e) {
		return e.variants?.thumb?.url ?? e.variants?.sm?.url ?? e.url;
	}
	renderItem(e) {
		let t = this.selected.has(e.id), n = !e.mime || e.mime.startsWith("image/") ? k("img", {
			src: this.thumbOf(e),
			alt: e.alt || "",
			loading: "lazy",
			decoding: "async"
		}) : k("span", {
			class: "zoro-media-file",
			html: O.file
		}), r = k("div", {
			class: "zoro-media-item" + (t ? " selected" : "") + (this.focused?.id === e.id ? " focused" : ""),
			role: "option",
			tabindex: "0",
			"aria-selected": String(t),
			title: e.filename
		}, k("div", { class: "zoro-media-thumb" }, n), k("div", { class: "zoro-media-meta" }, k("span", { class: "zoro-media-name" }, e.filename), k("span", { class: "zoro-media-sub" }, [e.width && e.height ? `${e.width}×${e.height}` : "", W(e.size)].filter(Boolean).join(" · "))), k("span", {
			class: "zoro-media-check",
			html: O.check,
			"aria-hidden": "true"
		})), i = (t) => {
			let n = this.opts.multiple && (t.ctrlKey || t.metaKey || t.shiftKey || t.target.closest(".zoro-media-check") || this.selected.size > 0 && "pointerType" in t && t.pointerType === "touch");
			this.toggleSelect(e, !!n);
		};
		return r.addEventListener("click", i), r.addEventListener("dblclick", () => {
			this.opts.manageOnly || (this.selected.clear(), this.selected.set(e.id, e), this.confirmSelection());
		}), r.addEventListener("keydown", (e) => {
			e.key === "Enter" || e.key === " " ? (e.preventDefault(), i(e)) : e.key.startsWith("Arrow") ? this.moveFocus(r, e) : e.key === "Delete" && this.adapter.remove && (e.preventDefault(), this.removeSelected());
		}), r;
	}
	moveFocus(e, t) {
		let n = Array.from(this.el.grid.querySelectorAll(".zoro-media-item")), r = n.indexOf(e), i = 1;
		if (this.view === "grid" && n.length > 1) {
			let e = n[0].offsetTop;
			i = n.findIndex((t) => t.offsetTop !== e), i <= 0 && (i = n.length);
		}
		let a = n[r + (t.key === "ArrowRight" ? 1 : t.key === "ArrowLeft" ? -1 : t.key === "ArrowDown" ? i : -i)];
		a && (t.preventDefault(), a.focus());
	}
	toggleSelect(e, t) {
		t ? this.selected.has(e.id) ? this.selected.delete(e.id) : this.selected.set(e.id, e) : this.selected.size === 1 && this.selected.has(e.id) && this.focused?.id === e.id ? this.selected.clear() : (this.selected.clear(), this.selected.set(e.id, e)), this.focused = this.selected.has(e.id) ? e : [...this.selected.values()].pop() ?? null, this.el.grid.querySelectorAll(".zoro-media-item").forEach((e, t) => {
			let n = this.items[t];
			if (!n) return;
			let r = this.selected.has(n.id);
			e.classList.toggle("selected", r), e.classList.toggle("focused", this.focused?.id === n.id), e.setAttribute("aria-selected", String(r));
		}), this.renderDetails(), this.renderFooter();
	}
	renderDetails() {
		let e = this.t, t = this.el.details, n = this.focused && this.selected.has(this.focused.id) ? this.focused : null;
		if (t.innerHTML = "", this.el.root.classList.toggle("has-details", !!n), !n) return;
		let r = k("div", { class: "zoro-details-preview" }, !n.mime || n.mime.startsWith("image/") ? k("img", {
			src: n.variants?.md?.url ?? n.variants?.sm?.url ?? n.url,
			alt: n.alt || ""
		}) : k("span", { html: O.file })), i = k("dl", { class: "zoro-details-meta" }), a = (e, t) => {
			t && i.append(k("dt", {}, e), k("dd", {}, String(t)));
		};
		a(e.filename, n.filename), a(e.dimensions, n.width && n.height ? `${n.width} × ${n.height}` : null), a(e.fileSize, W(n.size)), a(e.uploadedAt, n.createdAt ? new Date(n.createdAt).toLocaleDateString() : null), n.usageCount !== void 0 && a(e.usage, n.usageCount ? T(e.usedIn, { n: n.usageCount }) : e.notUsed);
		let o = k("input", {
			type: "text",
			class: "zoro-input",
			value: this.insertAlts.get(n.id) ?? n.alt ?? "",
			placeholder: e.imageAltPlaceholder
		});
		o.addEventListener("input", () => {
			this.insertAlts.set(n.id, o.value), this.renderFooter();
		});
		let s = k("div", { class: "zoro-form" });
		if (this.opts.manageOnly || s.append(k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, e.altForArticle), o)), this.adapter.update) {
			let t = k("input", {
				type: "text",
				class: "zoro-input",
				value: n.alt ?? ""
			}), r = k("textarea", {
				class: "zoro-input",
				rows: 2
			});
			r.value = n.caption ?? "";
			let i = k("input", {
				type: "text",
				class: "zoro-input",
				value: n.filename.replace(/\.[^.]+$/, "")
			}), a = k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-secondary zoro-btn-sm"
			}, e.save);
			a.addEventListener("click", async () => {
				a.disabled = !0;
				try {
					let a = {
						alt: t.value.trim(),
						caption: r.value.trim()
					}, o = n.filename.replace(/\.[^.]+$/, "");
					i.value.trim() && i.value.trim() !== o && (a.filename = i.value.trim());
					let s = await this.adapter.update(n.id, a);
					Object.assign(n, s), F(e.saved, "success", this.themeClass), this.renderGrid();
				} catch (t) {
					F(t?.message || e.uploadFailed, "error", this.themeClass);
				} finally {
					a.disabled = !1;
				}
			}), s.append(k("details", { class: "zoro-details-edit" }, k("summary", {}, e.edit), k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, e.imageAlt), t), k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, e.caption), r), k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, e.filename), i), a));
		}
		let c = k("div", { class: "zoro-btn-row zoro-details-actions" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-sm",
			html: `${O.copy}<span>${e.copyUrl}</span>`,
			onclick: async () => {
				let t = new URL(n.url, location.href).toString();
				try {
					await navigator.clipboard.writeText(t), F(e.copied, "success", this.themeClass);
				} catch {
					ie({
						title: e.copyUrl,
						label: "URL",
						value: t,
						ok: e.close,
						cancel: e.close,
						themeClass: this.themeClass
					});
				}
			}
		}), this.adapter.remove ? k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-sm zoro-text-danger",
			html: `${O.trash}<span>${e.delete}</span>`,
			onclick: () => this.removeSelected([n])
		}) : null), l = k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-icon zoro-details-close",
			"aria-label": e.close,
			html: O.x,
			onclick: () => {
				this.selected.delete(n.id), this.focused = null, this.toggleSelectRefresh();
			}
		});
		t.append(l, r, i, s, c);
	}
	toggleSelectRefresh() {
		this.renderGrid(), this.renderFooter();
	}
	renderFooter() {
		let e = this.t, t = this.el.footer;
		if (!t) return;
		t.innerHTML = "";
		let n = this.tabs?.active !== "upload", r = this.selected.size, i = k("div", { class: "zoro-finder-footer-left" });
		if (n && r > 0) {
			if (i.append(k("span", { class: "zoro-finder-selected" }, T(e.selected, { n: r }))), i.append(k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-ghost zoro-btn-sm",
				onclick: () => {
					this.selected.clear(), this.focused = null, this.toggleSelectRefresh();
				}
			}, e.clearSelection)), this.adapter.move && (this.folders.length || this.canFolders)) {
				let t = new P({
					variant: "field",
					size: "sm",
					label: e.moveTo,
					icon: O.folderMove,
					placeholder: `${e.moveTo}…`,
					value: "__",
					resetAfterChange: !0,
					items: [{
						value: "",
						label: e.rootFolder,
						icon: O.folder
					}, ...this.folders.map((e) => ({
						value: e.path,
						label: e.name,
						icon: O.folder,
						depth: e.path.split("/").length
					}))],
					onChange: (e) => void n(e)
				}), n = async (e) => {
					try {
						await this.adapter.move([...this.selected.keys()], e), this.selected.clear(), this.focused = null, await this.load(), this.renderFooter();
					} catch (e) {
						F(e?.message || "Hata", "error", this.themeClass);
					}
				};
				i.append(t.render());
			}
			this.adapter.remove && r > 1 && i.append(k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-ghost zoro-btn-sm zoro-text-danger",
				onclick: () => this.removeSelected()
			}, e.deleteSelected));
		} else n && this.total && i.append(k("span", { class: "zoro-finder-count" }, `${this.total}`));
		let a = k("div", { class: "zoro-btn-row" });
		if (a.append(k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => this.close()
		}, e.close)), !this.opts.manageOnly && n) {
			let t = this.requireAlt && [...this.selected.values()].some((e) => !(this.insertAlts.get(e.id) ?? e.alt ?? "").trim()), n = this.opts.selectLabel ?? (r > 1 ? T(e.insertImages, { n: r }) : e.insertImage);
			a.append(k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-primary",
				disabled: r === 0 || t,
				title: t ? e.altRequired : "",
				onclick: () => this.confirmSelection()
			}, n));
		}
		t.append(i, a);
	}
	confirmSelection() {
		if (!this.selected.size) return;
		let e = [...this.selected.values()].map((e) => ({
			...e,
			insertAlt: (this.insertAlts.get(e.id) ?? e.alt ?? "").trim()
		}));
		this.requireAlt && e.some((e) => !e.insertAlt) ? F(this.t.altRequired, "error", this.themeClass) : (this.opts.onSelect?.(e), this.close());
	}
	async removeSelected(e) {
		let t = this.t, n = e ?? [...this.selected.values()];
		if (n.length && this.adapter.remove && await re(T(t.deleteConfirm, { n: n.length }), {
			title: t.delete,
			ok: t.delete,
			cancel: t.cancel,
			danger: !0,
			themeClass: this.themeClass
		})) try {
			await this.adapter.remove(n.map((e) => e.id));
			for (let e of n) this.selected.delete(e.id);
			this.focused = null, await this.load(), this.renderFooter();
		} catch (e) {
			F(e?.message || "Hata", "error", this.themeClass);
		}
	}
	async createFolder() {
		let e = this.t, t = this.params.folder && this.params.folder !== "*" ? this.params.folder : "", n = await ie({
			title: e.newFolder,
			label: e.folderName,
			ok: e.save,
			cancel: e.cancel,
			themeClass: this.themeClass,
			validate: (t) => !t || /[\\/:*?"<>|.]/.test(t) ? e.folderName : null
		});
		if (!n) return;
		let r = t ? `${t}/${n}` : n;
		try {
			await this.adapter.createFolder(r), this.params.folder = r, await this.load();
		} catch (e) {
			F(e?.message || "Hata", "error", this.themeClass);
		}
	}
	async deleteFolder(e) {
		let t = this.t;
		if (this.adapter.deleteFolder && await re(t.deleteFolderConfirm, {
			title: t.deleteFolder,
			ok: t.delete,
			cancel: t.cancel,
			danger: !0,
			themeClass: this.themeClass
		})) try {
			await this.adapter.deleteFolder(e), this.params.folder = "*", await this.load();
		} catch (e) {
			F(e?.message || "Hata", "error", this.themeClass);
		}
	}
	buildUpload(e) {
		let t = this.t, n = k("input", {
			type: "file",
			accept: this.accept.join(","),
			multiple: !0,
			hidden: !0
		}), r = this.accept.map((e) => e.split("/")[1].toUpperCase()).join(", "), i = k("div", {
			class: "zoro-dropzone",
			role: "button",
			tabindex: "0",
			html: `${O.uploadBig}<p>${t.dropHere}</p><small>${T(t.dropHint, {
				types: r,
				max: this.maxMB
			})}</small>`
		});
		i.addEventListener("click", () => n.click()), i.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), n.click());
		}), i.addEventListener("dragover", (e) => {
			e.preventDefault(), i.classList.add("dragging");
		}), i.addEventListener("dragleave", () => i.classList.remove("dragging")), i.addEventListener("drop", (e) => {
			e.preventDefault(), i.classList.remove("dragging"), this.addFiles(Array.from(e.dataTransfer?.files ?? []));
		}), n.addEventListener("change", () => {
			this.addFiles(Array.from(n.files ?? [])), n.value = "";
		}), this.el.queue = k("div", { class: "zoro-upload-list" }), this.el.uploadBtn = k("div", { class: "zoro-upload-actions" }), e.append(i, n, this.el.queue, this.el.uploadBtn);
	}
	addFiles(e) {
		let t = this.t;
		for (let n of e) this.accept.includes(n.type) ? n.size > this.maxMB * 1048576 ? F(`${n.name}: ${T(t.tooLarge, { max: this.maxMB })}`, "error", this.themeClass) : this.queue.push({
			file: n,
			preview: URL.createObjectURL(n),
			alt: K(n.name)
		}) : F(`${n.name}: ${t.badType}`, "error", this.themeClass);
		this.tabs?.setActive("upload"), this.renderQueue();
	}
	renderQueue() {
		let e = this.t, t = this.el.queue;
		t.innerHTML = "", this.queue.forEach((n, r) => {
			let i = k("input", {
				type: "text",
				class: "zoro-input",
				value: n.alt,
				placeholder: e.imageAltPlaceholder,
				disabled: this.uploading,
				"aria-label": e.altRequired
			});
			i.addEventListener("input", () => {
				n.alt = i.value, this.renderUploadButton();
			});
			let a = k("div", { class: "zoro-upload-item" + (n.error ? " error" : "") }, k("img", {
				src: n.preview,
				alt: ""
			}), k("div", { class: "zoro-upload-item-info" }, k("div", { class: "zoro-upload-item-header" }, k("span", { class: "zoro-truncate" }, `${n.file.name} · ${W(n.file.size)}`), k("button", {
				type: "button",
				class: "zoro-btn zoro-btn-ghost zoro-btn-icon-sm",
				"aria-label": e.delete,
				html: O.x,
				disabled: this.uploading,
				onclick: () => {
					URL.revokeObjectURL(n.preview), this.queue.splice(r, 1), this.renderQueue();
				}
			})), k("label", { class: "zoro-label" }, this.requireAlt ? e.altRequired : e.imageAlt), i, n.progress === void 0 ? null : k("div", { class: "zoro-progress" }, k("div", {
				class: "zoro-progress-bar" + (n.error ? " error" : ""),
				style: { width: `${Math.max(0, n.progress)}%` }
			})), n.error ? k("p", { class: "zoro-field-error" }, `${e.uploadFailed}: ${n.error}`) : null));
			t.append(a);
		}), this.renderUploadButton();
	}
	renderUploadButton() {
		let e = this.t, t = this.el.uploadBtn;
		if (t.innerHTML = "", !this.queue.length) return;
		let n = !this.requireAlt || this.queue.every((e) => e.alt.trim());
		t.append(k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-primary zoro-btn-block",
			disabled: !n || this.uploading,
			html: this.uploading ? `<span class="zoro-spinner"></span> ${e.uploading}` : `${O.upload} ${T(e.uploadFiles, { n: this.queue.length })}`,
			onclick: () => this.startUpload()
		}));
	}
	async startUpload() {
		this.uploading = !0, this.renderQueue();
		let e = [], t = this.params.folder && this.params.folder !== "*" ? this.params.folder : "";
		for (let n of [...this.queue]) {
			n.progress = 0, n.error = void 0, this.renderQueue();
			try {
				let r = await this.adapter.upload(n.file, {
					alt: n.alt.trim(),
					folder: t,
					onProgress: (e) => {
						n.progress = e;
						let t = this.el.queue.querySelectorAll(".zoro-progress-bar")[this.queue.indexOf(n)];
						t && (t.style.width = `${e}%`);
					}
				});
				e.push(r), URL.revokeObjectURL(n.preview), this.queue.splice(this.queue.indexOf(n), 1);
			} catch (e) {
				n.progress = -1, n.error = e?.message || "Hata";
			}
			this.renderQueue();
		}
		if (this.uploading = !1, this.renderQueue(), e.length) {
			this.selected.clear(), this.opts.multiple || e.splice(0, e.length - 1);
			for (let t of e) this.selected.set(t.id, t), this.insertAlts.set(t.id, t.alt ?? "");
			this.focused = e[e.length - 1] ?? null, this.params.page = 1, this.tabs?.setActive("library"), await this.load(), this.renderFooter();
		}
	}
};
function K(e) {
	let t = e.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
	return /^(img|image|dsc|pxl|screenshot|ekran görüntüsü|photo|whatsapp image)?\s*[\d\s.]*$/i.test(t) ? "" : t.charAt(0).toLocaleUpperCase("tr") + t.slice(1);
}
function De(e) {
	return new Ee(e).open();
}
//#endregion
//#region src/core/paste.ts
function Oe(e) {
	return /docs-internal-guid/i.test(e) ? "gdocs" : /google-sheets-html-origin/i.test(e) ? "sheets" : /urn:schemas-microsoft-com:office:excel|ProgId\s+content=["']?Excel/i.test(e) ? "excel" : /urn:schemas-microsoft-com:office:word|class=["']?Mso|mso-list|ProgId\s+content=["']?Word/i.test(e) ? "word" : "html";
}
function ke(e) {
	let t = /* @__PURE__ */ new Map(), n = /@list\s+l(\d+):level(\d+)\s*\{([^}]*)\}/gi, r;
	for (; r = n.exec(e);) {
		let e = r[3], n = /mso-level-number-format:\s*([\w-]+)/i.exec(e)?.[1]?.toLowerCase(), i = /mso-level-start-at:\s*(\d+)/i.exec(e)?.[1], a = !n || ![
			"bullet",
			"image",
			"none"
		].includes(n);
		t.set(`${r[1]}:${r[2]}`, {
			ordered: a,
			start: i ? +i : void 0
		});
	}
	return t;
}
var Ae = /^[\s ]*[•·§●○▪–o\-*][\s ]+/, je = /^[\s ]*(\d{1,3}|[a-z]{1,2}|[ivxlcdm]{1,5})[.)][\s ]+/i;
function Me(e) {
	let t = e.replace(/ /g, " "), n = je.exec(t);
	return n ? {
		ordered: !0,
		start: /^\d+$/.test(n[1]) ? +n[1] : void 0
	} : Ae.test(t) || /^\s*[•·§●○▪]/.test(t) ? { ordered: !1 } : null;
}
function q(e) {
	let t = e.parentNode;
	if (t) {
		for (; e.firstChild;) t.insertBefore(e.firstChild, e);
		t.removeChild(e);
	}
}
function Ne(e, t) {
	let n = e.ownerDocument.createElement(t);
	for (let t of Array.from(e.attributes)) n.setAttribute(t.name, t.value);
	for (; e.firstChild;) n.appendChild(e.firstChild);
	return e.replaceWith(n), n;
}
function Pe(e) {
	return (e.getAttribute("style") ?? "").toLowerCase();
}
function Fe(e) {
	return /^(#000(000)?|black|windowtext|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|initial|inherit|auto)$/i.test(e.trim());
}
function Ie(e) {
	return /^(transparent|#fff(fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(.*,\s*0\s*\)|initial|inherit|auto|none)$/i.test(e.trim());
}
function Le(e, t) {
	let n = Array.from(e.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div")).filter((e) => {
		let t = Pe(e);
		return /mso-list:\s*l\d+/.test(t) ? !0 : /MsoListParagraph/i.test(e.className) && !!Me(e.textContent ?? "");
	});
	if (!n.length) return;
	let r = /* @__PURE__ */ new Set();
	for (let i of n) {
		if (r.has(i)) continue;
		let a = [], o = i;
		for (; o && n.includes(o);) {
			a.push(o), r.add(o);
			let e = o.nextSibling;
			for (; e && e.nodeType === 3 && !e.textContent.trim();) e = e.nextSibling;
			o = e && e.nodeType === 1 ? e : null;
		}
		let s = e.createElement("div");
		i.before(s);
		let c = [];
		for (let n of a) {
			let r = Pe(n), i = /mso-list:\s*l(\d+)\s+level(\d+)/.exec(r), a = i ? +i[2] : 1, o = n.querySelector("[style*=\"mso-list:ignore\" i], [style*=\"mso-list: ignore\" i]"), l = o?.textContent ?? "";
			o?.remove();
			let u = i ? t.get(`${i[1]}:${i[2]}`) : void 0, d = Me(l || (n.textContent ?? ""));
			if (u ||= d ?? { ordered: !1 }, !o && !i && d) {
				let t = e.createTreeWalker(n, NodeFilter.SHOW_TEXT).nextNode();
				t && (t.textContent = t.textContent.replace(u.ordered ? je : Ae, "").replace(/^[•·§●○▪]\s*/, ""));
			}
			for (; c.length && c[c.length - 1].level > a;) c.pop();
			let f = c[c.length - 1];
			if (!f || f.level < a) {
				let t = e.createElement(u.ordered ? "ol" : "ul");
				u.ordered && u.start && u.start > 1 && t.setAttribute("start", String(u.start)), (f?.list.lastElementChild ?? s).appendChild(t), f = {
					level: a,
					list: t
				}, c.push(f);
			}
			let p = e.createElement("li"), m = /^H[1-6]$/.test(n.tagName), h = e.createElement(m ? n.tagName.toLowerCase() : "p");
			for (; n.firstChild;) h.appendChild(n.firstChild);
			p.appendChild(h), f.list.appendChild(p), n.remove();
		}
		q(s);
	}
}
function Re(e) {
	let t = Array.from(e.body.querySelectorAll("span, font"));
	for (let n of t.reverse()) {
		if (!n.isConnected) continue;
		let t = Pe(n), r = [];
		/font-weight:\s*(bold|[6-9]00)/.test(t) && !n.closest("h1,h2,h3,h4,h5,h6,th,strong,b") && r.push("strong"), /font-style:\s*italic/.test(t) && r.push("em"), /text-decoration[^;]*underline/.test(t) && r.push("u"), /text-decoration[^;]*line-through/.test(t) && r.push("s"), /vertical-align:\s*super/.test(t) && r.push("sup"), /vertical-align:\s*sub\b/.test(t) && r.push("sub");
		let i = /(?:^|;)\s*color:\s*([^;]+)/.exec(t)?.[1]?.trim(), a = /background(?:-color)?:\s*([^;]+)/.exec(t)?.[1]?.trim(), o = [];
		i && !Fe(i) && o.push(`color: ${i}`), a && !Ie(a) && o.push(`background-color: ${a}`);
		let s = e.createDocumentFragment();
		for (; n.firstChild;) s.appendChild(n.firstChild);
		for (let t of r.reverse()) {
			let n = e.createElement(t);
			n.appendChild(s), s = n;
		}
		if (o.length) {
			let t = s, r = o.find((e) => e.startsWith("color")), i = o.find((e) => e.startsWith("background"));
			if (r) {
				let n = e.createElement("span");
				n.setAttribute("style", r), n.appendChild(t), t = n;
			}
			if (i) {
				let n = e.createElement("mark");
				n.setAttribute("data-color", i.split(":")[1].trim()), n.setAttribute("style", i), n.appendChild(t), t = n;
			}
			n.replaceWith(t);
		} else n.replaceWith(s);
	}
}
var ze = /^(p|h[1-6]|li|td|th)$/i;
function Be(e) {
	for (let t of Array.from(e.body.querySelectorAll("*"))) {
		let e = t.tagName.toLowerCase();
		for (let n of Array.from(t.attributes)) {
			let r = n.name.toLowerCase();
			if (r === "style") {
				if (e === "span" || e === "mark") continue;
				if (ze.test(e)) {
					let e = /text-align:\s*(left|center|right|justify)/i.exec(n.value)?.[1];
					e && e !== "left" ? t.setAttribute("style", `text-align: ${e}`) : t.removeAttribute("style");
				} else t.removeAttribute("style");
			} else if (r === "class") {
				let e = n.value.split(/\s+/).filter((e) => /^align(left|right|center)$/.test(e));
				e.length ? t.setAttribute("class", e.join(" ")) : t.removeAttribute("class");
			} else ([
				"id",
				"lang",
				"dir",
				"width",
				"height",
				"align",
				"valign",
				"border",
				"cellspacing",
				"cellpadding",
				"bgcolor",
				"nowrap"
			].includes(r) && e !== "img" || r.startsWith("x:") || r.startsWith("data-sheets") || r.startsWith("o:") || r.startsWith("v:")) && t.removeAttribute(n.name);
		}
	}
}
function Ve(e) {
	let t = Oe(e);
	if (typeof DOMParser > "u") return {
		html: He(e),
		source: t,
		droppedLocalImages: 0
	};
	let n = e.replace(/<!--(Start|End)Fragment-->/gi, "").replace(/<!\[if !supportLists\]>/gi, "<span style=\"mso-list:Ignore\">").replace(/<!\[endif\]>/gi, "</span>").replace(/<!\[if[^\]]*\]>/gi, "<span>").replace(/<!--\[if !supportLists\]-->/gi, "").replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "").replace(/<!--\[endif\]-->/gi, ""), r = ke(Array.from(n.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map((e) => e[1]).join("\n")), i = new DOMParser().parseFromString(n, "text/html"), a = i.body;
	a.querySelectorAll("style, meta, link, script, title, xml, template, noscript").forEach((e) => e.remove()), a.querySelectorAll("[style*=\"mso-element:comment\"], [style*=\"mso-element: comment\"], .msocomtxt, .MsoCommentReference").forEach((e) => e.remove());
	for (let e of Array.from(a.getElementsByTagName("*"))) {
		if (!e.tagName.includes(":")) continue;
		let t = e.tagName.toLowerCase();
		t === "o:p" || t.startsWith("w:") ? q(e) : e.remove();
	}
	a.querySelectorAll("br.Apple-interchange-newline").forEach((e) => e.remove()), a.querySelectorAll(".Apple-converted-space").forEach((e) => e.replaceWith(i.createTextNode(" "))), a.querySelectorAll("b[id^=\"docs-internal-guid\"], google-sheets-html-origin").forEach((e) => q(e)), a.querySelectorAll("a[name]:not([href])").forEach((e) => q(e));
	let o = 0;
	if (a.querySelectorAll("img").forEach((e) => {
		let t = e.getAttribute("src") ?? "";
		(/^file:/i.test(t) || /^(cid|webkit-fake-url):/i.test(t)) && (o++, e.remove());
	}), t === "word") {
		Le(i, r), a.querySelectorAll("p.MsoTitle").forEach((e) => Ne(e, "h1")), a.querySelectorAll("p.MsoSubtitle").forEach((e) => Ne(e, "h2"));
		for (let e = 1; e <= 6; e++) a.querySelectorAll(`p.MsoHeading${e}, p[class^="MsoHeading${e}"]`).forEach((t) => Ne(t, `h${e}`));
	}
	if (a.querySelectorAll("li > p:only-child").forEach((e) => q(e)), t === "gdocs") for (let e of Array.from(a.children).filter((e) => e.tagName === "BR")) e.replaceWith(i.createElement("p"));
	a.querySelectorAll("colgroup, col").forEach((e) => e.remove()), a.querySelectorAll("div[align] > table").forEach((e) => q(e.parentElement)), a.querySelectorAll("td > p:only-child, th > p:only-child").forEach((e) => {
		e.textContent?.trim() || (e.innerHTML = "");
	}), Re(i), Be(i), a.querySelectorAll("span:not([style]), font").forEach((e) => q(e));
	let s = i.createTreeWalker(a, NodeFilter.SHOW_TEXT);
	for (let e = s.nextNode(); e; e = s.nextNode()) e.parentElement?.closest("pre, code") || / /.test(e.textContent) && (e.textContent = e.textContent.replace(/ {2,}/g, " ").replace(/(\S) (\S)/g, "$1 $2"));
	return {
		html: a.innerHTML.trim(),
		source: t,
		droppedLocalImages: o
	};
}
function He(e) {
	let t = e;
	return t = t.replace(/<b[^>]*id="docs-internal-guid[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, "$1"), t = t.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, ""), t = t.replace(/<!\[if[^\]]*\]>[\s\S]*?<!\[endif\]>/gi, ""), t = t.replace(/<!--[\s\S]*?-->/g, ""), t = t.replace(/<\/?(o|w|m|v):[^>]*>/gi, ""), t = t.replace(/<xml[\s\S]*?<\/xml>/gi, ""), t = t.replace(/<style[\s\S]*?<\/style>/gi, ""), t = t.replace(/<meta[^>]*>/gi, "").replace(/<link[^>]*>/gi, ""), t = t.replace(/\s*mso-[^:;"']+:[^;"']+;?/gi, ""), t = t.replace(/\s+class="?Mso[^"\s>]*"?/gi, ""), t = t.replace(/<img[^>]+src=["']?file:[^>]*>/gi, ""), t = t.replace(/(&nbsp;\s*){2,}/g, " "), t;
}
//#endregion
//#region src/core/slash.ts
function Ue(e) {
	return e.toLocaleLowerCase("tr").replace(/[ıİ]/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").normalize("NFD").replace(/[̀-ͯ]/g, "");
}
var We = (e) => e.replace(/width="\d+" height="\d+"/, "width=\"18\" height=\"18\""), Ge = [
	{
		id: "p",
		title: (e) => e.paragraph,
		hint: (e) => e.slashParagraph,
		keywords: [
			"paragraf",
			"metin",
			"yazi",
			"text",
			"p"
		],
		icon: O.removeFormat,
		group: "block",
		run: (e) => e.chain().focus().setParagraph().run()
	},
	...[
		1,
		2,
		3
	].map((e) => ({
		id: `h${e}`,
		title: (t) => `${t.heading} ${e}`,
		hint: (e) => e.slashHeading,
		keywords: [
			`h${e}`,
			"baslik",
			"heading",
			"title",
			`#${"#".repeat(e - 1)}`
		],
		icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><text x="15" y="19" font-size="10" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${e}</text></svg>`,
		group: "block",
		run: (t) => t.chain().focus().setHeading({ level: e }).run()
	})),
	{
		id: "ul",
		title: (e) => e.slashBullet,
		hint: (e) => e.slashBulletHint,
		keywords: [
			"liste",
			"madde",
			"bullet",
			"ul",
			"list"
		],
		icon: O.bulletList,
		group: "list",
		run: (e) => e.chain().focus().toggleBulletList().run()
	},
	{
		id: "ol",
		title: (e) => e.slashOrdered,
		hint: (e) => e.slashOrderedHint,
		keywords: [
			"numara",
			"sirali",
			"liste",
			"ordered",
			"ol",
			"1."
		],
		icon: O.orderedList,
		group: "list",
		run: (e) => e.chain().focus().toggleOrderedList().run()
	},
	{
		id: "quote",
		title: (e) => e.slashQuote,
		hint: (e) => e.slashQuoteHint,
		keywords: [
			"alinti",
			"quote",
			"blockquote",
			"soz"
		],
		icon: O.quote,
		group: "list",
		run: (e) => e.chain().focus().toggleBlockquote().run()
	},
	{
		id: "code",
		title: (e) => e.slashCode,
		hint: (e) => e.slashCodeHint,
		keywords: [
			"kod",
			"code",
			"pre",
			"blok"
		],
		icon: O.code,
		group: "block",
		run: (e) => e.chain().focus().toggleCodeBlock().run()
	},
	{
		id: "table",
		title: (e) => e.tableMenu,
		hint: (e) => e.slashTableHint,
		keywords: [
			"tablo",
			"table",
			"cizelge",
			"grid"
		],
		icon: O.table,
		group: "table",
		run: (e) => e.chain().focus().insertTable({
			rows: 3,
			cols: 3,
			withHeaderRow: !0
		}).run()
	},
	{
		id: "image",
		title: (e) => e.slashImage,
		hint: (e) => e.slashImageHint,
		keywords: [
			"gorsel",
			"resim",
			"foto",
			"image",
			"img",
			"medya"
		],
		icon: O.image,
		group: "media",
		run: (e, t) => t.openMedia()
	},
	{
		id: "youtube",
		title: () => "YouTube",
		hint: (e) => e.slashYoutubeHint,
		keywords: [
			"youtube",
			"video",
			"gom",
			"embed"
		],
		icon: O.youtube,
		group: "embed",
		run: (e, t) => void t.insertYoutube()
	},
	{
		id: "hr",
		title: (e) => e.hr,
		hint: (e) => e.slashHrHint,
		keywords: [
			"cizgi",
			"ayirici",
			"hr",
			"divider",
			"line",
			"---"
		],
		icon: O.hr,
		group: "extra",
		run: (e) => e.chain().focus().setHorizontalRule().run()
	}
], Ke = class {
	constructor(e, t, n = []) {
		this.editor = e, this.host = t, this.extra = n, this.el = null, this.items = [], this.index = 0, this.range = null, this.dismissedAt = -1;
	}
	get isOpen() {
		return !!this.el;
	}
	update() {
		let e = this.editor, { selection: t } = e.state;
		if (!t.empty || !e.isEditable || !e.view.hasFocus()) return this.close();
		let n = t.$from, r = n.parent;
		if (r.type.name !== "paragraph" || n.depth > 3) return this.close();
		let i = r.textBetween(0, n.parentOffset, void 0, "￼"), a = /(?:^|\s)\/([\p{L}\p{N}#.-]{0,24})$/u.exec(i);
		if (!a) return this.close();
		let o = t.from - a[1].length - 1;
		if (o === this.dismissedAt || (this.range = {
			from: o,
			to: t.from
		}, this.filter(a[1]), !this.items.length && a[1].length > 6)) return this.close();
		this.render();
	}
	filter(e) {
		let t = Ue(e).split(/\s+/).filter(Boolean), n = [...Ge, ...this.extra].filter((e) => !e.group || this.host.hasGroup(e.group)), r = this.host.t, i = n.map((e) => {
			let n = [Ue(e.title(r)), ...e.keywords.map(Ue)], i = 0;
			for (let e of t) {
				let t = Math.min(...n.map((t) => t.startsWith(e) ? 0 : t.includes(e) ? 1 : 9));
				if (t === 9) return null;
				i += t;
			}
			return {
				item: e,
				score: i
			};
		}).filter(Boolean);
		i.sort((e, t) => e.score - t.score), this.items = i.map((e) => e.item), this.index = Math.min(this.index, Math.max(0, this.items.length - 1));
	}
	render() {
		let e = this.host.t;
		this.el || (this.el = k("div", {
			class: `zoro-root zoro-slash ${this.host.themeClass}`,
			role: "listbox",
			"aria-label": e.slashTitle
		}), this.el.addEventListener("mousedown", (e) => e.preventDefault()), document.body.append(this.el)), this.el.innerHTML = "", this.items.length ? this.items.forEach((t, n) => {
			let r = k("div", {
				class: "zoro-slash-item" + (n === this.index ? " active" : ""),
				role: "option",
				"aria-selected": String(n === this.index)
			}, k("span", {
				class: "zoro-slash-icon",
				html: We(t.icon)
			}), k("span", { class: "zoro-slash-text" }, k("strong", {}, t.title(e)), t.hint ? k("small", {}, t.hint(e)) : null));
			r.addEventListener("mouseenter", () => {
				this.index = n, this.highlight();
			}), r.addEventListener("click", () => this.choose(n)), this.el.append(r);
		}) : this.el.append(k("div", { class: "zoro-slash-empty" }, e.noResults)), this.position();
	}
	highlight() {
		this.el?.querySelectorAll(".zoro-slash-item").forEach((e, t) => {
			e.classList.toggle("active", t === this.index), e.setAttribute("aria-selected", String(t === this.index)), t === this.index && e.scrollIntoView?.({ block: "nearest" });
		});
	}
	position() {
		if (!this.el || !this.range) return;
		let e = this.editor.view.coordsAtPos(this.range.from), t = this.el.getBoundingClientRect(), n = document.documentElement.clientWidth, r = e.bottom + 6;
		r + t.height > window.innerHeight - 8 && e.top - t.height - 6 > 8 && (r = e.top - t.height - 6), this.el.style.top = `${Math.round(r)}px`, this.el.style.left = `${Math.round(Math.max(8, Math.min(e.left, n - t.width - 8)))}px`;
	}
	onKeyDown(e) {
		if (!this.el) return !1;
		let t = this.items.length;
		return e.key === "ArrowDown" ? (t && (this.index = (this.index + 1) % t, this.highlight()), !0) : e.key === "ArrowUp" ? (t && (this.index = (this.index - 1 + t) % t, this.highlight()), !0) : e.key === "Enter" || e.key === "Tab" ? t ? (this.choose(this.index), !0) : (this.close(), !1) : e.key === "Escape" && (this.dismissedAt = this.range?.from ?? -1, this.close(), !0);
	}
	choose(e) {
		let t = this.items[e], n = this.range;
		this.close(), t && n && (this.editor.chain().focus().deleteRange(n).run(), t.run(this.editor, this.host));
	}
	close() {
		this.el?.remove(), this.el = null, this.range = null, this.index = 0;
	}
	reposition() {
		this.el && this.position();
	}
}, qe = /* @__PURE__ */ new Set(/* @__PURE__ */ "p.h1.h2.h3.h4.h5.h6.ul.ol.li.blockquote.pre.table.thead.tbody.tfoot.tr.td.th.colgroup.col.figure.figcaption.div.hr.details.summary.section.article".split(".")), Je = /* @__PURE__ */ new Set([
	"img",
	"hr",
	"br",
	"col",
	"input",
	"source",
	"wbr",
	"embed"
]), Ye = "  ";
function Xe(e) {
	return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function Ze(e) {
	let t = `<${e.tagName.toLowerCase()}`;
	for (let n of Array.from(e.attributes)) t += n.value === "" && /^(data-|allowfullscreen|hidden)/.test(n.name) ? ` ${n.name}` : ` ${n.name}="${Xe(n.value)}"`;
	return t + ">";
}
function Qe(e) {
	for (let t of Array.from(e.childNodes)) if (t.nodeType === 1 && (qe.has(t.tagName.toLowerCase()) || t.tagName === "IFRAME")) return !1;
	return !0;
}
function $e(e) {
	if (![
		"li",
		"td",
		"th"
	].includes(e.tagName.toLowerCase())) return !1;
	let t = Array.from(e.childNodes).filter((e) => !(e.nodeType === 3 && !e.textContent.trim()));
	return t.length === 1 && t[0].nodeType === 1 && t[0].tagName === "P" && Qe(t[0]);
}
function et(e) {
	if (typeof document > "u") return {
		html: e,
		blockStarts: []
	};
	let t = document.createElement("template");
	t.innerHTML = e;
	let n = [], r = [], i = 0, a = (e, t = !1) => {
		t && r.push(i), n.push(e), i += e.length + 1;
	}, o = (e, t, n) => {
		let r = Ye.repeat(t);
		if (e.nodeType === 3) {
			let t = e.textContent.replace(/\s+/g, " ").trim();
			t && a(r + t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), n);
			return;
		}
		if (e.nodeType === 8 || e.nodeType !== 1) return;
		let i = e, c = i.tagName.toLowerCase();
		if (!(qe.has(c) || c === "iframe" || n && !s(i))) a(r + i.outerHTML, n);
		else if (Je.has(c)) a(r + Ze(i), n);
		else if (c === "pre" || Qe(i) || $e(i)) a(r + i.outerHTML, n);
		else {
			a(r + Ze(i), n);
			for (let e of Array.from(i.childNodes)) o(e, t + 1, !1);
			a(`${r}</${c}>`);
		}
	}, s = (e) => !["img", "iframe"].includes(e.tagName.toLowerCase()) && !qe.has(e.tagName.toLowerCase()), c = document.createTreeWalker(t.content, NodeFilter.SHOW_TEXT), l = [];
	for (let e = c.nextNode(); e; e = c.nextNode()) /^\s*\n\s*$/.test(e.textContent) && !e.parentElement?.closest("pre") && l.push(e);
	l.forEach((e) => e.parentNode?.removeChild(e));
	for (let e of Array.from(t.content.childNodes)) o(e, 0, !0);
	return {
		html: n.join("\n"),
		blockStarts: r
	};
}
function tt(e, t) {
	let n = -1, r = 0;
	for (let i = 0; i <= Math.min(t, e.length); i++) if (i === e.length || e[i] === "\n") {
		let a = e.slice(r, i);
		(r <= t && /^<(?!\/)/.test(a) || r <= t && a && !/^\s/.test(a) && !/^<\//.test(a)) && n++, r = i + 1;
	}
	return Math.max(0, n);
}
//#endregion
//#region src/core/html.ts
function J(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function nt(e) {
	return e.replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/blockquote|\/tr)\b[^>]*>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&[a-z]+;|&#\d+;/gi, "x");
}
function rt(e) {
	let t = nt(e).trim();
	return t ? t.split(/\s+/).filter(Boolean).length : 0;
}
function it(e) {
	return nt(e).replace(/\s+/g, " ").trim().length;
}
function at(e) {
	let t = e.replace(/<span[^>]*style=["'][^"']*color:\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, (e, t, n, r, i) => +t < 100 && +n < 100 && +r < 100 ? i : e).replace(/<span[^>]*style=["'][^"']*color:\s*#(?:000|111|222|333|444|555)[0-9a-f]*[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, "$1").replace(/\s*style=["']\s*["']/gi, "").replace(/<span>([\s\S]*?)<\/span>/gi, "$1").replace(/<p>\s*<\/p>/gi, "");
	return t = t.replace(/(<\/(?:p|h[1-6]|ul|ol|li|div|blockquote|table|thead|tbody|tr|td|th|figure|figcaption|pre)>)/gi, "$1\n").replace(/(<hr[^>]*>)/gi, "$1\n").replace(/(<(?:ul|ol|table|thead|tbody|tr)[^>]*>)/gi, "$1\n").replace(/([^\n])(<(?:h[1-6]|ul|ol|blockquote|table)[^>]*>)/gi, "$1\n$2").replace(/\n{3,}/g, "\n\n").trim(), t;
}
var ot = /^(https?:|mailto:|tel:|sms:|ftp:)/i;
function Y(e) {
	let t = e.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "");
	return t ? /^[/#?.]/.test(t) || !/^[a-z][a-z0-9+.-]*:/i.test(t) ? !0 : ot.test(t) : !1;
}
function st(e) {
	let t = e.trim();
	return !t || /^[/#?.]/.test(t) || /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? "mailto:" + t : "https://" + t;
}
function ct(e) {
	return Ve(e).html;
}
function lt(e) {
	return /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/i.test(e.trim());
}
//#endregion
//#region src/core/commands.ts
function ut(e) {
	let { state: t } = e, { from: n, empty: r } = t.selection;
	if (!r) return null;
	let i = t.doc.resolve(n), a = i.parent;
	if (!a.isTextblock) return null;
	let o = a.textContent, s = n - i.start(), c = /[\p{L}\p{N}_-]/u, l = s, u = s;
	for (; l > 0 && c.test(o[l - 1]);) l--;
	for (; u < o.length && c.test(o[u]);) u++;
	return l === u ? null : {
		from: i.start() + l,
		to: i.start() + u
	};
}
function X(e, t, n) {
	if (!e) return;
	let { from: r, to: i } = e.state.selection, a = ut(e), o = a || {
		from: r,
		to: i
	}, s = e.chain().focus();
	switch (a && s.setTextSelection(o), t) {
		case "toggleBold":
			s.toggleBold();
			break;
		case "toggleItalic":
			s.toggleItalic();
			break;
		case "toggleStrike":
			s.toggleStrike();
			break;
		case "toggleUnderline":
			s.toggleUnderline();
			break;
		case "toggleCode":
			s.toggleCode();
			break;
		case "setColor":
			n && s.setColor(n);
			break;
		case "unsetColor":
			s.unsetColor();
			break;
		case "toggleHighlight":
			n?.color ? s.setHighlight({ color: n.color }) : s.toggleHighlight();
			break;
		case "unsetHighlight": s.unsetHighlight();
	}
	a && s.setTextSelection(a.to), s.run();
}
function dt(e, t) {
	if (!e) return;
	let { from: n, to: r, empty: i } = e.state.selection;
	if (!i) {
		let t = e.state.doc.resolve(n), i = e.state.doc.resolve(r);
		if (t.parent === i.parent && t.parent.type.name === "paragraph") {
			let i = t.start(t.depth), a = t.end(t.depth);
			n <= i + 1 && r >= a - 1 || (r < a && (e.commands.setTextSelection(r), e.commands.splitBlock()), n > i && (e.commands.setTextSelection(n), e.commands.splitBlock()));
		}
	}
	e.chain().focus().toggleHeading({ level: t }).run();
}
function ft(e, t) {
	let n = e.isActive("listItem") ? "listItem" : null;
	n && (t > 0 ? e.chain().focus().sinkListItem(n).run() : e.chain().focus().liftListItem(n).run());
}
//#endregion
//#region src/core/groups.ts
var Z = (e) => e, pt = [
	{
		name: "block",
		row: 1,
		items: (e) => {
			let { t } = e, n = new P({
				items: [
					{
						value: "p",
						label: t.paragraph,
						shortcut: "Shift+Alt+7"
					},
					...[
						1,
						2,
						3,
						4,
						5,
						6
					].map((e) => ({
						value: `h${e}`,
						label: `${t.heading} ${e}`,
						shortcut: `Shift+Alt+${e}`,
						style: {
							fontSize: `${[
								24,
								20,
								18,
								16,
								14,
								13
							][e - 1]}px`,
							fontWeight: "600"
						}
					})),
					{
						value: "pre",
						label: t.preformatted,
						shortcut: "Shift+Alt+X",
						style: {
							fontFamily: "monospace",
							fontSize: "13px"
						}
					}
				],
				value: "p",
				label: t.paragraph,
				onChange: (t) => {
					let n = e.zoro.editor;
					t === "p" ? n.chain().focus().setParagraph().run() : t === "pre" ? n.chain().focus().toggleCodeBlock().run() : dt(n, +t.slice(1));
				}
			});
			return {
				el: n.render(),
				update: () => {
					let t = e.zoro.editor, r = "p";
					for (let e = 1; e <= 6; e++) t.isActive("heading", { level: e }) && (r = `h${e}`);
					t.isActive("codeBlock") && (r = "pre"), n.setValue(r);
				},
				destroy: () => n.destroy()
			};
		}
	},
	{
		name: "format",
		row: 1,
		items: [
			Z({
				name: "bold",
				icon: O.bold,
				title: (e) => e.bold,
				run: ({ editor: e }) => X(e, "toggleBold"),
				isActive: ({ editor: e }) => e.isActive("bold")
			}),
			Z({
				name: "italic",
				icon: O.italic,
				title: (e) => e.italic,
				run: ({ editor: e }) => X(e, "toggleItalic"),
				isActive: ({ editor: e }) => e.isActive("italic")
			}),
			Z({
				name: "underline",
				row: 2,
				icon: O.underline,
				title: (e) => e.underline,
				run: ({ editor: e }) => X(e, "toggleUnderline"),
				isActive: ({ editor: e }) => e.isActive("underline")
			}),
			Z({
				name: "strike",
				row: 2,
				icon: O.strikethrough,
				title: (e) => e.strike,
				run: ({ editor: e }) => X(e, "toggleStrike"),
				isActive: ({ editor: e }) => e.isActive("strike")
			}),
			Z({
				name: "code",
				row: 2,
				icon: O.code,
				title: (e) => e.code,
				run: ({ editor: e }) => X(e, "toggleCode"),
				isActive: ({ editor: e }) => e.isActive("code")
			}),
			Z({
				name: "superscript",
				row: 2,
				icon: O.superscript,
				title: (e) => e.superscript,
				run: ({ editor: e }) => e.chain().focus().toggleSuperscript().run(),
				isActive: ({ editor: e }) => e.isActive("superscript")
			}),
			Z({
				name: "subscript",
				row: 2,
				icon: O.subscript,
				title: (e) => e.subscript,
				run: ({ editor: e }) => e.chain().focus().toggleSubscript().run(),
				isActive: ({ editor: e }) => e.isActive("subscript")
			})
		]
	},
	{
		name: "list",
		row: 1,
		items: [
			Z({
				name: "bulletList",
				icon: O.bulletList,
				title: (e) => e.bulletList,
				run: ({ editor: e }) => e.chain().focus().toggleBulletList().run(),
				isActive: ({ editor: e }) => e.isActive("bulletList")
			}),
			Z({
				name: "orderedList",
				icon: O.orderedList,
				title: (e) => e.orderedList,
				run: ({ editor: e }) => e.chain().focus().toggleOrderedList().run(),
				isActive: ({ editor: e }) => e.isActive("orderedList")
			}),
			Z({
				name: "blockquote",
				icon: O.quote,
				title: (e) => e.blockquote,
				run: ({ editor: e }) => e.chain().focus().toggleBlockquote().run(),
				isActive: ({ editor: e }) => e.isActive("blockquote")
			})
		]
	},
	{
		name: "align",
		row: 1,
		items: [
			"left",
			"center",
			"right",
			"justify"
		].map((e) => Z({
			name: `align-${e}`,
			icon: O[`align${e[0].toUpperCase()}${e.slice(1)}`],
			title: (t) => t[`align${e[0].toUpperCase()}${e.slice(1)}`],
			run: ({ editor: t }) => t.chain().focus().setTextAlign(e).run(),
			isActive: ({ editor: t }) => t.isActive({ textAlign: e })
		}))
	},
	{
		name: "link",
		row: 1,
		items: [Z({
			name: "link",
			icon: O.link,
			title: (e) => e.link,
			run: ({ zoro: e }) => e.openLinkPopover(!0),
			isActive: ({ editor: e }) => e.isActive("link")
		}), Z({
			name: "unlink",
			row: 2,
			icon: O.unlink,
			title: (e) => e.unlink,
			run: ({ editor: e }) => e.chain().focus().extendMarkRange("link").unsetLink().run(),
			isEnabled: ({ editor: e }) => e.isActive("link")
		})]
	},
	{
		name: "table",
		row: 1,
		items: [Z({
			name: "table",
			icon: O.table,
			title: (e) => e.table,
			run: ({ zoro: e }, t) => e.openTableMenu(t.currentTarget),
			isActive: ({ editor: e }) => e.isActive("table")
		})]
	},
	{
		name: "media",
		row: 1,
		items: [Z({
			name: "image",
			icon: O.image,
			title: (e) => e.image,
			run: ({ zoro: e }) => e.openMedia()
		})]
	},
	{
		name: "embed",
		row: 2,
		items: [Z({
			name: "youtube",
			icon: O.youtube,
			title: (e) => e.youtube,
			run: ({ zoro: e }) => e.insertYoutube()
		})]
	},
	{
		name: "color",
		row: 2,
		items: [Z({
			name: "textColor",
			icon: O.textColor("#50575e"),
			title: (e) => e.textColor,
			run: ({ zoro: e }, t) => e.openColorPicker(t.currentTarget, "text")
		}), Z({
			name: "bgColor",
			icon: O.bgColor("#ffff00"),
			title: (e) => e.bgColor,
			run: ({ zoro: e }, t) => e.openColorPicker(t.currentTarget, "bg")
		})]
	},
	{
		name: "extra",
		row: 2,
		items: [
			Z({
				name: "hr",
				icon: O.hr,
				title: (e) => e.hr,
				run: ({ editor: e }) => e.chain().focus().setHorizontalRule().run()
			}),
			Z({
				name: "removeFormat",
				icon: O.removeFormat,
				title: (e) => e.removeFormat,
				run: ({ editor: e }) => e.chain().focus().unsetAllMarks().clearNodes().run()
			}),
			Z({
				name: "specialChars",
				icon: O.omega,
				title: (e) => e.specialChars,
				run: ({ zoro: e }, t) => e.openSpecialChars(t.currentTarget)
			})
		]
	},
	{
		name: "indent",
		row: 2,
		items: [Z({
			name: "outdent",
			icon: O.outdent,
			title: (e) => e.outdent,
			run: ({ editor: e }) => ft(e, -1),
			isEnabled: ({ editor: e }) => e.can().liftListItem("listItem")
		}), Z({
			name: "indent",
			icon: O.indent,
			title: (e) => e.indent,
			run: ({ editor: e }) => ft(e, 1),
			isEnabled: ({ editor: e }) => e.can().sinkListItem("listItem")
		})]
	},
	{
		name: "history",
		row: 2,
		items: [Z({
			name: "undo",
			icon: O.undo,
			title: (e) => e.undo,
			run: ({ editor: e }) => e.chain().focus().undo().run(),
			isEnabled: ({ editor: e }) => e.can().undo()
		}), Z({
			name: "redo",
			icon: O.redo,
			title: (e) => e.redo,
			run: ({ editor: e }) => e.chain().focus().redo().run(),
			isEnabled: ({ editor: e }) => e.can().redo()
		})]
	},
	{
		name: "help",
		row: 2,
		items: [Z({
			name: "help",
			icon: O.help,
			title: (e) => e.help,
			run: ({ zoro: e }) => e.showHelp(),
			keepFocus: !1
		})]
	},
	{
		name: "view",
		row: 1,
		items: []
	}
], mt = pt.map((e) => e.name), Q = {
	minimal: [
		"format",
		"link",
		"list"
	],
	basic: [
		"block",
		"format",
		"list",
		"link",
		"history",
		"view"
	],
	blog: [
		"block",
		"format",
		"list",
		"align",
		"link",
		"table",
		"media",
		"color",
		"extra",
		"indent",
		"history",
		"help",
		"view"
	],
	full: mt
}, ht = new Map(pt.map((e) => [e.name, e]));
function gt(e) {
	ht.set(e.name, e);
}
function _t(e, t) {
	Q[e] = t;
}
function $(e) {
	return ht.get(e);
}
function vt(e) {
	let t = e.groups ?? Q[e.preset ?? "full"] ?? Q.full, n = /* @__PURE__ */ new Set([...t, ...e.addGroups ?? []]);
	for (let t of e.removeGroups ?? []) n.delete(t);
	let r = [...n].filter((e) => ht.has(e)), i = [...ht.keys()];
	return r.sort((e, t) => {
		let n = mt.indexOf(e), r = mt.indexOf(t);
		return n >= 0 && r >= 0 ? n - r : n >= 0 ? -1 : r >= 0 ? 1 : i.indexOf(e) - i.indexOf(t);
	});
}
var yt = /* @__PURE__ */ "#000000.#434343.#666666.#999999.#b7b7b7.#cccccc.#d9d9d9.#efefef.#f3f3f3.#ffffff.#980000.#ff0000.#ff9900.#ffff00.#00ff00.#00ffff.#4a86e8.#0000ff.#9900ff.#ff00ff.#e6b8af.#f4cccc.#fce5cd.#fff2cc.#d9ead3.#d0e0e3.#c9daf8.#cfe2f3.#d9d2e9.#ead1dc".split("."), bt = [
	"#f6f7f7",
	"#f0f0f1",
	"#dcdcde",
	"#fcf0f1",
	"#fcf9e8",
	"#edfaef",
	"#e5f5fa",
	"#f0f6fc",
	"#f5effa",
	"#fff4e5",
	"#facfd2",
	"#f5e6ab",
	"#b8e6bf",
	"#9ec2e6",
	"#c5d9ed",
	"#d7c3e8",
	"#ffd8a8",
	"#ffe4e1",
	"#e8f5e9",
	"#e3f2fd"
], xt = /* @__PURE__ */ "©.®.™.€.£.¥.¢.₺.§.†.‡.•.….–.—.°.±.÷.×.¼.½.¾.¹.².³.Ω.π.∞.≠.≤.≥.←.→.↑.↓.«.».“.”.‘.’.✓.✗.★".split("."), St = "zoro-recent-colors";
function Ct() {
	try {
		return JSON.parse(localStorage.getItem(St) ?? "[]").filter((e) => /^#[0-9a-f]{3,6}$/i.test(e)).slice(0, 10);
	} catch {
		return [];
	}
}
function wt(e) {
	try {
		localStorage.setItem(St, JSON.stringify([e, ...Ct().filter((t) => t !== e)].slice(0, 10)));
	} catch {}
}
var Tt = { backgroundColor: {
	default: null,
	parseHTML: (e) => /background(?:-color)?:\s*([^;]+)/i.exec(e.getAttribute("style") ?? "")?.[1]?.trim() || e.getAttribute("data-background-color") || null,
	renderHTML: (e) => e.backgroundColor ? { style: `background-color: ${e.backgroundColor}` } : {}
} };
function Et(e) {
	return new Promise((t) => {
		if (typeof Image > "u" || /jsdom/i.test(navigator.userAgent)) return t();
		let n = new Image(), r = () => t(), i = setTimeout(r, 4e3);
		n.onload = () => {
			clearTimeout(i), (n.decode?.() ?? Promise.resolve()).then(r, r);
		}, n.onerror = () => {
			clearTimeout(i), r();
		}, n.src = e;
	});
}
var Dt = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif"
], Ot = 0;
function kt(e) {
	try {
		return localStorage.getItem(e);
	} catch {
		return null;
	}
}
function At(e, t) {
	try {
		t === null ? localStorage.removeItem(e) : localStorage.setItem(e, t);
	} catch {}
}
var jt = class {
	static {
		this.registerGroup = gt;
	}
	static {
		this.registerPreset = _t;
	}
	static {
		this.presets = Q;
	}
	constructor(e, t = {}) {
		if (this.id = `zoro-${++Ot}`, this.mode = "visual", this.bubble = null, this.tableBar = null, this.slash = null, this.tableBarButtons = [], this.bubbleButtons = [], this.draftBar = null, this.buttons = [], this.widgets = [], this.viewEls = {}, this.fullscreen = !1, this.inputEl = null, this.replacedTextarea = null, this.cleanups = [], this.listeners = /* @__PURE__ */ new Map(), this.linkRange = null, this.rafId = 0, this.sourceCursor = {
			start: 0,
			end: 0
		}, this.sourceSnapshot = "", this.lastColors = {
			text: "#50575e",
			bg: "#ffff00"
		}, this.destroyed = !1, this.onToolbarKey = (e) => {
			let t = Array.from(this.toolbarEl.querySelectorAll("button, .zoro-select-trigger")).filter((e) => e.offsetParent !== null && !e.disabled), n = t.indexOf(document.activeElement);
			if (n < 0) return;
			let r = -1;
			if (e.key === "ArrowRight") r = (n + 1) % t.length;
			else if (e.key === "ArrowLeft") r = (n - 1 + t.length) % t.length;
			else if (e.key === "Home") r = 0;
			else if (e.key === "End") r = t.length - 1;
			else if (e.key === "Escape") {
				e.preventDefault(), this.focus();
				return;
			}
			r < 0 || (e.preventDefault(), t[n].setAttribute("tabindex", "-1"), t[r].setAttribute("tabindex", "0"), t[r].focus());
		}, typeof document > "u") throw Error("ZoroEditor only runs in the browser (use zoro-editor/react for SSR frameworks).");
		let n = typeof e == "string" ? document.querySelector(e) : e;
		if (!n) throw Error(`ZoroEditor: target element not found (${String(e)})`);
		this.options = {
			height: 400,
			autoGrow: !0,
			statusBar: !0,
			sourceMode: !0,
			stickyToolbar: !0,
			theme: "light",
			...t
		}, this.t = w(this.options.locale), this.groups = vt(this.options), this.adapter = this.options.media === !1 ? null : Te(this.options.media ?? {}), this.showRow2 = kt("zoro-kitchen-sink") === "1", this.linkPopover = new N("", () => {
			this.linkRange = null;
		}), this.colorPopover = new N("");
		let r = this.options.content;
		n instanceof HTMLTextAreaElement ? (r ??= n.value, this.inputEl = n, this.replacedTextarea = {
			el: n,
			display: n.style.display
		}, n.style.display = "none", this.buildDom(), n.insertAdjacentElement("afterend", this.root)) : (this.buildDom(), n.appendChild(this.root)), !this.inputEl && this.options.input && (this.inputEl = typeof this.options.input == "string" ? document.querySelector(this.options.input) : this.options.input, this.inputEl && r == null && (r = this.inputEl.value)), this.initEditor(r ?? ""), de(), this.slash = new Ke(this.editor, this), this.renderToolbar(), this.bindEvents(), this.updateCounts(), this.setupDraft(r ?? ""), this.syncInput(), queueMicrotask(() => {
			this.destroyed || (this.options.onReady?.(this), this.emit("ready", this));
		});
	}
	getHTML() {
		return this.mode === "code" ? this.sourceEl.value.trim() : !this.editor || this.docIsEmpty() ? "" : at(this.editor.getHTML().replace(/<img[^>]*src="blob:[^"]*"[^>]*>/g, ""));
	}
	getText() {
		return this.editor?.getText() ?? "";
	}
	isEmpty() {
		return this.mode === "code" ? !this.sourceEl.value.trim() : this.docIsEmpty();
	}
	docIsEmpty() {
		let e = this.editor.state.doc, t = e.firstChild;
		return e.childCount === 0 || e.childCount === 1 && !!t && t.type.name === "paragraph" && t.content.size === 0;
	}
	setContent(e, t = !1) {
		this.destroyed || (this.editor.commands.setContent(e || "", { emitUpdate: !1 }), this.sourceEl.value = this.mode === "code" ? at(this.editor.getHTML()) : "", this.updateCounts(), this.syncInput(), t && this.fireChange());
	}
	insertHTML(e) {
		this.mode === "code" ? this.insertIntoSource(e) : this.editor.chain().focus().insertContent(e).run();
	}
	insertImage(e) {
		this.mode === "code" ? this.insertIntoSource(`<img src="${J(e.src)}" alt="${J(e.alt ?? "")}"${e.srcset ? ` srcset="${J(e.srcset)}"` : ""}>`) : this.editor.chain().focus().setImage({
			...e,
			srcset: e.srcset ?? null
		}).run();
	}
	focus() {
		this.mode === "code" ? this.sourceEl.focus() : this.editor.commands.focus();
	}
	setReadOnly(e) {
		this.options.readOnly = e, this.editor.setEditable(!e), this.root.classList.toggle("zoro-readonly", e), this.sourceEl.readOnly = e;
	}
	setTheme(e) {
		this.options.theme = e, this.root.classList.remove("zoro-theme-dark", "zoro-theme-auto"), e !== "light" && this.root.classList.add(`zoro-theme-${e}`), this.hideBubble();
	}
	addGroups(e) {
		this.setGroups([...this.groups, ...e]);
	}
	removeGroups(e) {
		this.setGroups(this.groups.filter((t) => !e.includes(t)));
	}
	setPreset(e, t) {
		this.groups = vt({
			preset: e,
			...t
		}), this.renderToolbar();
	}
	setGroups(e) {
		this.groups = vt({ groups: e }), this.renderToolbar();
	}
	getGroups() {
		return [...this.groups];
	}
	hasGroup(e) {
		return this.groups.includes(e);
	}
	on(e, t) {
		return this.listeners.has(e) || this.listeners.set(e, /* @__PURE__ */ new Set()), this.listeners.get(e).add(t), () => this.listeners.get(e)?.delete(t);
	}
	setMode(e) {
		if (!(e === this.mode || e === "code" && this.options.sourceMode === !1)) {
			if (e === "code") {
				let { html: e, blockStarts: t } = et(this.getHTML()), n = this.editor.state.selection.$from.index(0);
				this.sourceEl.value = e, this.sourceSnapshot = e, this.mode = "code", this.contentEl.hidden = !0, this.sourceEl.hidden = !1, this.autosizeSource();
				let r = t[Math.min(n, t.length - 1)] ?? 0;
				this.sourceCursor = {
					start: r,
					end: r
				}, requestAnimationFrame(() => {
					this.sourceEl.setSelectionRange(r, r), this.revealSourceCaret(r);
				});
			} else {
				let e = this.sourceEl.value, t = this.sourceEl.selectionStart ?? 0;
				if (e !== this.sourceSnapshot) {
					this.editor.commands.setContent(e, { emitUpdate: !1 });
					let n = this.editor.state.doc, r = Math.min(tt(e, t), n.childCount - 1), i = 0;
					for (let e = 0; e < r; e++) i += n.child(e).nodeSize;
					try {
						this.editor.view.dispatch(this.editor.state.tr.setSelection(b.near(n.resolve(Math.min(i + 1, n.content.size)))).scrollIntoView());
					} catch {}
				}
				this.mode = "visual", this.sourceEl.hidden = !0, this.contentEl.hidden = !1;
			}
			this.root.classList.toggle("zoro-mode-code", this.mode === "code"), this.viewEls.visual?.classList.toggle("active", this.mode === "visual"), this.viewEls.code?.classList.toggle("active", this.mode === "code"), this.viewEls.visual?.setAttribute("aria-pressed", String(this.mode === "visual")), this.viewEls.code?.setAttribute("aria-pressed", String(this.mode === "code")), this.scheduleToolbarUpdate(), this.emit("mode", this.mode), this.focus();
		}
	}
	toggleFullscreen(e) {
		this.fullscreen = e ?? !this.fullscreen, this.root.classList.toggle("zoro-fullscreen", this.fullscreen), document.body.classList.toggle("zoro-scroll-lock", this.fullscreen || !!document.querySelector(".zoro-dialog-overlay"));
		let t = this.viewEls.fullscreen;
		if (t) {
			t.innerHTML = this.fullscreen ? O.minimize : O.maximize;
			let e = this.fullscreen ? this.t.exitFullscreen : this.t.fullscreen;
			t.setAttribute("data-tip", e), t.setAttribute("aria-label", e), t.setAttribute("aria-pressed", String(this.fullscreen));
		}
		this.focus();
	}
	openMedia() {
		if (this.adapter) this.finder({
			multiple: !0,
			onSelect: (e) => this.insertMedia(e)
		});
		else if (this.options.onImageUpload) {
			let e = k("input", {
				type: "file",
				accept: (this.mediaOpts.accept ?? Dt).join(","),
				multiple: !0
			});
			e.addEventListener("change", () => this.handleFiles(Array.from(e.files ?? []), null)), e.click();
		} else F(this.t.uploadNotConfigured, "error", this.themeClass);
	}
	finder(e = {}) {
		if (!this.adapter) return null;
		let t = this.mediaOpts, n = new Ee({
			adapter: this.adapter,
			messages: this.t,
			themeClass: this.themeClass,
			multiple: e.multiple,
			accept: t.accept,
			maxSizeMB: t.maxSizeMB,
			requireAlt: t.requireAlt,
			folders: t.folders,
			onSelect: e.onSelect,
			tab: e.files?.length ? "upload" : "library",
			onClose: () => this.mode === "visual" && this.editor.commands.focus()
		}).open();
		return e.files?.length && n.addFiles(e.files), n;
	}
	insertMedia(e) {
		let t = this.mediaOpts.insertVariant ?? "lg";
		if (this.mode === "code") {
			for (let n of e) {
				let e = G(n, t);
				this.insertIntoSource(`<img src="${J(e.src)}" alt="${J(n.insertAlt)}"${e.srcset ? ` srcset="${J(e.srcset)}" sizes="(max-width: 768px) 100vw, 768px"` : ""}>`);
			}
			return;
		}
		let n = e.map((e) => {
			let n = G(e, t);
			return {
				type: "image",
				attrs: {
					src: n.src,
					alt: e.insertAlt || null,
					srcset: n.srcset,
					sizes: n.srcset ? "(max-width: 768px) 100vw, 768px" : null,
					caption: e.caption || null
				}
			};
		});
		this.editor.chain().focus().insertContent(n).run();
	}
	clearDraft() {
		let e = this.draftKey;
		e && At(e, null), this.draftBar?.remove(), this.draftBar = null;
	}
	destroy() {
		if (!this.destroyed) {
			this.destroyed = !0, cancelAnimationFrame(this.rafId), clearTimeout(this.draftTimer), this.linkPopover.close(), this.colorPopover.close(), this.hideBubble(), this.hideTableBar(), this.slash?.close();
			for (let e of this.widgets) e.destroy?.();
			for (let e of this.cleanups) e();
			this.cleanups = [], this.fullscreen && this.toggleFullscreen(!1), this.editor?.destroy(), this.root.remove(), this.replacedTextarea && (this.replacedTextarea.el.style.display = this.replacedTextarea.display), this.emit("destroy"), this.listeners.clear();
		}
	}
	get isDestroyed() {
		return this.destroyed;
	}
	get themeClass() {
		let e = this.options.theme;
		return [`zoro-skin-${this.skin}`, e && e !== "light" ? `zoro-theme-${e}` : ""].filter(Boolean).join(" ");
	}
	get skin() {
		return this.options.skin === "classic" ? "classic" : "modern";
	}
	setSkin(e) {
		this.root.classList.remove(`zoro-skin-${this.skin}`), this.options.skin = e, this.root.classList.add(`zoro-skin-${e}`), this.hideBubble(), this.renderToolbar();
	}
	get mediaOpts() {
		return this.options.media || {};
	}
	get draftKey() {
		let e = this.options.autosave;
		return e ? "zoro-draft:" + (typeof e == "string" ? e : e.key) : null;
	}
	get mediaAvailable() {
		return this.options.media !== !1 && (!!this.adapter || !!this.options.onImageUpload);
	}
	buildDom() {
		let e = this.t;
		this.root = k("div", {
			class: [
				"zoro-root",
				"zoro-editor-wrapper",
				this.themeClass,
				this.options.readOnly ? "zoro-readonly" : "",
				this.options.className ?? ""
			].filter(Boolean).join(" "),
			id: this.id
		});
		let t = this.options.stickyToolbar;
		t !== !1 && (this.root.classList.add("zoro-sticky"), typeof t == "number" && this.root.style.setProperty("--zoro-sticky-top", `${t}px`)), this.topBar = k("div", { class: "zoro-topbar" }), this.toolbarEl = k("div", {
			class: "zoro-toolbar",
			role: "toolbar",
			"aria-label": e.toolbarLabel,
			"aria-controls": `${this.id}-content`
		}), this.row1 = k("div", { class: "zoro-toolbar-row zoro-row1" }), this.row2 = k("div", { class: "zoro-toolbar-row zoro-row2" }), this.toolbarEl.append(this.row1, this.row2), this.contentEl = k("div", {
			class: "zoro-content",
			id: `${this.id}-content`
		});
		let n = this.options.height;
		this.contentEl.style.setProperty("--zoro-height", `${n}px`), this.options.autoGrow || this.contentEl.classList.add("zoro-fixed-height"), this.sourceEl = k("textarea", {
			class: "zoro-source",
			hidden: !0,
			spellcheck: !1,
			placeholder: e.sourcePlaceholder,
			"aria-label": e.source,
			autocapitalize: "off",
			autocomplete: "off"
		}), this.sourceEl.style.minHeight = `${n}px`, this.sourceEl.readOnly = !!this.options.readOnly, this.statusEl = k("div", {
			class: "zoro-status-bar",
			"aria-live": "off"
		}), this.pathEl = k("div", {
			class: "zoro-path",
			"aria-label": e.path
		}), this.countsEl = k("div", { class: "zoro-counts" }), this.statusEl.append(this.pathEl, this.countsEl), this.options.statusBar === !1 && (this.statusEl.hidden = !0), this.frame = k("div", { class: "zoro-frame" }, this.toolbarEl, this.contentEl, this.sourceEl, this.statusEl), this.root.append(this.topBar, this.frame);
	}
	initEditor(t) {
		let n = this.t, r = this.groups.flatMap((e) => $(e)?.extensions ?? []), y = a.extend({ addAttributes() {
			return {
				...this.parent?.(),
				title: { default: null }
			};
		} }).configure({
			openOnClick: !1,
			autolink: !0,
			linkOnPaste: !0,
			defaultProtocol: "https",
			HTMLAttributes: {
				target: null,
				rel: null,
				class: null
			},
			isAllowedUri: (e, t) => Y(e) && t.defaultValidate(e)
		}), b = [
			i.configure({
				link: !1,
				heading: { levels: [
					1,
					2,
					3,
					4,
					5,
					6
				] },
				undoRedo: { depth: 200 }
			}),
			y,
			ge.configure({
				messages: n,
				themeClass: () => this.themeClass
			}),
			o.configure({ types: ["heading", "paragraph"] }),
			c,
			s,
			l.configure({ multicolor: !0 }),
			h,
			g,
			u.configure({
				resizable: !0,
				cellMinWidth: 48
			}),
			p,
			d.extend({ addAttributes() {
				return {
					...this.parent?.(),
					...Tt
				};
			} }),
			f.extend({ addAttributes() {
				return {
					...this.parent?.(),
					...Tt
				};
			} }),
			m.configure({
				nocookie: !0,
				modestBranding: !0,
				width: 640,
				height: 360
			}),
			v.configure({ placeholder: this.options.placeholder ?? n.placeholder }),
			_.configure({ limit: this.options.maxLength ?? null }),
			...r,
			...this.options.extensions ?? []
		];
		this.editor = new e({
			element: this.contentEl,
			extensions: b,
			content: t,
			editable: !this.options.readOnly,
			injectCSS: !1,
			editorProps: {
				attributes: {
					class: "zoro-prose",
					"aria-label": n.editorLabel,
					role: "textbox",
					"aria-multiline": "true"
				},
				handleKeyDown: (e, t) => this.slashEnabled && this.slash ? this.slash.onKeyDown(t) : !1,
				transformPastedHTML: (e) => {
					let t = Ve(e);
					return t.droppedLocalImages && F(T(n.localImagesDropped, { n: t.droppedLocalImages }), "info", this.themeClass, 5e3), t.html;
				},
				handlePaste: (e, t) => {
					let n = t.clipboardData, r = Array.from(n?.files ?? []);
					if (!r.length) return this.smartPaste(n);
					let i = n?.getData("text/html") ?? "";
					return i && i.replace(/<img[^>]*>/gi, "").replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "") ? !1 : this.handleFiles(r, null);
				},
				handleDrop: (e, t, n, r) => {
					if (r) return !1;
					let i = Array.from(t.dataTransfer?.files ?? []);
					if (!i.length) return !1;
					let a = e.posAtCoords({
						left: t.clientX,
						top: t.clientY
					})?.pos ?? null;
					return t.preventDefault(), this.handleFiles(i, a);
				}
			},
			onUpdate: () => this.fireChange(),
			onSelectionUpdate: () => {
				this.scheduleToolbarUpdate(), this.syncLinkPopover();
			},
			onTransaction: () => {
				this.scheduleToolbarUpdate(), this.slash && (this.slashEnabled && this.mode === "visual" ? this.slash.update() : this.slash.close());
			},
			onFocus: () => {
				this.root.classList.add("zoro-focused"), this.options.onFocus?.(), this.emit("focus");
			},
			onBlur: () => {
				this.root.classList.remove("zoro-focused"), requestAnimationFrame(() => {
					this.editor?.view.hasFocus() || (this.slash?.close(), this.hideBubble(), document.querySelector(".zoro-popover") || this.hideTableBar());
				}), this.options.onBlur?.(), this.emit("blur");
			}
		});
	}
	fireChange() {
		if (this.destroyed) return;
		let e = this.getHTML();
		this.updateCounts(), this.syncInput(e), this.scheduleDraft(e), this.options.onChange?.(e), this.emit("change", e);
	}
	emit(e, t) {
		this.listeners.get(e)?.forEach((e) => {
			try {
				e(t);
			} catch (e) {
				console.error(e);
			}
		});
	}
	syncInput(e = this.getHTML()) {
		this.inputEl && this.inputEl.value !== e && (this.inputEl.value = e, this.inputEl.dispatchEvent(new Event("input", { bubbles: !0 })));
	}
	updateCounts() {
		if (this.options.statusBar === !1) return;
		let e = this.t, t = this.mode === "visual" && !!this.editor, n = t ? "" : this.sourceEl.value, r = t ? this.editor.storage.characterCount.words() : rt(n), i = t ? this.editor.storage.characterCount.characters() : it(n), a = this.options.maxLength;
		this.countsEl.innerHTML = "", this.countsEl.append(k("span", {}, `${r} ${e.words}`), k("span", { class: a && i >= a ? "zoro-limit" : "" }, a ? `${i} / ${a} ${e.chars}` : `${i} ${e.chars}`));
	}
	updatePath() {
		if (this.options.statusBar === !1 || !this.editor) return;
		let e = {
			paragraph: "p",
			bulletList: "ul",
			orderedList: "ol",
			listItem: "li",
			blockquote: "blockquote",
			codeBlock: "pre",
			table: "table",
			tableRow: "tr",
			tableCell: "td",
			tableHeader: "th",
			image: "img",
			horizontalRule: "hr",
			youtube: "iframe"
		}, t = {
			bold: "strong",
			italic: "em",
			underline: "u",
			strike: "s",
			code: "code",
			link: "a",
			highlight: "mark"
		}, { selection: n } = this.editor.state, r = [];
		if (this.mode === "code") r.push("HTML");
		else {
			let i = n.$from;
			for (let t = 1; t <= i.depth; t++) {
				let n = i.node(t);
				r.push(n.type.name === "heading" ? `h${n.attrs.level}` : e[n.type.name] ?? n.type.name);
			}
			let a = n;
			if (a.node) r.push(e[a.node.type.name] ?? a.node.type.name);
			else for (let e of i.marks()) t[e.type.name] && r.push(t[e.type.name]);
		}
		let i = r.join(" › ");
		this.pathEl.textContent !== i && (this.pathEl.textContent = i);
	}
	get slashEnabled() {
		return this.options.slashMenu ?? this.skin === "modern";
	}
	get bubbleEnabled() {
		return this.options.bubbleMenu ?? this.skin === "modern";
	}
	bubbleDefs() {
		let e = [
			"bold",
			"italic",
			"underline",
			"strike",
			"code",
			"link"
		], t = [...$("format")?.items, ...$("link")?.items], n = e.map((e) => t.find((t) => t.name === e)).filter(Boolean);
		return this.hasGroup("color") && n.push({
			name: "bubbleHighlight",
			icon: O.bgColor("#ffe066"),
			title: (e) => e.bgColor,
			run: ({ editor: e }) => X(e, "toggleHighlight", { color: "#ffe066" }),
			isActive: ({ editor: e }) => e.isActive("highlight")
		}), n;
	}
	updateBubble() {
		let e = this.editor;
		if (e?.view.composing) return;
		if (!this.bubbleEnabled || !e || this.mode !== "visual" || !e.isEditable || this.destroyed) return this.hideBubble();
		let { selection: t } = e.state;
		if (t.empty || t.node || e.isActive("codeBlock") || !e.state.doc.textBetween(t.from, t.to, " ").trim() || !e.view.hasFocus() || this.linkPopover.isOpen) return this.hideBubble();
		this.bubble || (this.bubble = k("div", {
			class: `zoro-root zoro-bubble ${this.themeClass}`,
			role: "toolbar",
			"aria-label": this.t.formatMenu
		}), this.bubbleButtons = this.bubbleDefs().map((e) => {
			let t = this.makeButton(e);
			return t.classList.add("zoro-bubble-btn"), this.bubble.append(t), {
				el: t,
				def: e
			};
		}), document.body.append(this.bubble));
		for (let { el: e, def: t } of this.bubbleButtons) {
			let n = !1;
			try {
				n = !!t.isActive?.(this.ctx);
			} catch {}
			e.classList.toggle("zoro-toolbar-btn-active", n), e.setAttribute("aria-pressed", String(n));
		}
		let n = e.view.coordsAtPos(t.from), r = e.view.coordsAtPos(t.to), i = this.bubble.getBoundingClientRect(), a = document.documentElement.clientWidth, o = typeof matchMedia == "function" && matchMedia("(pointer: coarse)").matches, s = this.contentEl.getBoundingClientRect(), c = Math.abs(n.top - r.top) < 4 ? (n.left + r.right) / 2 : (s.left + s.right) / 2, l = this.options.stickyToolbar === !1 ? 0 : this.toolbarEl.getBoundingClientRect().bottom, u = Math.max(8, l + 4, s.top), d = Math.min(window.innerHeight, s.bottom);
		this.bubble.style.visibility = r.bottom < u || n.top > d ? "hidden" : "";
		let f = o ? r.bottom + 12 : n.top - i.height - 10;
		f < u && (f = r.bottom + 12), this.bubble.style.top = `${Math.round(f)}px`, this.bubble.style.left = `${Math.round(Math.max(8, Math.min(c - i.width / 2, a - i.width - 8)))}px`;
	}
	tableDefs() {
		let e = (e) => ({ editor: t }) => e(t.chain().focus()).run();
		return [
			{
				name: "tRowBefore",
				icon: O.rowAbove,
				title: (e) => e.tableAddRowBefore,
				run: e((e) => e.addRowBefore())
			},
			{
				name: "tRowAfter",
				icon: O.rowBelow,
				title: (e) => e.tableAddRowAfter,
				run: e((e) => e.addRowAfter())
			},
			{
				name: "tRowDelete",
				icon: O.rowDelete,
				title: (e) => e.tableDeleteRow,
				run: e((e) => e.deleteRow())
			},
			{
				name: "tColBefore",
				icon: O.colLeft,
				title: (e) => e.tableAddColBefore,
				run: e((e) => e.addColumnBefore())
			},
			{
				name: "tColAfter",
				icon: O.colRight,
				title: (e) => e.tableAddColAfter,
				run: e((e) => e.addColumnAfter())
			},
			{
				name: "tColDelete",
				icon: O.colDelete,
				title: (e) => e.tableDeleteCol,
				run: e((e) => e.deleteColumn())
			},
			{
				name: "tMerge",
				icon: O.merge,
				title: (e) => e.tableMerge,
				run: e((e) => e.mergeOrSplit()),
				isEnabled: ((e) => ({ editor: t }) => !!e(t.can().chain().focus()).run())((e) => e.mergeOrSplit())
			},
			{
				name: "tHeaderRow",
				icon: O.headerRow,
				title: (e) => e.tableToggleHeader,
				run: e((e) => e.toggleHeaderRow())
			},
			{
				name: "tHeaderCol",
				icon: O.headerCol,
				title: (e) => e.tableToggleHeaderCol,
				run: e((e) => e.toggleHeaderColumn())
			},
			{
				name: "tCellBg",
				icon: O.bgColor("#cfe2f3"),
				title: (e) => e.tableCellBg,
				run: ({ zoro: e }, t) => e.openCellColor(t.currentTarget)
			},
			{
				name: "tDelete",
				icon: O.trash,
				title: (e) => e.tableDelete,
				run: e((e) => e.deleteTable())
			}
		];
	}
	updateTableBar() {
		let e = this.editor;
		if (!(e && this.hasGroup("table") && this.mode === "visual" && e.isEditable && e.isActive("table") && e.view.hasFocus() && !this.destroyed)) return this.hideTableBar();
		let t = e.state.selection.$from, n = -1;
		for (let e = t.depth; e > 0; e--) if (t.node(e).type.name === "table") {
			n = t.before(e);
			break;
		}
		let r = n >= 0 ? e.view.nodeDOM(n) : null;
		if (!r) return this.hideTableBar();
		if (!this.tableBar) {
			this.tableBar = k("div", {
				class: `zoro-root zoro-context-bar ${this.themeClass}`,
				role: "toolbar",
				"aria-label": this.t.tableToolbar
			});
			let e = [
				[0, 3],
				[3, 6],
				[6, 7],
				[7, 10],
				[10, 11]
			], t = this.tableDefs();
			this.tableBarButtons = [];
			for (let [n, r] of e) {
				let e = k("div", { class: "zoro-group" });
				for (let i of t.slice(n, r)) {
					let t = this.makeButton(i);
					i.name === "tDelete" && t.classList.add("zoro-danger-btn"), this.tableBarButtons.push({
						el: t,
						def: i
					}), e.append(t);
				}
				this.tableBar.append(e);
			}
			document.body.append(this.tableBar);
		}
		for (let { el: e, def: t } of this.tableBarButtons) try {
			e.disabled = t.isEnabled ? !t.isEnabled(this.ctx) : !1;
		} catch {
			e.disabled = !1;
		}
		let i = r.getBoundingClientRect(), a = this.tableBar.getBoundingClientRect(), o = document.documentElement.clientWidth, s = this.options.stickyToolbar === !1 ? 0 : this.toolbarEl.getBoundingClientRect().bottom, c = this.contentEl.getBoundingClientRect(), l = i.top - a.height - 8;
		l < Math.max(8, s + 4) && (l = i.bottom + 8);
		let u = i.bottom > Math.max(s, c.top) && i.top < Math.min(window.innerHeight, c.bottom);
		this.tableBar.style.visibility = u ? "" : "hidden", this.tableBar.style.top = `${Math.round(Math.min(l, window.innerHeight - a.height - 8))}px`, this.tableBar.style.left = `${Math.round(Math.max(8, Math.min(i.left, o - a.width - 8)))}px`;
	}
	hideTableBar() {
		this.tableBar?.remove(), this.tableBar = null, this.tableBarButtons = [];
	}
	openCellColor(e) {
		let t = this.t, n = new N(this.themeClass), r = (e) => {
			n.close(), this.editor.chain().focus().setCellAttribute("backgroundColor", e).run();
		}, i = k("div", { class: "zoro-color-grid" });
		for (let e of bt) i.append(k("button", {
			type: "button",
			class: "zoro-color-swatch",
			title: e,
			"aria-label": e,
			style: { backgroundColor: e },
			onmousedown: (e) => e.preventDefault(),
			onclick: () => r(e)
		}));
		n.open(k("div", {}, i, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-sm zoro-btn-block",
			onmousedown: (e) => e.preventDefault(),
			onclick: () => r(null)
		}, t.removeColor)), e);
	}
	hideBubble() {
		this.bubble?.remove(), this.bubble = null, this.bubbleButtons = [];
	}
	get ctx() {
		return {
			editor: this.editor,
			zoro: this,
			t: this.t
		};
	}
	renderToolbar() {
		let e = this.t;
		for (let e of this.widgets) e.destroy?.();
		this.widgets = [], this.buttons = [], this.viewEls = {}, this.row1.innerHTML = "", this.row2.innerHTML = "", this.topBar.innerHTML = "";
		let t = k("div", { class: "zoro-toolbar-controls" }), n = k("div", { class: "zoro-toolbar-controls" }), r = k("div", { class: "zoro-toolbar-end" });
		for (let e of this.groups) {
			if (e === "view" || e === "media" && !this.mediaAvailable) continue;
			let i = $(e);
			if (!i) continue;
			let a = i.row ?? 1, o = k("div", {
				class: "zoro-group",
				"data-group": e
			}), s = k("div", {
				class: "zoro-group",
				"data-group": e
			});
			if (typeof i.items == "function") {
				let e = i.items(this.ctx);
				this.widgets.push(e), (a === 1 ? o : s).append(e.el);
			} else for (let e of i.items) {
				let t = this.makeButton(e);
				this.buttons.push({
					el: t,
					def: e
				}), ((e.row ?? a) === 1 ? o : s).append(t);
			}
			let c = e === "history" || e === "help" ? r : n;
			o.childElementCount && t.append(o), s.childElementCount && c.append(s);
		}
		let i = n.childElementCount + r.childElementCount > 0;
		if (i) {
			let n = this.makeButton({
				name: "toolbarToggle",
				icon: this.skin === "modern" ? O.more : O.toolbarToggle,
				title: this.skin === "modern" ? e.more : e.toolbarToggle,
				run: () => this.toggleRow2(),
				isActive: () => this.showRow2
			});
			this.buttons.push({
				el: n,
				def: {
					name: "toolbarToggle",
					icon: "",
					title: "",
					run: () => {},
					isActive: () => this.showRow2
				}
			}), this.viewEls.toggle = n, t.append(k("div", { class: "zoro-group" }, n));
		}
		if (this.row1.append(t), this.groups.includes("view")) {
			let t = k("div", { class: "zoro-toolbar-end" });
			this.options.sourceMode !== !1 && (this.viewEls.visual = k("button", {
				type: "button",
				class: "active",
				"aria-pressed": "true",
				html: `${O.eye}<span>${e.visual}</span>`,
				onclick: () => this.setMode("visual")
			}), this.viewEls.code = k("button", {
				type: "button",
				"aria-pressed": "false",
				html: `${O.codeSmall}<span>${e.source}</span>`,
				onclick: () => this.setMode("code")
			}), this.viewEls.visual.classList.toggle("active", this.mode === "visual"), this.viewEls.code.classList.toggle("active", this.mode === "code"), t.append(k("div", {
				class: "zoro-tab-toggle",
				role: "group"
			}, this.viewEls.visual, k("div", { class: "zoro-tab-toggle-divider" }), this.viewEls.code))), this.viewEls.fullscreen = this.makeButton({
				name: "fullscreen",
				icon: this.fullscreen ? O.minimize : O.maximize,
				title: this.fullscreen ? e.exitFullscreen : e.fullscreen,
				run: () => this.toggleFullscreen(),
				keepFocus: !1
			}), t.append(this.viewEls.fullscreen), this.row1.append(t);
		}
		this.row2.append(n, r), this.row2.hidden = !(i && this.showRow2), this.toolbarEl.hidden = !this.row1.textContent && !t.childElementCount && !this.groups.includes("view"), this.groups.includes("media") && this.mediaAvailable && this.topBar.append(k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary zoro-btn-sm zoro-add-media",
			html: `${O.imagePlus}<span>${e.addMedia}</span>`,
			onclick: () => this.openMedia()
		})), this.topBar.hidden = !this.topBar.childElementCount, this.setupRovingTabindex(), this.scheduleToolbarUpdate();
	}
	makeButton(e) {
		let t = typeof e.title == "function" ? e.title(this.t) : e.title, n = k("button", {
			type: "button",
			class: "zoro-toolbar-btn",
			"data-tip": t,
			"aria-label": oe(t).label,
			"aria-keyshortcuts": oe(t).keys || null,
			"data-name": e.name,
			html: e.icon,
			tabindex: "-1"
		});
		return e.isActive && n.setAttribute("aria-pressed", "false"), e.keepFocus !== !1 && n.addEventListener("mousedown", (e) => e.preventDefault()), n.addEventListener("click", (t) => {
			n.disabled || (e.run(this.ctx, t), this.scheduleToolbarUpdate());
		}), n;
	}
	setupRovingTabindex() {
		Array.from(this.toolbarEl.querySelectorAll("button, .zoro-select-trigger")).forEach((e, t) => e.setAttribute("tabindex", t === 0 ? "0" : "-1"));
	}
	focusToolbar() {
		(this.toolbarEl.querySelector("[tabindex=\"0\"]") ?? this.toolbarEl.querySelector("button"))?.focus();
	}
	toggleRow2(e) {
		this.showRow2 = e ?? !this.showRow2, At("zoro-kitchen-sink", this.showRow2 ? "1" : "0"), this.row2.hidden = !this.showRow2 || !this.row2.querySelector("button"), this.scheduleToolbarUpdate();
	}
	scheduleToolbarUpdate() {
		this.rafId || this.destroyed || (this.rafId = requestAnimationFrame(() => {
			this.rafId = 0, this.updateToolbarState();
		}));
	}
	updateToolbarState() {
		if (this.destroyed || !this.editor) return;
		let e = this.ctx, t = this.mode === "code";
		for (let { el: n, def: r } of this.buttons) {
			let i = r.name === "toolbarToggle" || r.name === "fullscreen" || r.name === "help" || r.name === "image", a = !0;
			try {
				a = !t || i ? r.isEnabled ? t ? !0 : r.isEnabled(e) : !0 : !1;
			} catch {
				a = !0;
			}
			if (n.disabled = !a, r.isActive) {
				let i = !1;
				try {
					i = !t && r.isActive(e);
				} catch {}
				n.classList.toggle("zoro-toolbar-btn-active", i), n.setAttribute("aria-pressed", String(i));
			}
		}
		for (let e of this.widgets) try {
			e.update?.();
		} catch {}
		this.updatePath(), this.updateBubble(), this.updateTableBar();
	}
	bindEvents() {
		let e = () => {
			if (this.options.stickyToolbar !== !1 && !this.fullscreen) {
				let e = parseFloat(getComputedStyle(this.root).getPropertyValue("--zoro-sticky-top")) || 0, t = this.toolbarEl.getBoundingClientRect(), n = this.frame.getBoundingClientRect();
				this.root.classList.toggle("zoro-stuck", t.top <= e + 1 && n.top < e - 1);
			}
			this.bubble && this.updateBubble(), this.tableBar && this.updateTableBar(), this.slash?.reposition();
		};
		window.addEventListener("scroll", e, !0), this.cleanups.push(() => window.removeEventListener("scroll", e, !0));
		let t = (e) => this.onKeyDown(e);
		this.root.addEventListener("keydown", t), this.toolbarEl.addEventListener("keydown", this.onToolbarKey), this.toolbarEl.addEventListener("pointerdown", () => this.hideBubble()), this.cleanups.push(() => this.root.removeEventListener("keydown", t));
		let n = () => {
			this.autosizeSource(), this.fireChange();
		}, r = () => {
			this.sourceCursor = {
				start: this.sourceEl.selectionStart,
				end: this.sourceEl.selectionEnd
			};
		};
		this.sourceEl.addEventListener("input", n);
		for (let e of [
			"select",
			"click",
			"keyup",
			"blur"
		]) this.sourceEl.addEventListener(e, r);
		let i = (this.inputEl ?? this.root).closest("form");
		if (i) {
			let e = () => this.syncInput();
			i.addEventListener("submit", e, !0), i.addEventListener("formdata", e), this.cleanups.push(() => {
				i.removeEventListener("submit", e, !0), i.removeEventListener("formdata", e);
			});
		}
	}
	onKeyDown(e) {
		if (e.isComposing || e.keyCode === 229) return;
		let t = e.ctrlKey || e.metaKey;
		if (e.key === "F10" && e.altKey) {
			e.preventDefault(), this.focusToolbar();
			return;
		}
		if (e.key === "Escape" && this.fullscreen && !document.querySelector(".zoro-dialog-overlay")) {
			e.preventDefault(), this.toggleFullscreen(!1);
			return;
		}
		if (t && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k" && this.mode === "visual" && this.hasGroup("link")) {
			e.preventDefault(), this.openLinkPopover(!0);
			return;
		}
		if (!(e.shiftKey && e.altKey) || t) return;
		let n = e.code, r = this.editor, i = this.mode === "visual", a = {
			KeyZ: () => this.toggleRow2(),
			KeyH: () => this.showHelp(),
			KeyM: () => this.mediaAvailable && this.openMedia()
		};
		if (i) {
			for (let e = 1; e <= 6; e++) a[`Digit${e}`] = () => dt(r, e);
			Object.assign(a, {
				Digit7: () => r.chain().focus().setParagraph().run(),
				KeyQ: () => r.chain().focus().toggleBlockquote().run(),
				KeyD: () => X(r, "toggleStrike"),
				KeyX: () => r.chain().focus().toggleCodeBlock().run(),
				KeyC: () => r.chain().focus().setTextAlign("center").run(),
				KeyR: () => r.chain().focus().setTextAlign("right").run(),
				KeyL: () => r.chain().focus().setTextAlign("left").run(),
				KeyJ: () => r.chain().focus().setTextAlign("justify").run(),
				KeyU: () => r.chain().focus().toggleBulletList().run(),
				KeyO: () => r.chain().focus().toggleOrderedList().run(),
				KeyS: () => r.chain().focus().extendMarkRange("link").unsetLink().run()
			});
		}
		let o = a[n];
		o && (e.preventDefault(), o());
	}
	insertIntoSource(e) {
		let t = this.sourceEl, { start: n, end: r } = this.sourceCursor;
		t.focus(), t.setSelectionRange(n, r);
		let i = !1;
		try {
			i = document.execCommand("insertText", !1, e);
		} catch {}
		i || (t.setRangeText(e, n, r, "end"), t.dispatchEvent(new Event("input", { bubbles: !0 })));
		let a = n + e.length;
		this.sourceCursor = {
			start: a,
			end: a
		};
	}
	revealSourceCaret(e) {
		let t = this.sourceEl, n = (t.value.slice(0, e).split("\n").length - 1) * (parseFloat(getComputedStyle(t).lineHeight) || 20);
		if (t.scrollHeight > t.clientHeight + 4) t.scrollTop = Math.max(0, n - t.clientHeight / 3);
		else {
			let e = t.getBoundingClientRect().top + n;
			(e < 0 || e > window.innerHeight - 40) && window.scrollBy({ top: e - window.innerHeight / 3 });
		}
	}
	autosizeSource() {
		if (!this.options.autoGrow) return;
		let e = this.sourceEl;
		e.style.height = "auto", e.style.height = `${Math.max(this.options.height, e.scrollHeight + 2)}px`;
	}
	setupDraft(e) {
		let t = this.draftKey;
		if (!t) return;
		let n = null;
		try {
			n = JSON.parse(kt(t) ?? "null");
		} catch {}
		if (!n?.html || n.html.trim() === at(e).trim()) return;
		let r = this.t, i = new Date(n.at).toLocaleString(void 0, {
			dateStyle: "medium",
			timeStyle: "short"
		});
		this.draftBar = k("div", {
			class: "zoro-draft-bar",
			role: "status"
		}, k("span", {
			class: "zoro-draft-icon",
			html: O.info
		}), k("span", { class: "zoro-draft-text" }, r.draftFound, " ", k("small", {}, i)), k("button", {
			type: "button",
			class: "zoro-link-action",
			onclick: () => {
				this.setContent(n.html, !0), this.draftBar?.remove(), this.draftBar = null;
			}
		}, r.restore), k("button", {
			type: "button",
			class: "zoro-icon-action",
			"aria-label": r.dismiss,
			title: r.dismiss,
			html: O.close,
			onclick: () => this.clearDraft()
		})), this.frame.insertBefore(this.draftBar, this.contentEl);
	}
	scheduleDraft(e) {
		let t = this.draftKey;
		if (!t) return;
		let n = this.options.autosave, r = typeof n == "object" && n.delay ? n.delay : 800;
		clearTimeout(this.draftTimer), this.draftTimer = setTimeout(() => At(t, JSON.stringify({
			html: e,
			at: Date.now()
		})), r);
	}
	smartPaste(e) {
		if (!e || this.options.readOnly) return !1;
		let t = (e.getData("text/plain") ?? "").trim();
		if (!/^https?:\/\/\S+$/i.test(t) || !Y(t)) return !1;
		let n = e.getData("text/html") ?? "";
		if (n && n.replace(/<[^>]+>/g, "").trim() !== t) return !1;
		let r = this.editor;
		if (r.isActive("codeBlock") || r.isActive("code")) return !1;
		let { empty: i, from: a, to: o } = r.state.selection;
		if (!i && this.hasGroup("link")) return this.applyLink({ href: t }, {
			from: a,
			to: o
		}), !0;
		let s = i && r.state.selection.$from.parent.content.size === 0;
		return s && this.hasGroup("embed") && lt(t) ? (r.chain().focus().setYoutubeVideo({ src: t }).run(), !0) : s && /\.(jpe?g|png|gif|webp|avif)(\?[^\s]*)?$/i.test(t) ? (r.chain().focus().setImage({
			src: t,
			alt: ""
		}).run(), !0) : !1;
	}
	handleFiles(e, t) {
		let n = this.mediaOpts.accept ?? Dt, r = e.filter((e) => e.type.startsWith("image/"));
		if (!r.length) return !1;
		if (this.options.media === !1 || this.options.readOnly) return !0;
		let i = this.t, a = this.mediaOpts.maxSizeMB ?? 20, o = r.filter((e) => n.includes(e.type) ? e.size > a * 1048576 ? (F(`${e.name}: ${T(i.tooLarge, { max: a })}`, "error", this.themeClass), !1) : !0 : (F(`${e.name}: ${i.badType}`, "error", this.themeClass), !1));
		if (!o.length) return !0;
		if (this.adapter) {
			let e = this.mediaOpts.requireAlt !== !1, n = o.filter((t) => e && !K(t.name)), r = o.filter((e) => !n.includes(e));
			n.length && (t !== null && this.editor.commands.setTextSelection(t), this.finder({
				multiple: !0,
				files: n,
				onSelect: (e) => this.insertMedia(e)
			}));
			for (let e of r) this.uploadWithPlaceholder(e, t, (e, t, n) => this.adapter.upload(e, {
				alt: t,
				onProgress: n
			}).then((e) => {
				let n = G(e, this.mediaOpts.insertVariant ?? "lg");
				return {
					src: n.src,
					srcset: n.srcset,
					alt: e.alt || t
				};
			}));
			return !0;
		}
		if (this.options.onImageUpload) {
			let e = this.options.onImageUpload;
			for (let n of o) this.uploadWithPlaceholder(n, t, async (t, n) => {
				let r = await e(t);
				return typeof r == "string" ? {
					src: r,
					srcset: null,
					alt: n
				} : {
					src: r.url,
					srcset: null,
					alt: r.alt ?? n
				};
			});
			return !0;
		}
		return F(i.uploadNotConfigured, "error", this.themeClass), !0;
	}
	async uploadWithPlaceholder(e, t, n) {
		let r = `up-${++Ot}`, i = URL.createObjectURL(e), a = K(e.name), { state: o, view: s } = this.editor;
		B.set(r, { progress: this.adapter ? 0 : null });
		let c = o.schema.nodes.image.create({
			src: i,
			alt: a,
			uploadId: r
		}), l = t === null ? o.tr.replaceSelectionWith(c) : o.tr.insert(Math.min(t, o.doc.content.size), c);
		s.dispatch(l.setMeta("addToHistory", !1));
		let u = async () => {
			B.set(r, {
				progress: this.adapter ? 0 : null,
				error: void 0
			});
			try {
				let t = await n(e, a, (e) => B.set(r, { progress: Math.min(99, Math.round(e)) }));
				if (this.destroyed || (B.set(r, { progress: 100 }), await Et(t.src), this.destroyed)) return;
				this.replaceUploadPlaceholder(r, {
					src: t.src,
					srcset: t.srcset,
					alt: t.alt || a,
					sizes: t.srcset ? "(max-width: 768px) 100vw, 768px" : null
				}), B.delete(r), URL.revokeObjectURL(i);
			} catch (e) {
				if (this.destroyed) return;
				B.set(r, {
					error: e?.message || "",
					retry: () => void u(),
					remove: () => {
						this.replaceUploadPlaceholder(r, null), B.delete(r), URL.revokeObjectURL(i);
					}
				});
			}
		};
		await u();
	}
	replaceUploadPlaceholder(e, t) {
		let { state: n, view: r } = this.editor, i = null;
		if (n.doc.descendants((t, n) => !i && (t.type.name === "image" && t.attrs.uploadId === e && (i = {
			pos: n,
			node: t
		}), !i)), !i) return;
		let { pos: a, node: o } = i;
		if (r.dispatch(n.tr.delete(a, a + o.nodeSize).setMeta("addToHistory", !1)), t) {
			let e = r.state.schema.nodes.image.create({
				...o.attrs,
				...t,
				uploadId: null
			});
			r.dispatch(r.state.tr.insert(a, e));
		}
	}
	openLinkPopover(e = !1) {
		if (this.mode !== "visual" || this.options.readOnly) return;
		let t = this.editor, { state: r } = t, { from: i, to: a, empty: o } = r.selection, s = r.schema.marks.link, c = null;
		if (t.isActive("link") && (c = n(r.doc.resolve(i), s) ?? null), !c && !o && (c = {
			from: i,
			to: a
		}), !c && e && (c = ut(t)), !c && !e) return;
		this.linkRange = c ?? {
			from: i,
			to: a
		};
		let l = t.getAttributes("link"), u = this.t, d = k("input", {
			type: "url",
			inputmode: "url",
			placeholder: u.urlPlaceholder,
			value: l.href ?? "",
			"aria-label": u.linkUrl,
			autocomplete: "off"
		}), f = () => this.applyLink({
			href: d.value,
			title: l.title,
			newTab: l.target === "_blank",
			nofollow: /nofollow/.test(l.rel ?? ""),
			sponsored: /sponsored/.test(l.rel ?? "")
		});
		d.addEventListener("keydown", (e) => {
			e.key === "Enter" && (e.preventDefault(), f()), e.key === "Escape" && (e.preventDefault(), this.linkPopover.close(), t.commands.focus());
		});
		let p = (e, t, n, r = "") => k("button", {
			type: "button",
			class: `zoro-link-btn ${r}`,
			title: t,
			"aria-label": t,
			html: e,
			onmousedown: (e) => e.preventDefault(),
			onclick: n
		}), m = k("div", { class: "zoro-link-row" }, k("label", { class: "zoro-link-field" }, k("span", {
			class: "zoro-link-field-icon",
			html: O.linkSmall
		}), d), p(O.checkBig, u.apply, f, "zoro-link-apply")), h = k("div", { class: "zoro-link-tools" });
		l.href && h.append(p(O.external, u.openLink, () => {
			Y(l.href) && window.open(l.href, "_blank", "noopener");
		}), p(O.unlink, u.unlink, () => {
			this.linkRange && t.chain().focus().setTextSelection(this.linkRange).unsetLink().run(), this.linkPopover.close();
		}), k("span", { class: "zoro-link-sep" })), h.append(p(O.settings, u.advanced, () => this.openLinkDialog(d.value))), m.append(k("span", { class: "zoro-link-sep" }), h);
		let g = k("div", { class: "zoro-link-popover-inner" }, m);
		this.linkPopover.close(), this.linkRange = c ?? {
			from: i,
			to: a
		}, this.linkPopover = new N(this.themeClass, () => {
			this.linkRange = null;
		});
		let _ = this.linkRange, v = t.view.coordsAtPos(_.from), y = t.view.coordsAtPos(_.to), b = new DOMRect(Math.min(v.left, y.left), v.top, Math.max(1, Math.abs(y.right - v.left)), y.bottom - v.top);
		this.linkPopover.open(g, b, "zoro-link-popover"), e && (d.focus({ preventScroll: !0 }), d.select());
	}
	syncLinkPopover() {
		let e = this.editor.isActive("link");
		e && !this.linkPopover.isOpen ? this.openLinkPopover(!1) : !e && this.linkPopover.isOpen && !this.linkPopover.el?.contains(document.activeElement) && this.linkPopover.close();
	}
	openLinkDialog(e) {
		let t = this.editor, n = this.t, r = this.linkRange ?? {
			from: t.state.selection.from,
			to: t.state.selection.to
		}, i = t.getAttributes("link"), a = t.state.doc.textBetween(r.from, r.to, " ");
		this.linkPopover.close(), this.linkRange = r;
		let o = k("input", {
			type: "url",
			inputmode: "url",
			class: "zoro-input",
			value: e || i.href || "",
			placeholder: "https://ornek.com/sayfa"
		}), s = k("input", {
			type: "text",
			class: "zoro-input",
			value: a
		}), c = k("input", {
			type: "text",
			class: "zoro-input",
			value: i.title ?? ""
		}), l = (e, t) => {
			let n = k("input", {
				type: "checkbox",
				checked: t
			});
			return {
				input: n,
				el: k("label", { class: "zoro-checkbox-group" }, n, k("span", {}, e))
			};
		}, u = l(n.linkNewTab, i.target === "_blank"), d = l(n.linkNofollow, /nofollow/.test(i.rel ?? "")), f = l(n.linkSponsored, /sponsored/.test(i.rel ?? "")), p = k("p", {
			class: "zoro-field-error",
			role: "alert"
		}), m = k("div", { class: "zoro-form" }, k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, n.linkUrl), o), k("div", { class: "zoro-grid-2" }, k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, n.linkText), s), k("div", { class: "zoro-field" }, k("label", { class: "zoro-label" }, n.linkTitleAttr), c)), k("div", { class: "zoro-field" }, u.el, d.el, f.el), p), h = new M({
			title: n.linkTitle,
			size: "md",
			themeClass: this.themeClass,
			closeLabel: n.close,
			onClose: () => {
				this.linkRange = null;
			}
		});
		h.open(m);
		let g = () => {
			this.applyLink({
				href: o.value,
				text: s.value,
				title: c.value,
				newTab: u.input.checked,
				nofollow: d.input.checked,
				sponsored: f.input.checked
			}, r, a) ? h.close() : p.textContent = n.linkInvalid;
		};
		o.addEventListener("keydown", (e) => {
			e.key === "Enter" && (e.preventDefault(), g());
		}), h.addFooter(k("div", { class: "zoro-btn-row" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => h.close()
		}, n.cancel), k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-primary",
			onclick: g
		}, n.linkTitle)));
	}
	applyLink(e, t = this.linkRange, n) {
		let r = this.editor, i = st(e.href);
		if (!i) return t && t.from !== t.to && r.chain().focus().setTextSelection(t).unsetLink().run(), this.linkPopover.close(), !0;
		if (!Y(i)) return F(this.t.linkInvalid, "error", this.themeClass), !1;
		let a = [
			e.newTab ? "noopener noreferrer" : "",
			e.nofollow ? "nofollow" : "",
			e.sponsored ? "sponsored" : ""
		].filter(Boolean).join(" "), o = {
			href: i,
			title: e.title?.trim() || null,
			target: e.newTab ? "_blank" : null,
			rel: a || null
		}, s = t ?? {
			from: r.state.selection.from,
			to: r.state.selection.to
		}, c = n ?? r.state.doc.textBetween(s.from, s.to, " "), l = e.text ?? c, u = r.chain().focus();
		return s.from === s.to || e.text !== void 0 && e.text !== c ? u.insertContentAt(s, {
			type: "text",
			text: l || i,
			marks: [{
				type: "link",
				attrs: o
			}]
		}) : u.setTextSelection(s).setLink(o).setTextSelection(s.to), u.run(), this.linkPopover.close(), !0;
	}
	openColorPicker(e, t) {
		let n = this.t, r = (n) => {
			this.colorPopover.close(), this.lastColors[t] = n, e.innerHTML = t === "text" ? O.textColor(n) : O.bgColor(n), X(this.editor, t === "text" ? "setColor" : "toggleHighlight", t === "text" ? n : { color: n }), wt(n);
		}, i = (e) => k("button", {
			type: "button",
			class: "zoro-color-swatch",
			title: e,
			"aria-label": e,
			style: { backgroundColor: e },
			onmousedown: (e) => e.preventDefault(),
			onclick: () => r(e)
		}), a = k("div", {
			class: "zoro-color-grid",
			role: "listbox",
			"aria-label": t === "text" ? n.textColor : n.bgColor
		});
		for (let e of yt) a.append(i(e));
		let o = Ct(), s = o.length ? k("div", { class: "zoro-color-section" }, k("span", { class: "zoro-color-label" }, n.recentColors), k("div", { class: "zoro-color-grid" }, ...o.map(i))) : null, c = k("input", {
			type: "color",
			value: this.lastColors[t],
			"aria-label": n.customColor
		}), l = k("input", {
			type: "text",
			class: "zoro-input zoro-input-sm",
			value: this.lastColors[t],
			maxlength: 7,
			spellcheck: !1,
			"aria-label": "HEX"
		});
		c.addEventListener("input", () => {
			l.value = c.value;
		});
		let u = () => {
			let e = l.value.trim();
			/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e) ? r(e.toLowerCase()) : l.classList.add("zoro-invalid");
		};
		l.addEventListener("keydown", (e) => {
			e.key === "Enter" && (e.preventDefault(), u());
		});
		let d = k("div", { class: "zoro-color-custom" }, c, l, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary zoro-btn-sm",
			onclick: u
		}, n.apply)), f = k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-ghost zoro-btn-sm zoro-btn-block",
			onmousedown: (e) => e.preventDefault(),
			onclick: () => {
				this.colorPopover.close(), X(this.editor, t === "text" ? "unsetColor" : "unsetHighlight");
			}
		}, n.removeColor);
		this.colorPopover.close(), this.colorPopover = new N(this.themeClass), this.colorPopover.open(k("div", { class: "zoro-color-panel" }, a, s, d, f), e);
	}
	openSpecialChars(e) {
		let t = new N(this.themeClass), n = k("div", { class: "zoro-char-grid" });
		for (let e of xt) n.append(k("button", {
			type: "button",
			class: "zoro-char-btn",
			"aria-label": e,
			onmousedown: (e) => e.preventDefault(),
			onclick: () => {
				t.close(), this.editor.chain().focus().insertContent(e).run();
			}
		}, e));
		t.open(n, e);
	}
	openTableMenu(e) {
		let t = this.editor, n = this.t, r = new N(this.themeClass);
		if (t.isActive("table")) {
			let i = (e, t, n = !1) => k("button", {
				type: "button",
				class: "zoro-menu-item" + (n ? " danger" : ""),
				onmousedown: (e) => e.preventDefault(),
				onclick: () => {
					r.close(), t();
				}
			}, e);
			r.open(k("div", {
				class: "zoro-menu",
				role: "menu"
			}, i(n.tableAddRowAfter, () => t.chain().focus().addRowAfter().run()), i(n.tableAddColAfter, () => t.chain().focus().addColumnAfter().run()), i(n.tableDeleteRow, () => t.chain().focus().deleteRow().run()), i(n.tableDeleteCol, () => t.chain().focus().deleteColumn().run()), i(n.tableToggleHeader, () => t.chain().focus().toggleHeaderRow().run()), i(n.tableMerge, () => t.chain().focus().mergeOrSplit().run()), i(n.tableDelete, () => t.chain().focus().deleteTable().run(), !0)), e);
			return;
		}
		let i = k("div", { class: "zoro-table-picker-label" }, "1 × 1"), a = k("div", {
			class: "zoro-table-picker",
			style: { gridTemplateColumns: "repeat(8, 1fr)" }
		}), o = [], s = (e, t) => {
			o.forEach((n, r) => n.classList.toggle("on", Math.floor(r / 8) < e && r % 8 < t)), i.textContent = `${t} × ${e}`;
		};
		for (let e = 1; e <= 8; e++) for (let n = 1; n <= 8; n++) {
			let i = k("button", {
				type: "button",
				class: "zoro-table-cell",
				"aria-label": `${n} × ${e}`,
				onmousedown: (e) => e.preventDefault(),
				onpointerenter: () => s(e, n),
				onfocus: () => s(e, n),
				onclick: () => {
					r.close(), t.chain().focus().insertTable({
						rows: e,
						cols: n,
						withHeaderRow: !0
					}).run();
				}
			});
			o.push(i), a.append(i);
		}
		r.open(k("div", {}, a, i), e), s(1, 1);
	}
	async insertYoutube() {
		let e = this.t, t = await ie({
			title: e.youtube,
			label: e.youtubePrompt,
			placeholder: "https://www.youtube.com/watch?v=...",
			ok: e.insert,
			cancel: e.cancel,
			themeClass: this.themeClass,
			validate: (t) => lt(t) ? null : e.youtubeInvalid
		});
		t && this.editor.chain().focus().setYoutubeVideo({ src: t }).run();
	}
	showHelp() {
		let e = this.t, t = [
			[e.shortcutsCtrl, [
				["b", e.bold],
				["i", e.italic],
				["u", e.underline],
				["k", e.link],
				["z", e.undo],
				["y", e.redo]
			]],
			[e.shortcutsShiftAlt, [
				["1–6", `${e.heading} 1–6`],
				["7", e.paragraph],
				["q", e.blockquote],
				["d", e.strike],
				["x", e.preformatted],
				["l", e.alignLeft],
				["c", e.alignCenter],
				["r", e.alignRight],
				["j", e.alignJustify],
				["u", e.bulletList],
				["o", e.orderedList],
				["s", e.unlink],
				["m", e.addMedia],
				["z", e.toolbarToggle],
				["h", e.help]
			]],
			[e.shortcutsMarkdown, [
				["*", e.bulletList],
				["-", e.bulletList],
				["1.", e.orderedList],
				[">", e.blockquote],
				["##", `${e.heading} 2`],
				["###", `${e.heading} 3`],
				["---", e.hr]
			]],
			["Alt + F10", [["F10", e.toolbarLabel]]]
		], n = k("div", { class: "zoro-form" });
		for (let [e, r] of t) {
			let t = k("div", { class: "zoro-shortcuts-grid" });
			for (let [e, n] of r) t.append(k("div", { class: "zoro-shortcut-row" }, k("kbd", {}, e), k("span", {}, n.replace(/\s*\(.*\)$/, ""))));
			n.append(k("h4", { class: "zoro-shortcuts-title" }, e), t);
		}
		let r = new M({
			title: e.shortcutsTitle,
			size: "lg",
			themeClass: this.themeClass,
			closeLabel: e.close
		});
		r.open(n), r.addFooter(k("div", { class: "zoro-btn-row" }, k("button", {
			type: "button",
			class: "zoro-btn zoro-btn-secondary",
			onclick: () => r.close()
		}, e.close)));
	}
};
//#endregion
export { ge as A, De as C, W as D, ye as E, C as M, S as N, ve as O, w as P, Te as S, be as T, st as _, gt as a, Ee as b, X as c, at as d, ct as f, Y as g, J as h, $ as i, O as j, G as k, ut as l, rt as m, pt as n, _t as o, it as p, Q as r, vt as s, jt as t, dt as u, Ve as v, U as w, K as x, Oe as y };

//# sourceMappingURL=editor-BpbEvjmr.js.map