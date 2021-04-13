import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export function create<T>(payload: T, options: jwt.SignOptions = {}): string {
  return jwt.sign(payload as any, JWT_SECRET, {
    ...options,
    issuer: "web-service",
  });
}

export function decode<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}
