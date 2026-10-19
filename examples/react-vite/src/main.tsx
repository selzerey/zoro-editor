import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ZoroEditor, MemoryMediaAdapterForDemo } from './zoro';
import 'zoro-editor/style.css';

function App() {
  const [html, setHtml] = useState('<p>Merhaba <strong>React</strong>!</p>');
  const [preset, setPreset] = useState('blog');
  return (
    <>
      <h1>ZoroEditor + React</h1>
      <p>
        Preset:{' '}
        {['minimal', 'basic', 'blog', 'full'].map((p) => (
          <button key={p} onClick={() => setPreset(p)} disabled={p === preset} style={{ marginRight: 6 }}>{p}</button>
        ))}
      </p>
      <ZoroEditor
        value={html}
        onChange={setHtml}
        preset={preset}
        // In a real project: media={{ endpoint: '/zoro/php/public/media.php' }} or your own adapter
        media={{ adapter: MemoryMediaAdapterForDemo }}
      />
      <h2>HTML</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12 }}>{html}</pre>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
