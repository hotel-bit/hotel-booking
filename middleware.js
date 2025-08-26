import { NextResponse } from "next/server";

const supportedLanguages = ["en", "ar"];

export function middleware(req) {
  const res = NextResponse.next();

  const localeCookie = req.cookies.get("locale")?.value;

  if (!localeCookie) {
    const acceptLanguage = req.headers.get("accept-language") || "";
    const preferredLang = acceptLanguage.split(",")[0].split("-")[0];

    const locale = supportedLanguages.includes(preferredLang)
      ? preferredLang
      : "en";

    res.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }

  return res;
}

export const config = {
  matcher: "/:path*",
};
