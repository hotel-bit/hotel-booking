"use client";
import React, { useState } from "react";
import { use } from "react";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import useAuth from "@/hooks/UseAuth";
import { toast } from "react-toastify";

export default function ChangeEmail({ params }) {
  const { lang } = use(params);
  const { user } = useAuth();
  const [email, setEmail] = useState("");

  const translations = {
    en: {
      title: "Change Email",
      description: "A verification link will be sent to your new email",
      emailLabel: "Email",
      emailPlaceholder: "Enter new email",
      sendButton: "Send",
      successMessage: (email) =>
        `Email verification link has been sent to ${email}`,
    },
    ar: {
      title: "تغيير البريد الإلكتروني",
      description: "سيتم إرسال رابط التحقق إلى بريدك الإلكتروني الجديد",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "أدخل البريد الإلكتروني الجديد",
      sendButton: "إرسال",
      successMessage: (email) => `تم إرسال رابط التحقق إلى ${email}`,
    },
  };

  const t = translations[lang] || translations.en;

  const handleChangeEmail = (e) => {
    e.preventDefault();
    verifyBeforeUpdateEmail(user, email)
      .then(() => {
        toast.success(t.successMessage(email));
        setEmail("");
      })
      .catch((error) => toast.error(error.message));
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
        backgroundColor: "white",
      }}
    >
      <form onSubmit={handleChangeEmail} className="w-md-75">
        <h4 className="mb-5">{t.title}</h4>
        <p>{t.description}</p>
        <div className="row my-5">
          <div>
            <label htmlFor="email" className="form-label">
              {t.emailLabel}
            </label>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              name="email"
              className="form-control"
              style={{ borderRadius: "10px" }}
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="primaryButton"
          style={{ borderWidth: 0, borderRadius: "12px" }}
        >
          {t.sendButton}
        </button>
      </form>
    </div>
  );
}
