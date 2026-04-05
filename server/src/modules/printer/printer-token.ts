import crypto from 'crypto';

const TOKEN_TTL_MS = 5 * 60 * 1000;
const TOKEN_ALGO = 'sha256';

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
  return secret;
}

function getIssuer(): string {
  return process.env.PRINTER_ISSUER ?? 'resumate-printer';
}

export interface PrinterTokenPayload {
  resumeId: string;
  iat: number;
  exp: number;
  iss: string;
}

export function generatePrinterToken(resumeId: string): string {
  const secret = getSecret();
  const now = Date.now();
  const payload: PrinterTokenPayload = {
    resumeId,
    iat: now,
    exp: now + TOKEN_TTL_MS,
    iss: getIssuer(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac(TOKEN_ALGO, secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifyPrinterToken(token: string): PrinterTokenPayload | null {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return null;

    const encodedPayload = token.slice(0, lastDot);
    const signature = token.slice(lastDot + 1);

    const expectedSignature = crypto
      .createHmac(TOKEN_ALGO, getSecret())
      .update(encodedPayload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: PrinterTokenPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    );

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
