Plan: Server-Side Puppeteer PDF Generation
Current State
- @react-pdf/renderer in ResumePDFDocument.tsx uses completely hardcoded styles — no connection to resume metadata
- No /printer/ route, no generatePrinterToken, no getBrowser, no pageDimensionsAsPixels — none exist
- PreviewToolbar.tsx calls PDFDownloadLink directly (client-side, no server involvement)
Target Architecture
User clicks "Download PDF"
        │
        ▼
PreviewToolbar calls server: POST /api/printer/:id/pdf
        │
        ▼
Server generates printer token
        │
        ▼
Server connects to headless Chrome (puppeteer-core)
        │
        ▼
Navigates to: http://localhost:5173/printer/:id?token=xxx
        │
        ▼
/printer route renders ResumePreview with print CSS
        │
        ▼
Chrome's page.pdf() captures the rendered HTML
        │
        ▼
Server uploads PDF → returns { url }
        │
        ▼
Client downloads from URL
---
Implementation Phases
Phase 1: Server — Infrastructure
Files to create:
1. server/src/modules/printer/print-dimensions.ts — pageDimensionsAsPixels and printMarginTemplates
2. server/src/modules/printer/printer-token.ts — generatePrinterToken / verifyPrinterToken (HMAC-SHA256, 5-min TTL)
3. server/src/modules/printer/browser.ts — getBrowser() singleton via puppeteer-core
4. server/src/modules/printer/printer.service.ts — printResumeAsPDF function (your code adapted)
5. server/src/modules/printer/printer.controller.ts — Express controller for POST /api/printer/:id/pdf
6. server/src/modules/printer/index.ts — barrel export
Files to modify:
- server/package.json — add puppeteer-core
- server/src/app.ts — mount printer routes at /api/printer
- server/src/modules/resume/resume.service.ts — add getByIdForPrinter method
New env vars:
PRINTER_ENDPOINT=ws://localhost:9222
FLAG_DEBUG_PRINTER=false
AUTH_SECRET=your-secret-here
Phase 2: Frontend — Printer Route
Files to create:
1. app/src/pages/PrinterPage.tsx
   - Verifies token via verifyPrinterToken
   - Loads resume by ID
   - Renders <ResumePreview> in print mode
   - Sets data-wf-loaded="true" when ready
   - Applies @media print CSS
Files to modify:
- app/src/App.tsx — add route /printer/:id?token=xxx
Phase 3: Frontend — Connect PDF Button
Files to modify:
1. PreviewToolbar.tsx — replace PDFDownloadLink with:
   - useMutation calling POST /api/printer/:id/pdf
   - Loading spinner during generation
   - downloadFromUrl(url, filename) on success
2. cv.service.ts — add printResumePDF(id): Promise<{ url }>
Phase 4: Cleanup
- Remove @react-pdf/renderer from app/package.json
- Delete ResumePDFDocument.tsx
- Delete ResumeDocument.tsx (AI one — verify if used elsewhere first)
---
Open Questions
1. Puppeteer vs Playwright? — Your code uses Puppeteer (page.pdf()). Follow that exactly?
2. Browserless vs self-hosted? — Connect to external Browserless service (ws://), or launch Chrome process directly?
3. Storage? — storageService.delete() and uploadFile() don't exist. Local filesystem, S3, or return PDF buffer directly?
4. Token verification? — Should PrinterPage also verify the token server-side, or trust the controller?
---
To save this: paste the above into a .md file in your project (e.g., .agent/skills/resumate/implementation_plan_pdf.md). Once you're ready tomorrow, load the skill and I'll execute it step by step.