import DOMPurify from 'dompurify';

export function sanitizeHtml(text: string): string {
  return DOMPurify.sanitize(text ?? '');
}
