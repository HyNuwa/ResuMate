export type PageFormat = 'a4' | 'letter';

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PrintMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const PAGE_DIMENSIONS_INCHES: Record<PageFormat, PageDimensions> = {
  a4: { width: 8.27, height: 11.69 },
  letter: { width: 8.5, height: 11 },
};

export const DEFAULT_MARGIN_INCHES: PrintMargin = {
  top: 0.5,
  right: 0.55,
  bottom: 0.5,
  left: 0.55,
};

export function pageDimensionsAsPixels(
  format: PageFormat,
  dpi = 96,
): PageDimensions {
  const { width, height } = PAGE_DIMENSIONS_INCHES[format];
  return {
    width: Math.round(width * dpi),
    height: Math.round(height * dpi),
  };
}

export function printMarginAsPixels(
  margin: PrintMargin,
  dpi = 96,
): PrintMargin {
  return {
    top: Math.round(margin.top * dpi),
    right: Math.round(margin.right * dpi),
    bottom: Math.round(margin.bottom * dpi),
    left: Math.round(margin.left * dpi),
  };
}

export function printMarginTemplates(
  format: PageFormat,
  dpi = 96,
): Record<string, PrintMargin> {
  const dimensions = pageDimensionsAsPixels(format, dpi);
  const { width, height } = dimensions;
  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);
  const margin = printMarginAsPixels(DEFAULT_MARGIN_INCHES, dpi);

  return {
    default: margin,
    narrow: { top: margin.top, right: Math.round(0.25 * dpi), bottom: margin.bottom, left: Math.round(0.25 * dpi) },
    moderate: { top: Math.round(0.75 * dpi), right: Math.round(0.75 * dpi), bottom: Math.round(0.75 * dpi), left: Math.round(0.75 * dpi) },
    wide: { top: margin.top, right: Math.round(1.0 * dpi), bottom: margin.bottom, left: Math.round(1.0 * dpi) },
    custom: margin,
  };
}

export function buildPagePdfOptions(
  format: PageFormat,
  margin: PrintMargin,
  dpi = 96,
) {
  const dimensions = pageDimensionsAsPixels(format, dpi);
  const marginPx = printMarginAsPixels(margin, dpi);

  return {
    width: dimensions.width,
    height: dimensions.height,
    margin: {
      top: marginPx.top,
      right: marginPx.right,
      bottom: marginPx.bottom,
      left: marginPx.left,
    },
  };
}
