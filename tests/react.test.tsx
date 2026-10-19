import { StrictMode, createRef, useState } from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { ZoroEditor, type ZoroEditorHandle } from '../src/react';

afterEach(() => cleanup());

describe('React bileşeni', () => {
  it('StrictMode çift kurulumunda tek editör kalır', () => {
    const { container, unmount } = render(<StrictMode><ZoroEditor defaultValue="<p>x</p>" /></StrictMode>);
    expect(container.querySelectorAll('.zoro-root').length).toBe(1);
    unmount();
    expect(document.querySelectorAll('.zoro-root').length).toBe(0);
  });

  it('kontrollü value ve onChange', () => {
    const ref = createRef<ZoroEditorHandle>();
    let setter!: (v: string) => void;
    const changes: string[] = [];
    function App() {
      const [v, setV] = useState('<p>bir</p>');
      setter = setV;
      return <ZoroEditor ref={ref} value={v} onChange={(html) => { changes.push(html); setV(html); }} />;
    }
    render(<App />);
    expect(ref.current!.getHTML()).toBe('<p>bir</p>');
    act(() => setter('<p>iki</p>'));
    expect(ref.current!.getHTML()).toBe('<p>iki</p>');
    act(() => { ref.current!.getInstance()!.editor.commands.insertContent('!'); });
    expect(changes.at(-1)).toContain('!');
  });

  it('name verilince form için gizli input dolar', () => {
    const ref = createRef<ZoroEditorHandle>();
    const { container } = render(<form><ZoroEditor ref={ref} name="icerik" defaultValue="<p>a</p>" /></form>);
    const hidden = container.querySelector<HTMLInputElement>('input[name="icerik"]')!;
    expect(hidden.value).toBe('<p>a</p>');
    act(() => { ref.current!.setContent('<p>b</p>', true); });
    expect(hidden.value).toBe('<p>b</p>');
  });

  it('preset değişince yeniden kurulur, içerik korunur', () => {
    const { container, rerender } = render(<ZoroEditor preset="minimal" media={false} defaultValue="<p>kalsın</p>" />);
    expect(container.querySelector('[data-name="table"]')).toBeNull();
    rerender(<ZoroEditor preset="full" media={false} defaultValue="<p>kalsın</p>" />);
    expect(container.querySelector('[data-name="table"]')).not.toBeNull();
    expect(container.querySelectorAll('.zoro-root').length).toBe(1);
  });

  it('readOnly canlı değişir', () => {
    const ref = createRef<ZoroEditorHandle>();
    const { rerender } = render(<ZoroEditor ref={ref} readOnly />);
    expect(ref.current!.getInstance()!.editor.isEditable).toBe(false);
    rerender(<ZoroEditor ref={ref} readOnly={false} />);
    expect(ref.current!.getInstance()!.editor.isEditable).toBe(true);
  });
});
