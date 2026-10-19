'use client';
import { useRef, useState } from 'react';
import { ZoroEditor, useZoroFinder, type ZoroEditorHandle } from 'zoro-editor/react';

export function PostEditor() {
  const [html, setHtml] = useState('<p>Hello <strong>Next.js</strong>!</p>');
  const [cover, setCover] = useState<string | null>(null);
  const ref = useRef<ZoroEditorHandle>(null);
  const openFinder = useZoroFinder({ endpoint: '/api/media' });

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        {cover ? <img src={cover} alt="" width={120} height={72} style={{ objectFit: 'cover' }} /> : null}
        <button type="button" onClick={() => openFinder({ onSelect: ([img]) => setCover(img!.url) })}>Choose featured image</button>
        <input type="hidden" name="cover" value={cover ?? ''} />
      </div>

      <ZoroEditor
        ref={ref}
        name="content"
        value={html}
        onChange={setHtml}
        preset="blog"
        addGroups={['embed']}
        media={{ endpoint: '/api/media' }}
        autosave="nextjs-example"
        theme="auto"
      />
      <p style={{ color: '#50575e', fontSize: 13 }}>{html.length} characters of HTML</p>
    </>
  );
}
