import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
export const GUEST_TOKEN = "guest-token";

export const guestUser = {
  id: 0,
  nickname: "游客",
  role: "guest",
};

export interface JwtPayload {
  userId: number;
  role: string;
  openid?: string;
}

export function isGuestAccessEnabled(): boolean {
  return process.env.GUEST_ACCESS_ENABLED === "true";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Edge-compatible token verification for middleware
export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(
  headers: Headers
): string | null {
  const auth = headers.get("authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
