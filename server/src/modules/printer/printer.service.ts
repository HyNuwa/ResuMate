import { getBrowser } from './browser';
import { generatePrinterToken } from './printer-token';
import { buildPagePdfOptions, type PageFormat } from './print-dimensions';
import { resumeRepository } from '../resume/resume.repository';
import { NotFoundError, ValidationError } from '../resume/resume.service';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const PDF_TIMEOUT_MS = 30_000;

export interface PrintOptions {
  format?: PageFormat;
  scale?: number;
}

export interface PrintResult {
  buffer: Buffer;
  contentType: string;
}

export const printerService = {
  async getByIdForPrinter(id: string) {
    const cv = await resumeRepository.findById(id);
    if (!cv) throw new NotFoundError('Resume', id);
    return cv;
  },

  async printResumeAsPDF(
    resumeId: string,
    options: PrintOptions = {},
  ): Promise<PrintResult> {
    const { format = 'a4', scale = 1 } = options;

    const cv = await resumeRepository.findById(resumeId);
    if (!cv) throw new NotFoundError('Resume', resumeId);

    const token = generatePrinterToken(resumeId);
    const printUrl = `${FRONTEND_URL}/printer/${resumeId}?token=${encodeURIComponent(token)}`;

    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport to match the paper dimensions so CSS layouts render correctly
      const pdfOptions = buildPagePdfOptions(format, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });

      await page.setViewport({
        width: pdfOptions.width,
        height: pdfOptions.height,
        deviceScaleFactor: 1,
      });

      // Use screen CSS media so Tailwind classes render normally
      await page.emulateMediaType('screen');

      await page.goto(printUrl, {
        waitUntil: 'networkidle0',
        timeout: PDF_TIMEOUT_MS,
      });

      await page.waitForFunction(
        () => (window as Window & { wfPrintReady?: boolean }).wfPrintReady === true,
        { timeout: PDF_TIMEOUT_MS },
      );

      // Inject CSS to hide any remaining floating UI (React Query Devtools, etc.)
      await page.addStyleTag({
        content: `
          .tsqd-parent-container,
          .tsqd-open-btn-container,
          [class*="ReactQueryDevtools"],
          button[aria-label="Open React Query Devtools"] {
            display: none !important;
          }
          body { margin: 0; padding: 0; }
        `,
      });

      const buffer = await page.pdf({
        width: pdfOptions.width,
        height: pdfOptions.height,
        margin: pdfOptions.margin,
        scale,
        printBackground: true,
      });

      return {
        buffer: Buffer.from(buffer),
        contentType: 'application/pdf',
      };
    } finally {
      await page.close();
    }
  },
};