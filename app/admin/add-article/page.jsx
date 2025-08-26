"use client";
import React, { useState, useRef, useMemo, use } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { nanoid } from "nanoid";
import { db } from "@/configuration/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

export default function AddArticle({ params }) {
  const { lang } = use(params);

  const [activeLang, setActiveLang] = useState(lang || "en");
  const [article, setArticle] = useState({
    image: null,
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const labels = {
    en: {
      addArticle: "Add Article",
      langSelect: "Select Content Language",
      image: "Article Image",
      title: "Title",
      description: "Description",
      add: "Add",
      adding: "Adding...",
      change: "Change",
    },
    ar: {
      addArticle: "إضافة مقالة",
      langSelect: "اختر لغة المحتوى",
      image: "صورة المقالة",
      title: "العنوان",
      description: "وَصْف",
      add: "إضافة",
      adding: "جارٍ الإضافة...",
      change: "تغيير",
    },
  };

  const ui = labels[lang] || labels["en"];

  const handleChange = (field, value) => {
    if (field === "title" && value.includes("_")) {
      setError(
        activeLang === "ar"
          ? "الشرطة السفلية غير مسموح بها في العنوان."
          : "Underscores are not allowed in the title."
      );
      return;
    } else {
      setError("");
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
    setArticle((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));

    setTimeout(() => {
      e.target.value = "";
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!article.image) {
        toast.error(
          lang === "ar" ? "الرجاء إضافة صورة." : "Please add an image."
        );
        return;
      }

      const storageId = nanoid();

      const formData = new FormData();
      formData.append("file", article.image);
      formData.append("path", `articles/${storageId}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const imageURL = data.url;

      const articlesRef = collection(db, "articles");
      await addDoc(articlesRef, {
        ...article,
        storageId,
        image: imageURL,
        timestamp: serverTimestamp(),
      });

      toast.success(
        lang === "ar"
          ? "تم رفع المقالة بنجاح."
          : "Article uploaded successfully."
      );

      setArticle({
        image: null,
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
      });
    } catch (error) {
      console.log("Failed to add article", error);
      toast.error(
        lang === "ar" ? "فشل في إضافة المقالة" : "Failed to add article"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-4">{ui.addArticle}</h4>

      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {ui.langSelect}
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
          <label className="form-label mb-3">{ui.image}</label>
          {article.image && (
            <img
              src={URL.createObjectURL(article.image)}
              alt="img"
              style={{ width: "100%", borderRadius: "30px" }}
              className="mb-4"
            />
          )}
          <div className="d-flex mb-3">
            <div
              className="primaryButton text-center me-2"
              style={{ width: "107.27px" }}
              onClick={() => document.getElementById("ImgInput").click()}
            >
              {article.image ? ui.change : ui.add}
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
            {ui.title}
          </label>
          <input
            id="articleTitle"
            type="text"
            className="form-control"
            value={article.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {error !== "" && <div className="form-text text-danger">{error}</div>}
        </div>
        <div className="mb-5">
          <label className="form-label">{ui.description}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={article.description[activeLang]}
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
                  lang === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {ui.adding}
            </>
          ) : (
            ui.add
          )}
        </button>
      </form>
    </div>
  );
}
