"use client";
import React, { useEffect, useState } from "react";
import { useArticles } from "@/contexts/ArticlesContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";
import { FaEye, FaTrash, FaPencilAlt } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

export default function Articles() {
  const locale = useLocale();
  const t = useTranslations("articles");
  const c = useTranslations("common");
  const router = useRouter();
  const { articles, setArticles, loading } = useArticles();

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, articles.length);

  const currentArticles = articles.slice(startPageIndex, endPageIndex);

  const handleDelete = async (article) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const resImg = await fetch(`/api/image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket: "zahid-blog-images",
          id: article.id,
        }),
      });

      if (!resImg.ok) throw new Error("Failed to delete image");

      const res = await fetch("/api/deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: "articles", id: article.id }),
      });

      if (!res.ok) throw new Error("Failed to delete article");

      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      toast.success(t("deletedSuccess"));
      if (articles.length > 20 && currentArticles.length === 1) {
        setcurrentPageIndex(currentPageIndex - 1);
      }
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error(t("deletedFail"));
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
        <h4>{t("title")}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => router.push(`/admin/add-article`)}
        >
          {c("add")}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <h5 className="text-center my-5">{t("noArticles")}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentArticles.map((article) => {
              return (
                <div className="col" key={article.id}>
                  <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "83.83%",
                        backgroundColor: "#f0f0f0",
                        overflow: "hidden",
                      }}
                      className="card-img-top"
                    >
                      <img
                        src={article.image}
                        alt={article.title[locale]}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div
                        className="mb-3 clamp-3 fw-semibold flex-grow-1"
                        style={{ fontWeight: "600" }}
                      >
                        {article.title[locale]}
                      </div>
                      <div className="d-flex">
                        <div
                          className={`btn btn-primary ${
                            locale === "en" ? "me-2" : "ms-2"
                          }`}
                          title={c("view")}
                        >
                          <FaEye />
                        </div>
                        <div
                          className={`btn btn-warning text-white ${
                            locale === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(`/admin/edit-article/${article.id}`)
                          }
                          title={c("edit")}
                        >
                          <FaPencilAlt />
                        </div>
                        <div
                          className="btn btn-danger"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(article)}
                          title={c("delete")}
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
