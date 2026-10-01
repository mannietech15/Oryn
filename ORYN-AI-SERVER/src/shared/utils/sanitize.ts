import { SecurityError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-codes';

const ALLOWED_DOWNLOAD_DOMAINS = [
  'image.pollinations.ai',
  'pollinations.ai',
  'images.unsplash.com',
  'cdn.jsdelivr.net',
];

export function validateSafeDownloadUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SecurityError('Invalid download URL format.', ErrorCode.BAD_REQUEST);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new SecurityError('Forbidden protocol in URL.', ErrorCode.SSRF_VIOLATION);
  }

  // Block localhost, private IPs, loopback to prevent SSRF
  const hostname = parsed.hostname.toLowerCase();
  const isLoopback =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.16.') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal');

  if (isLoopback) {
    throw new SecurityError('Private/loopback IP requests are prohibited.', ErrorCode.SSRF_VIOLATION);
  }

  // Check against allowed download domains
  const isAllowed = ALLOWED_DOWNLOAD_DOMAINS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );

  if (!isAllowed) {
    throw new SecurityError(`Domain '${hostname}' is not authorized for proxy downloads.`, ErrorCode.SSRF_VIOLATION);
  }

  return parsed;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80) || 'download.bin';
}
