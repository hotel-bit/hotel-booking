"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCities } from "@/contexts/CitiesContext";
import { useTranslations, useLocale } from "next-intl";
import { FaEye, FaTrash, FaPencilAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Cities() {
  const router = useRouter();
  const locale = useLocale();
  const { cities, setCities, loading } = useCities();
  const t = useTranslations("cities");
  const c = useTranslations("common");

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      const resImg = await fetch(`/api/image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket: "zahid-city-images",
          id,
        }),
      });

      if (!resImg.ok) throw new Error("Failed to delete image");

      const res = await fetch("/api/deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: "cities", id }),
      });

      if (!res.ok) throw new Error("Failed to delete city");

      setCities((prev) => prev.filter((a) => a.id !== id));
      toast.success(t("deletedSuccess"));
    } catch (error) {
      console.error("Failed to delete city:", error);
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
          onClick={() => router.push(`/admin/add-city`)}
        >
          {t("add")}
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : cities.length > 0 ? (
        <div
          className="d-flex flex-wrap justify-content-start gap-4 mb-5"
          style={{ rowGap: "1.5rem" }}
        >
          {cities.map((city) => (
            <div
              key={city.id}
              className="card h-100 shadow-sm rounded-3 overflow-hidden"
              style={{ width: "250px", flex: "0 0 auto" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1",
                  backgroundColor: "#f0f0f0",
                  overflow: "hidden",
                }}
              >
                <img
                  src={city.image}
                  alt={city.title[locale]}
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
                  {city.title[locale]}
                </div>
                <div className="d-flex">
                  <div
                    className={`btn btn-warning text-white ${
                      locale === "en" ? "me-2" : "ms-2"
                    }`}
                    onClick={() => router.push(`/admin/edit-city/${city.id}`)}
                    title={c("edit")}
                  >
                    <FaPencilAlt />
                  </div>
                  <div
                    className="btn btn-danger"
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleDelete(city.id)}
                    title={c("delete")}
                  >
                    <FaTrash />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h6 className="text-center my-5">{t("noCities")}</h6>
      )}
    </div>
  );
}
