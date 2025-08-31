"use client";
import React, { use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function AddRoom({ params }) {
  const { id: hotelId } = use(params);
  const t = useTranslations("addRoom");
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
      <h4 className="mb-5">{t("pageTitle")}</h4>
    </div>
  );
}
