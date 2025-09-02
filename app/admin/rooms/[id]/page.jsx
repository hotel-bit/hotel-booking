"use client";
import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function Rooms() {
  const params = useParams();
  const { id: hotelId } = params;
  const t = useTranslations("rooms");
  const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch(`/api/fetchRooms/${hotelId}`);
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.error(err);
        toast.error(t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    }
    if (hotelId) {
      fetchRooms();
    }
  }, [hotelId]);

  const handleDelete = async (sk) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      setDeletingIds((prev) => [...prev, sk]);

      await fetch("/api/deleteFolder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "zahid-hotel-images",
          folder: `${hotelId}/rooms/`,
        }),
      });

      const res = await fetch("/api/deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: "rooms", id: hotelId, sk }),
      });
      if (!res.ok) throw new Error("Failed to delete room");

      toast.success(t("deletedSuccess"));
      setRooms((prev) => prev.filter((r) => r.sk !== sk));
    } catch (err) {
      console.error(err);
      toast.error(t("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== sk));
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
          onClick={() => router.push(`/admin/add-room/${hotelId}`)}
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
      ) : rooms.length === 0 ? (
        <p>{t("noRooms")}</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {rooms.map((room) => (
            <div
              key={room.sk}
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
              {room.image?.url && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <img
                    src={room.image.url}
                    alt={room.type[locale]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
              )}

              <h5 className="clamp-3" style={{ margin: 0 }}>
                {room.type[locale]} - {room.view[locale]}
              </h5>

              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-warning btn-sm mt-auto"
                  onClick={() =>
                    router.push(`/admin/edit-room/${hotelId}/${room.sk}`)
                  }
                >
                  {c("edit")}
                </button>
                <button
                  className="btn btn-danger btn-sm mt-auto"
                  onClick={() => handleDelete(room.sk)}
                  disabled={deletingIds.includes(room.sk)}
                >
                  {deletingIds.includes(room.sk) ? (
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
