import type { IncomingMessage } from "http";

export function validateOrigin(origin: string | undefined | null) {
  const allowedOrigin = process.env.MCP_ALLOWED_ORIGIN;

  if (!allowedOrigin) {
    return true;
  }

  return origin === allowedOrigin;
}

export function validateBearerAuth(authHeader: string | undefined | null) {
  const expectedSecret = process.env.MCP_SHARED_SECRET;

  if (!expectedSecret) {
    throw new Error("MCP_SHARED_SECRET is not configured");
  }

  if (!authHeader) {
    return false;
  }

  const expected = `Bearer ${expectedSecret}`;
  return authHeader === expected;
}

export function assertAuthorizedRequest(req: IncomingMessage) {
  const origin = req.headers.origin;
  const authHeader = req.headers.authorization;

  if (!validateOrigin(origin)) {
    const error = new Error("Forbidden origin");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  if (!validateBearerAuth(authHeader)) {
    const error = new Error("Unauthorized");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }
}