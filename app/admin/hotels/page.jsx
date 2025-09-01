"use client";
import React from "react";
import { useHotels } from "@/contexts/HotelsContext";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Hotels() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("hotels");
  const c = useTranslations("common");
  const { hotels, setHotels, loading } = useHotels();
  const [deletingIds, setDeletingIds] = React.useState([]);

  const handleDelete = async (id) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      setDeletingIds((prev) => [...prev, id]);

      await fetch("/api/deleteFolder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "zahid-hotel-images",
          folder: `${id}/`,
        }),
      });

      const res = await fetch("/api/deleteHotel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete hotel");

      toast.success(t("deletedSuccess"));
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(t("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((hid) => hid !== id));
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
          onClick={() => router.push(`/admin/add-hotel`)}
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
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              style={{
                border: "1px solid #e3e3e3",
                borderRadius: "12px",
                padding: "12px",
                width: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                id={`carousel-${hotel.id}`}
                className="carousel slide"
                data-bs-ride="carousel"
                style={{ borderRadius: "8px", overflow: "hidden" }}
              >
                <div className="carousel-inner">
                  {hotel.images.map((img, i) => (
                    <div
                      key={i}
                      className={`carousel-item ${i === 0 ? "active" : ""}`}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "16/9",
                          backgroundColor: "#f0f0f0",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`hotel-${i}`}
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
                    </div>
                  ))}
                </div>
                {hotel.images.length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target={`#carousel-${hotel.id}`}
                      data-bs-slide="prev"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                      ></span>
                      <span className="visually-hidden">Previous</span>
                    </button>

                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target={`#carousel-${hotel.id}`}
                      data-bs-slide="next"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                      ></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </>
                )}
              </div>

              <h5 className="clamp-3" style={{ margin: 0 }}>
                {hotel.title[locale]}
              </h5>

              <div className="d-flex flex-wrap gap-2">
                <div
                  className="btn btn-secondary btn-sm"
                  onClick={() => router.push(`/admin/rooms/${hotel.id}`)}
                >
                  {t("rooms")}
                </div>
                <button
                  className="btn btn-warning btn-sm mt-auto"
                  onClick={() => router.push(`/admin/edit-hotel/${hotel.id}`)}
                >
                  {c("edit")}
                </button>
                <button
                  className="btn btn-danger btn-sm mt-auto"
                  onClick={() => handleDelete(hotel.id)}
                  disabled={deletingIds.includes(hotel.id)}
                >
                  {deletingIds.includes(hotel.id) ? (
                    <span
                      className={`spinner-border spinner-border-sm ${
                        locale === "en" ? "me-2" : "ms-2"
                      }`}
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : null}
                  {c("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
