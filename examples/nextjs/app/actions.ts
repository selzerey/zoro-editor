'use server';

export async function saveArticle(form: FormData) {
  const content = String(form.get('content') ?? '');
  // IMPORTANT: sanitize on the server before saving (e.g. sanitize-html, or Zoro\Editor\Sanitizer
  // if you have the PHP backend). This example only logs the length.
  console.log('Saved content length:', content.length);
}
