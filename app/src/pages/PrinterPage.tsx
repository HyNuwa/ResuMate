import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ResumePreview } from '@/features/resume/components/preview/ResumePreview';
import { useCV } from '@/shared/hooks/useQueryCVs';

declare global {
  interface Window {
    wfPrintReady?: boolean;
  }
}

const PAGE_DIMENSIONS: Record<string, { width: string; minHeight: string }> = {
  'a4':        { width: '210mm',  minHeight: '297mm' },
  'letter':    { width: '216mm',  minHeight: '279mm' },
  'free-form': { width: '210mm',  minHeight: 'auto' },
};

export function PrinterPage() {
  const { id } = useParams();

  const { data: cv, isLoading, error } = useCV(id);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'printer-page-rules';
    style.textContent = `
      @page {
        size: A4;
        margin: 0;
      }
      @page :first {
        margin: 0;
      }
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        background: white;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (cv?.data) {
      requestAnimationFrame(() => {
        window.wfPrintReady = true;
      });
    }
  }, [cv]);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'printer-overrides';
    style.textContent = `
      .ReactQueryDevtools,
      [class*="ReactQueryDevtools"],
      button[aria-label="Open React Query Devtools"],
      .tsqd-open-btn-container,
      .tsqd-parent-container {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error || !cv || !cv.data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'red' }}>
          {error instanceof Error ? error.message : 'Error al cargar el CV'}
        </p>
      </div>
    );
  }

  const { data: resume } = cv;
  const metadata = resume.metadata;

  const bodyFontWeights = Array.isArray(metadata.typography.body.fontWeights)
    ? metadata.typography.body.fontWeights
    : ['400'];
  const headingFontWeights = Array.isArray(metadata.typography.heading.fontWeights)
    ? metadata.typography.heading.fontWeights
    : ['700'];

  const paperStyle: React.CSSProperties = {
    width: PAGE_DIMENSIONS[metadata.page.format]?.width ?? '210mm',
    minHeight: PAGE_DIMENSIONS[metadata.page.format]?.minHeight ?? '297mm',
    backgroundColor: metadata.design.colors.background,
    margin: '0 auto',
    padding: `${metadata.page.marginY}mm ${metadata.page.marginX}mm`,
    '--preview-font-body':      metadata.typography.body.fontFamily,
    '--preview-weight-body':    bodyFontWeights[0] ?? '400',
    '--preview-size-body':      `${metadata.typography.body.fontSize}pt`,
    '--preview-lh-body':        String(metadata.typography.body.lineHeight),
    '--preview-font-heading':   metadata.typography.heading.fontFamily,
    '--preview-weight-heading': headingFontWeights[0] ?? '700',
    '--preview-size-heading':   `${metadata.typography.heading.fontSize}pt`,
    '--preview-lh-heading':     String(metadata.typography.heading.lineHeight),
    '--preview-color-primary':  metadata.design.colors.primary,
    '--preview-color-text':     metadata.design.colors.text,
    '--preview-color-bg':       metadata.design.colors.background,
  } as React.CSSProperties;

  return (
    <div style={paperStyle}>
      <ResumePreview resume={resume} />
    </div>
  );
}