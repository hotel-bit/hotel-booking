"use client";
import React, { useContext, useEffect, use } from "react";
import { Context } from "@/providers/ContextProvider";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";
import { FaEye, FaTrash, FaPencilAlt } from "react-icons/fa";

export default function Articles({ params }) {
  const { lang } = use(params);
  const { articles } = useContext(Context);
  const router = useRouter();

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, articles.length);

  const currentArticles = articles.slice(startPageIndex, endPageIndex);

  const translations = {
    en: {
      articles: "Articles",
      add: "Add",
      noArticles: "No articles yet",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this article?",
      deletedSuccess: "Article deleted successfully.",
      deletedFail: "Failed to delete article",
    },
    ar: {
      articles: "المقالات",
      add: "إضافة",
      noArticles: "لا توجد مقالات بعد",
      view: "عرض",
      edit: "تعديل",
      delete: "حذف",
      confirmDelete: "هل أنت متأكد أنك تريد حذف هذه المقالة؟",
      deletedSuccess: "تم حذف المقالة بنجاح.",
      deletedFail: "فشل حذف المقالة",
    },
  };

  const t = translations[lang] || translations.en;

  const handleDelete = async (article) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `articles/${article.storageId}` }),
      });

      await deleteDoc(doc(db, "articles", article.id));

      toast.success(t.deletedSuccess);
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error(t.deletedFail);
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
      <div className="d-flex justify-content-between align-items-start mb-5">
        <h4>{t.articles}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => router.push(`/${lang}/admin/add-article`)}
        >
          {t.add}
        </div>
      </div>
      {articles.length === 0 ? (
        <h5 className="text-center my-5">{t.noArticles}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentArticles.map((article) => {
              return (
                <div className="col" key={article.id}>
                  <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
                    <img
                      src={article.image}
                      className="card-img-top"
                      alt={article.title[lang]}
                    />
                    <div className="card-body d-flex flex-column">
                      <div
                        className="mb-3 clamp-3 fw-semibold flex-grow-1"
                        style={{ fontWeight: "600" }}
                      >
                        {article.title[lang]}
                      </div>
                      <div className="d-flex">
                        <div
                          className={`btn btn-primary ${
                            lang === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(
                              `/${lang}/article/${article.title["en"].replace(
                                /\s+/g,
                                "_"
                              )}`
                            )
                          }
                          title={t.view}
                        >
                          <FaEye />
                        </div>
                        <div
                          className={`btn btn-warning text-white ${
                            lang === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(
                              `/${lang}/admin/edit-article/${article.id}`
                            )
                          }
                          title={t.edit}
                        >
                          <FaPencilAlt />
                        </div>
                        <div
                          className="btn btn-danger"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(article)}
                          title={t.delete}
                        >
                          <FaTrash />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {articles.length > 20 && (
            <div className="d-flex justify-content-center">
              <Pagination
                count={totalPages}
                page={currentPageIndex}
                onChange={(event, page) => displayPage(page)}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
