import crypto from 'node:crypto';

export const QR_TOKEN_TTL_SECONDS = 60;

export interface QrTokenPayload {
  memberId: number;
  memberName: string;
  branchId: number;
  type: 'CHECKIN';
  iat: number;
  exp: number;
}

function getSecret() {
  const secret = process.env.QR_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('QR_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY is required');
  }
  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(encodedPayload: string) {
  return crypto.createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url');
}

export function createQrToken(input: Pick<QrTokenPayload, 'memberId' | 'memberName' | 'branchId'>) {
  const now = Math.floor(Date.now() / 1000);
  const payload: QrTokenPayload = {
    ...input,
    type: 'CHECKIN',
    iat: now,
    exp: now + QR_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyQrToken(token: string): QrTokenPayload {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    throw new Error('invalid_token');
  }

  const expected = sign(encodedPayload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error('invalid_signature');
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as QrTokenPayload;
  if (payload.type !== 'CHECKIN' || !payload.memberId || !payload.branchId) {
    throw new Error('invalid_payload');
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('expired_token');
  }

  return payload;
}
