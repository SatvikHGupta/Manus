export function buildExportFilename(fontFamily, pageNumber, extension) {
  const clean = fontFamily
    .replace(/^HND_/, '')
    .replace(/_/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .trim() || 'handwriting';

  const suffix = pageNumber != null ? `_page${pageNumber}` : '';
  return `${clean}${suffix}.${extension}`;
}
