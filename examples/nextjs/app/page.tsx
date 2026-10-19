// Server Component: the page renders on the server, the editor on the client ('use client' in PostEditor.tsx).
import { saveArticle } from './actions';
import { PostEditor } from './PostEditor';

export default function Page() {
  return (
    <>
      <h1>ZoroEditor + Next.js (App Router)</h1>
      {/* Form with a Server Action: the editor value is posted as the hidden field name="content" */}
      <form action={saveArticle}>
        <PostEditor />
        <button type="submit" style={{ marginTop: 12, minHeight: 40, padding: '0 18px' }}>Save</button>
      </form>
    </>
  );
}
