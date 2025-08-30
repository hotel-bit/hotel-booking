"use client";
import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function Hotels() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("hotels");

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-5">
        <h4>{t("title")}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => router.push(`/admin/add-hotel`)}
        >
          {t("add")}
        </div>
      </div>
    </div>
  );
}
