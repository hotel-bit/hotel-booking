"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useViews } from "@/contexts/ViewsContext";
import { useRoomTypes } from "@/contexts/RoomTypesContext";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";

export default function EditRoom() {
  const params = useParams();
  const { hotelId, roomId } = params;
  const t = useTranslations("editRoom");
  const a = useTranslations("addRoom");
  const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { views } = useViews();
  const { roomTypes } = useRoomTypes();
  const [imgUrl, setImgUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setcroppedAreaPixels] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch("/api/fetchRoom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: hotelId, sk: roomId }),
        });

        const data = await res.json();
        setRoom(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load room details");
      }
    };
    if (hotelId && roomId) {
      fetchRoom();
    }
  }, [hotelId, roomId]);

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setImgUrl(URL.createObjectURL(selectedFile));
      e.target.value = "";
      document.getElementById("openModal").click();
    }
  };

  const handleSaveImage = () => {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    const { x, y, width, height } = croppedAreaPixels;
    tempCanvas.width = width;
    tempCanvas.height = height;

    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      const croppedDataURL = tempCanvas.toDataURL("image/jpeg");
      fetch(croppedDataURL)
        .then((res) => res.blob())
        .then((blob) => {
          const croppedImageFile = new File([blob], "room-image", {
            type: "image/jpeg",
          });
          setNewImage(croppedImageFile);
          setRoom((prev) => ({
            ...prev,
            image: { ...room.image, url: "" },
          }));
        });
    };
    document.getElementById("closeModal").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room) return;

    try {
      setLoading(true);
      let imageData = { ...room.image };

      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("id", imageData.path);
        formData.append("bucket", "zahid-hotel-images");

        const imgRes = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!imgRes.ok) throw new Error("Image upload failed");

        const data = await imgRes.json();
        imageData.url = data.url;
      }

      const updatedRoom = {
        ...room,
        image: imageData,
        id: hotelId,
        sk: roomId,
        tableName: "rooms",
      };

      const res = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      });

      if (!res.ok) throw new Error("Failed to update room");

      toast.success(t("updateSuccess"));
      router.back();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const modal = document.getElementById("Modal");
    if (modal) {
      modal.addEventListener("hidden.bs.modal", () => {
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setcroppedAreaPixels(null);
        setImgUrl("");
      });
    }
  }, []);

  if (!room) return <Loading />;

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t("pageTitle")}</h4>

      <form onSubmit={handleSubmit} className="w-md-75">
        <div className="mb-3">
          <label className="form-label">{a("image")}</label>
          <input
            type="file"
            accept="image/*"
            id="roomImageInput"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          {(room.image?.url || newImage) && (
            <img
              src={room.image.url || URL.createObjectURL(newImage)}
              alt="preview"
              style={{
                width: 200,
                marginBottom: 10,
                borderRadius: "8px",
                display: "block",
              }}
            />
          )}
          <button
            type="button"
            className="primaryButton border-0 rounded"
            onClick={() => document.getElementById("roomImageInput").click()}
          >
            {c("change")}
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">{a("roomType")}</label>
          <select
            className="form-select"
            value={room.type?.en || ""}
            onChange={(e) =>
              setRoom({
                ...room,
                type: {
                  en: e.target.value,
                  ar:
                    roomTypes.find((rt) => rt.title.en === e.target.value)
                      ?.title.ar || "",
                },
              })
            }
            name="type"
            required
          >
            <option value="">{a("selectType")}</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.title.en}>
                {rt.title[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">{a("view")}</label>
          <select
            className="form-select"
            value={room.view?.id || ""}
            onChange={(e) => {
              const selectedView = views.find((v) => v.id === e.target.value);
              setRoom({
                ...room,
                view: {
                  id: selectedView?.id || "",
                  en: selectedView?.title.en || "",
                  ar: selectedView?.title.ar || "",
                },
              });
            }}
            name="view"
          >
            <option value="">{a("selectView")}</option>
            {views.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">{a("maxGuest")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={room.maxGuest}
            onChange={(e) =>
              setRoom({ ...room, maxGuest: parseInt(e.target.value) })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{a("noOfBeds")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={room.noOfBeds}
            onChange={(e) =>
              setRoom({ ...room, noOfBeds: parseInt(e.target.value) })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{a("pricePerNight")}</label>
          <input
            type="number"
            min={0}
            className="form-control"
            value={room.pricePerNight}
            onChange={(e) =>
              setRoom({ ...room, pricePerNight: parseInt(e.target.value) })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{a("noOfRooms")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={room.noOfRooms}
            onChange={(e) =>
              setRoom({ ...room, noOfRooms: parseInt(e.target.value) })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="primaryButton border-0 rounded"
          disabled={loading}
        >
          {loading ? (
            <span
              className={`spinner-border spinner-border-sm ${
                locale === "en" ? "me-2" : "ms-2"
              }`}
              role="status"
              aria-hidden="true"
            ></span>
          ) : null}
          {loading ? c("updating") : c("update")}
        </button>
      </form>

      <button
        id="openModal"
        className="d-none"
        data-bs-target="#Modal"
        data-bs-toggle="modal"
      ></button>
      <div className="modal fade" id="Modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-body p-4">
              <h5 className="mb-4">Crop Image</h5>
              <div
                className="crop-container mb-4"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "300px",
                }}
              >
                <Cropper
                  image={imgUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  cropShape="rect"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(croppedArea, croppedAreaPixels) =>
                    setcroppedAreaPixels(croppedAreaPixels)
                  }
                />
              </div>
              <div className="controls">
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => {
                    setZoom(e.target.value);
                  }}
                  className="zoom-range"
                />
              </div>
              <div className="d-flex">
                <button
                  type="submit"
                  className={`primaryButton ${
                    locale === "en" ? "me-3" : "ms-3"
                  }`}
                  style={{ border: 0, borderRadius: "12px" }}
                  onClick={handleSaveImage}
                >
                  Save
                </button>
                <div
                  className="greyButton"
                  id="closeModal"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
