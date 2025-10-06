"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-toastify";
import { useContent } from "@/contexts/ContentContext";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function PrivacyPolicy() {
  const locale = useLocale();
  const t = useTranslations("terms");
  const p = useTranslations("privacy");
  const c = useTranslations("common");
  const { privacy } = useContent();
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [formData, setFormData] = useState({
    en: { headline: "", copy: "", body: "" },
    ar: { headline: "", copy: "", body: "" },
  });

  const [saving, setSaving] = useState(false);
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 800,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder: activeLang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedData = {
        ...formData,
        id: "privacy",
        tableName: "content",
      };

      const res = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update privacy policy");
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update the privacy policy");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setFormData(privacy);
  }, [privacy]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{p("pageTitle")}</h4>
        <select
          className="form-select w-auto"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">{t("headline")}</label>
        <input
          type="text"
          className="form-control"
          value={formData[activeLang].headline}
          onChange={(e) =>
            setFormData({
              ...formData,
              [activeLang]: {
                ...formData[activeLang],
                headline: e.target.value,
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("copy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData[activeLang].copy}
          onChange={(e) =>
            setFormData({
              ...formData,
              [activeLang]: {
                ...formData[activeLang],
                copy: e.target.value,
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="form-label">{t("body")}</label>
        <JoditEditor
          ref={editor}
          value={formData[activeLang].body}
          config={config}
          onBlur={(newContent) =>
            setFormData({
              ...formData,
              [activeLang]: { ...formData[activeLang], body: newContent },
            })
          }
        />
      </div>

      <div className="d-flex justify-content-start">
        <button
          className="primaryButton border-0 rounded"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <div
              className="spinner-border spinner-border-sm text-light"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            c("save")
          )}
        </button>
      </div>
    </div>
  );
}
