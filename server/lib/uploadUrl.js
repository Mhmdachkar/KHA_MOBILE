/**
 * Build the public URL for a file saved under `/uploads/<filename>`.
 *
 * Prefer `API_PUBLIC_URL` on Render so URLs never depend on `req.protocol`
 * (often `http` behind a proxy unless `trust proxy` is set).
 */
export function buildPublicUploadUrl(req, filename) {
  const configured = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
  if (configured) return `${configured}/uploads/${filename}`;

  const rawProto = (req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const proto =
    rawProto === 'http' || rawProto === 'https'
      ? rawProto
      : req.protocol === 'http' || req.protocol === 'https'
        ? req.protocol
        : 'https';
  const host = (req.get('x-forwarded-host') || req.get('host') || '').trim();
  if (!host) return `/uploads/${filename}`;
  return `${proto}://${host}/uploads/${filename}`;
}
