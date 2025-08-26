"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useContext,
  useEffect,
  use,
} from "react";
import { Context } from "@/providers/ContextProvider";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

import Loading from "@/components/Loading";

export default function EditArticle({ params }) {
  const { lang, id } = use(params);
  const router = useRouter();
  const { articles } = useContext(Context);
  const [activeLang, setActiveLang] = useState(lang || "en");
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

  const labels = {
    en: {
      editArticle: "Edit Article",
      langSelect: "Select Content Language",
      image: "Article Image",
      title: "Title",
      description: "Description",
      update: "Update",
      updating: "Updating",
      success: "Article updated successfully.",
      error: "An error occurred while updating the article.",
    },
    ar: {
      editArticle: "تعديل المقالة",
      langSelect: "اختر لغة المحتوى",
      image: "صورة المقالة",
      title: "العنوان",
      description: "وَصْف",
      update: "تحديث",
      updating: "تحديث",
      success: "تم تحديث المقالة بنجاح.",
      error: "حدث خطأ أثناء تحديث المقالة.",
    },
  };

  const ui = labels[lang] || labels["en"];

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

      let storageId = article.storageId;
      let imageUrl = article.image;

      if (newImage) {
        await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `articles/${storageId}` }),
        });

        storageId = nanoid();
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("path", `articles/${storageId}`);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Upload API error:", errData);
          throw new Error(errData.error || "Image upload failed");
        }

        const data = await res.json();
        imageUrl = data.url;
      }

      const articleRef = doc(db, "articles", id);
      await updateDoc(articleRef, {
        ...article,
        image: imageUrl,
        timestamp: serverTimestamp(),
        storageId,
      });

      toast.success(ui.success);
      setNewImage(null);
      router.back();
    } catch (error) {
      console.log(ui.error, error);
      toast.error(ui.error);
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
      <h4 className="mb-4">{ui.editArticle}</h4>

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
              style={{ width: "107.27px" }}
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
            {ui.title}
          </label>
          <input
            id="articleTitle"
            type="text"
            className="form-control"
            value={article.title?.[activeLang] || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {error && <div className="form-text text-danger">{error}</div>}
        </div>
        <div className="mb-5">
          <label className="form-label">{ui.description}</label>
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
                  lang === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {ui.updating}
            </>
          ) : (
            ui.update
          )}
        </button>
      </form>
    </div>
  );
}
