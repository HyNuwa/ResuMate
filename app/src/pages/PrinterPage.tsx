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
  'a4':        { width: '794px',  minHeight: '1123px' },
  'letter':    { width: '816px',  minHeight: '1056px' },
  'free-form': { width: '794px',  minHeight: 'auto'   },
};

export function PrinterPage() {
  const { id } = useParams();

  const { data: cv, isLoading, error } = useCV(id);

  // Signal to Puppeteer that the page is ready for PDF capture
  useEffect(() => {
    if (cv?.data) {
      // Small delay to let fonts/styles settle
      const timer = setTimeout(() => {
        window.wfPrintReady = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [cv]);

  // Hide React Query Devtools and any other floating UI on this route
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'printer-overrides';
    style.textContent = `
      /* Hide React Query Devtools */
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

  // The paper div IS the page — no wrapper background, no padding around it.
  // Puppeteer captures the full page, so this div must be the only visible element.
  const paperStyle: React.CSSProperties = {
    width:           PAGE_DIMENSIONS[metadata.page.format]?.width ?? '794px',
    minHeight:       PAGE_DIMENSIONS[metadata.page.format]?.minHeight ?? '1123px',
    backgroundColor: metadata.design.colors.background,
    margin:          '0 auto',
    padding:         `${metadata.page.marginY}mm ${metadata.page.marginX}mm`,
    // CSS custom properties for ResumePreview
    '--preview-font-body':      metadata.typography.body.fontFamily,
    '--preview-weight-body':    metadata.typography.body.fontWeights[0],
    '--preview-size-body':      `${metadata.typography.body.fontSize}px`,
    '--preview-lh-body':        String(metadata.typography.body.lineHeight),
    '--preview-font-heading':   metadata.typography.heading.fontFamily,
    '--preview-weight-heading': metadata.typography.heading.fontWeights[0],
    '--preview-size-heading':   `${metadata.typography.heading.fontSize}px`,
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