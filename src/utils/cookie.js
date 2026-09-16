function isSecureRequest(req) {
  const proto = String(req?.headers?.["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
  return Boolean(req?.secure || proto === "https")
}

export function cookieOptions(req, maxAge = 8 * 60 * 60 * 1000) {
  const secure = isSecureRequest(req)
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "strict",
    maxAge,
  }
}

export function clearCookieOptions(req) {
  const secure = isSecureRequest(req)
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "strict",
  }
}
