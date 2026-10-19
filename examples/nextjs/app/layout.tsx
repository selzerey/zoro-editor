import type { ReactNode } from 'react';
import 'zoro-editor/style.css';
import 'zoro-editor/content.css';

export const metadata = { title: 'ZoroEditor + Next.js' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '24px 16px', background: '#f0f0f1', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ maxWidth: 900, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  );
}
