// @vitest-environment node
import { renderToString } from 'react-dom/server';

describe('SSR / Next.js', () => {
  it('modüller sunucuda içe aktarılabilir', async () => {
    await expect(import('../src/index')).resolves.toBeTruthy();
    await expect(import('../src/react')).resolves.toBeTruthy();
  });

  it('React bileşeni sunucuda çizilir (window yok)', async () => {
    const { ZoroEditor } = await import('../src/react');
    const html = renderToString(<ZoroEditor defaultValue="<p>x</p>" name="icerik" />);
    expect(html).toContain('data-zoro-react');
    expect(html).toContain('name="icerik"');
  });

  it('çekirdek sınıf sunucuda anlaşılır hata verir', async () => {
    const { ZoroEditor } = await import('../src/index');
    expect(() => new ZoroEditor('#x')).toThrow(/only runs in the browser/);
  });
});
