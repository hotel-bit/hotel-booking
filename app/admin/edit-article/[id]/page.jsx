"use client";
import React, { useState, useRef, useMemo, useEffect, use } from "react";
import { useArticles } from "@/contexts/ArticlesContext";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useTranslations, useLocale } from "next-intl";

import Loading from "@/components/Loading";

export default function EditArticle({ params }) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations("editArticle");
  const { articles, setArticles } = useArticles();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [article, setArticle] = useState(null);
  const [newImage, setNewImage] = useState(null);

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

  const handleChange = (field, value) => {
    if (field === "title") {
      if (value.includes("_")) {
        setError("Underscores are not allowed in the title.");
        return;
      } else {
        setError("");
      }
    }
    if (["title", "description"].includes(field)) {
      setArticle((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setArticle((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setArticle((prev) => ({
        ...prev,
        image: null,
      }));
      setTimeout(() => {
        e.target.value = "";
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article) return;
    try {
      setLoading(true);

      let imageUrl = article.image;

      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("id", article.id);
        formData.append("bucket", "zahid-blog-images");

        const res = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        imageUrl = data.url;
      }

      const articleData = {
        ...article,
        image: imageUrl,
        tableName: "articles",
      };

      const articleRes = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      });

      if (!articleRes.ok) throw new Error("Failed to update article");

      toast.success(t("success"));
      setNewImage(null);
      router.back();
    } catch (error) {
      console.log(t("error"), error);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articles.length > 0) {
      const filteredArticle = articles.find((a) => a.id === id);
      if (filteredArticle) {
        setArticle(filteredArticle);
      } else {
        toast.error("Article not found.");
      }
    }
  }, [id, articles]);

  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return <Loading />;
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-4">{t("pageTitle")}</h4>

      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {t("langSelect")}
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

      <form onSubmit={handleSubmit} className="w-md-75">
        <div className="mb-4">
          <label className="form-label mb-3">{t("image")}</label>
          {(article.image || newImage) && (
            <img
              src={article.image || URL.createObjectURL(newImage)}
              alt="img"
              style={{ width: "100%", borderRadius: "30px" }}
              className="mb-4"
            />
          )}
          <div className="d-flex mb-3">
            <div
              className="primaryButton text-center me-2"
              onClick={() => document.getElementById("ImgInput").click()}
            >
              {article.image || newImage ? "Change" : "Add"}
            </div>
          </div>
          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
            className="form-control"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="articleTitle" className="form-label">
            {t("title")}
          </label>
          <input
            id="articleTitle"
            type="text"
            className="form-control"
            value={article.title?.[activeLang] || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
          {error && <div className="form-text text-danger">{error}</div>}
        </div>
        <div className="mb-5">
          <label className="form-label">{t("description")}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={article.description?.[activeLang] || ""}
            tabIndex={1}
            onBlur={(newContent) => handleChange("description", newContent)}
            onChange={() => {}}
          />
        </div>

        <button
          type="submit"
          className="primaryButton border-0"
          style={{ borderRadius: "12px" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className={`spinner-border spinner-border-sm ${
                  locale === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {t("updating")}
            </>
          ) : (
            t("update")
          )}
        </button>
      </form>
    </div>
  );
}
