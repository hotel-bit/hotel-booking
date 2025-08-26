"use client";
import React, { useContext, use } from "react";
import { Context } from "@/providers/ContextProvider";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/UseAuth";

export default function AdminProfile({ params }) {
  const { lang } = use(params);
  const { user } = useAuth();
  const { profileData } = useContext(Context);
  const router = useRouter();

  const translations = {
    en: {
      profile: "Profile",
      edit: "Edit Profile",
      name: "Name",
      email: "Email",
    },
    ar: {
      profile: "الملف الشخصي",
      edit: "تعديل الملف الشخصي",
      name: "الاسم",
      email: "البريد الإلكتروني",
    },
  };

  const t = translations[lang] || translations.en;

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
        <div>{profileData.name}</div>
      </div>

      <div className="mb-3 d-flex">
        <div style={{ width: "120px", fontWeight: 500, color: "#6c757d" }}>
          {t.email}:
        </div>
        <div>{user?.email}</div>
      </div>
    </div>
  );
}
