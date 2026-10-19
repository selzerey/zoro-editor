"use client";
import { b as e, t } from "./chunks/editor-BfOkbMWc.js";
import { forwardRef as n, useCallback as r, useEffect as i, useImperativeHandle as a, useRef as o } from "react";
import { jsx as s, jsxs as c } from "react/jsx-runtime";
//#region src/react/index.tsx
function l(e) {
	let t = e.media === !1 ? !1 : e.media ? {
		...e.media,
		adapter: !!e.media.adapter,
		headers: typeof e.media.headers == "function" ? "fn" : e.media.headers
	} : void 0;
	return JSON.stringify({
		preset: e.preset,
		groups: e.groups,
		addGroups: e.addGroups,
		removeGroups: e.removeGroups,
		height: e.height,
		autoGrow: e.autoGrow,
		placeholder: e.placeholder,
		locale: e.locale,
		maxLength: e.maxLength,
		statusBar: e.statusBar,
		sourceMode: e.sourceMode,
		stickyToolbar: e.stickyToolbar,
		autosave: e.autosave,
		media: t,
		upload: !!e.onImageUpload,
		cls: e.editorClassName,
		skin: e.skin,
		bubble: e.bubbleMenu
	});
}
var u = n(function(e, n) {
	let { value: r, defaultValue: u, onChange: d, onReady: f, onFocus: p, onBlur: m, name: h, id: g, className: _, style: v, readOnly: y, theme: b } = e, x = o(null), S = o(null), C = o(null), w = o(void 0), T = o({
		onChange: d,
		onReady: f,
		onFocus: p,
		onBlur: m,
		onImageUpload: e.onImageUpload
	});
	T.current = {
		onChange: d,
		onReady: f,
		onFocus: p,
		onBlur: m,
		onImageUpload: e.onImageUpload
	};
	let E = o(r ?? u ?? "");
	E.current = r ?? E.current;
	let D = o(e);
	D.current = e;
	let O = l(e);
	return i(() => {
		let e = x.current;
		if (!e) return;
		let n = D.current, r = new t(e, {
			...n,
			className: n.editorClassName,
			content: E.current,
			input: S.current ?? void 0,
			onImageUpload: n.onImageUpload ? (e) => T.current.onImageUpload(e) : void 0,
			onChange: (e) => {
				w.current = e, T.current.onChange?.(e);
			},
			onFocus: () => T.current.onFocus?.(),
			onBlur: () => T.current.onBlur?.(),
			onReady: (e) => T.current.onReady?.(e)
		});
		return w.current = r.getHTML(), C.current = r, () => {
			r.destroy(), C.current === r && (C.current = null);
		};
	}, [O]), i(() => {
		let e = C.current;
		e && r !== void 0 && r !== w.current && r !== e.getHTML() && (w.current = r, e.setContent(r));
	}, [r]), i(() => {
		C.current?.setReadOnly(!!y);
	}, [y, O]), i(() => {
		b && C.current?.setTheme(b);
	}, [b, O]), a(n, () => ({
		getHTML: () => C.current?.getHTML() ?? "",
		setContent: (e, t) => C.current?.setContent(e, t),
		insertHTML: (e) => C.current?.insertHTML(e),
		focus: () => C.current?.focus(),
		clearDraft: () => C.current?.clearDraft(),
		getInstance: () => C.current
	}), []), /* @__PURE__ */ c("div", {
		id: g,
		className: _,
		style: v,
		"data-zoro-react": "",
		children: [/* @__PURE__ */ s("div", { ref: x }), h ? /* @__PURE__ */ s("input", {
			ref: S,
			type: "hidden",
			name: h,
			defaultValue: r ?? u ?? ""
		}) : null]
	});
});
function d(t) {
	let n = o(t);
	n.current = t;
	let a = o(null);
	return i(() => () => a.current?.close(), []), r((t = {}) => (a.current?.close(), a.current = new e({
		...n.current,
		...t
	}).open(), a.current), []);
}
//#endregion
export { u as ZoroEditor, t as ZoroEditorCore, d as useZoroFinder };

//# sourceMappingURL=react.js.map