"use client"
import React, { use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function Rooms({ params }) {
  const { id: hotelId } = use(params);
  const t = useTranslations("rooms");
  const router = useRouter();

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
          onClick={() => router.push(`/admin/add-room/${hotelId}`)}
        >
          {t("add")}
        </div>
      </div>
    </div>
  );
}
