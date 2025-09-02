"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";

export default function ChangeEmail() {
  const locale = useLocale();
  const [email, setEmail] = useState("");

  const t = useTranslations("changeEmail");

  const handleChangeEmail = (e) => {
    e.preventDefault();
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
