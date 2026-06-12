// jwtUtils.ts

interface JwtPayload {
  sub: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// This function decodes a JWT token to extract the payload.
export function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: expected three dot-separated segments");
  }
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}
