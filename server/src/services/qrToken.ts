import { createHmac, timingSafeEqual } from "node:crypto";

export class QrTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrTokenError";
  }
}

export type QrPayload = {
  sessionId: string;
  courseCode: string;
  exp: number;
};

function hmac(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function signQrToken(payload: QrPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${hmac(body, secret)}`;
}

export function verifyQrToken(token: string, secret: string): QrPayload {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new QrTokenError("Malformed QR token");
  }

  const [body, signature] = parts;
  if (!safeEqual(signature, hmac(body, secret))) {
    throw new QrTokenError("Invalid QR token signature");
  }

  let payload: QrPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new QrTokenError("Malformed QR token payload");
  }

  if (
    typeof payload.sessionId !== "string" ||
    typeof payload.courseCode !== "string" ||
    typeof payload.exp !== "number"
  ) {
    throw new QrTokenError("Invalid QR token payload");
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    throw new QrTokenError("QR token has expired");
  }

  return payload;
}
