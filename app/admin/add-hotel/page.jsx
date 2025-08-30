"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function AddHotel() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("addHotel");
  const c = useTranslations("common");
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newHotel, setNewHotel] = useState({
    title: { en: "", ar: "" },
    address: { en: "", ar: "" },
    images: [],
    services: { en: [], ar: [] },
    rooms: [],
    terms: { en: "en", ar: "ar" },
    brief: { en: "", ar: "" },
  });

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 400,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder: activeLang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t("pageTitle")}</h4>
      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {c("langSelect")}
        </label>
        <select
          id="langSelect"
          className="form-select"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>
    </div>
  );
}
