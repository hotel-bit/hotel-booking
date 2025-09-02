"use client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function AdminProfile() {
  const router = useRouter();
  const locale = useLocale();

  const t = useTranslations("profile");

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <div className="d-flex justify-content-between mb-5">
        <h4>{t.profile}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => router.push(`/${lang}/admin/edit-profile`)}
        >
          {t.edit}
        </div>
      </div>

      <div className="mb-3 d-flex">
        <div style={{ width: "120px", fontWeight: 500, color: "#6c757d" }}>
          {t.name}:
        </div>
        {/*<div>{profileData.name}</div>*/}
      </div>

      <div className="mb-3 d-flex">
        <div style={{ width: "120px", fontWeight: 500, color: "#6c757d" }}>
          {t.email}:
        </div>
        {/*<div>{user?.email}</div>*/}
      </div>
    </div>
  );
}
