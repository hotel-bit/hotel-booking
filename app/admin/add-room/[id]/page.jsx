"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useViews } from "@/contexts/ViewsContext";
import { useRoomTypes } from "@/contexts/RoomTypesContext";
import { nanoid } from "nanoid";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";

export default function AddRoom() {
  const params = useParams();
  const { id: hotelId } = params;
  const t = useTranslations("addRoom");
  const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { views } = useViews();
  const { roomTypes } = useRoomTypes();
  const [imgUrl, setImgUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setcroppedAreaPixels] = useState(null);
  const [newRoom, setNewRoom] = useState({
    type: { en: "", ar: "" },
    maxGuest: 1,
    noOfBeds: 1,
    pricePerNight: 0,
    noOfRooms: 1,
    view: { en: "", ar: "" },
    image: null,
    imagePreview: "",
  });

  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setImgUrl(URL.createObjectURL(selectedFile));
      event.target.value = "";
      document.getElementById("openModal").click();
    }
  };

  const handleSaveImage = () => {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    const x = croppedAreaPixels.x;
    const y = croppedAreaPixels.y;
    const width = croppedAreaPixels.width;
    const height = croppedAreaPixels.height;

    tempCanvas.width = width;
    tempCanvas.height = height;

    const img = new Image();
    img.src = imgUrl;
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    const croppedDataURL = tempCanvas.toDataURL("image/jpeg");
    fetch(croppedDataURL)
      .then((res) => res.blob())
      .then((blob) => {
        const croppedImageFile = new File([blob], "city-image", {
          type: "image/jpeg",
        });
        setNewRoom((prev) => ({
          ...prev,
          image: croppedImageFile,
          imagePreview: URL.createObjectURL(croppedImageFile),
        }));
      });
    document.getElementById("closeModal").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newRoom.image) {
      toast.error(c("addImage"));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      const imgId = nanoid();
      const path = `${hotelId}/rooms/${imgId}`;
      formData.append("file", newRoom.image);
      formData.append("id", path);
      formData.append("bucket", "zahid-hotel-images");

      const imgRes = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });
      if (!imgRes.ok) throw new Error("Image upload failed");
      const data = await imgRes.json();

      const roomData = {
        ...newRoom,
        image: { url: data.url, path },
        hotelId,
        roomId: nanoid(),
        tableName: "rooms",
      };

      const res = await fetch("/api/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });

      if (!res.ok) throw new Error("Failed to save room");

      toast.success(c("saveSuccess"));
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
    modal.addEventListener("hidden.bs.modal", () => {
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setcroppedAreaPixels(null);
      setImgUrl("");
    });
  }, []);

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
          <label className="form-label">{t("image")}</label>

          <input
            type="file"
            accept="image/*"
            id="roomImageInput"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />

          {newRoom.imagePreview && (
            <img
              src={newRoom.imagePreview}
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
            {newRoom.image ? c("change") : c("add")}
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">{t("roomType")}</label>
          <select
            className="form-select"
            value={newRoom.type.en}
            onChange={(e) =>
              setNewRoom({
                ...newRoom,
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
            <option value="">{t("selectType")}</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.title.en}>
                {rt.title[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">{t("view")}</label>
          <select
            className="form-select"
            value={newRoom.view.id || ""}
            onChange={(e) => {
              const selectedView = views.find((v) => v.id === e.target.value);
              setNewRoom({
                ...newRoom,
                view: {
                  id: selectedView?.id || "",
                  en: selectedView?.title.en || "",
                  ar: selectedView?.title.ar || "",
                },
              });
            }}
            name="view"
          >
            <option value="">{t("selectView")}</option>
            {views.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">{t("maxGuest")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={newRoom.maxGuest}
            onChange={(e) =>
              setNewRoom({ ...newRoom, maxGuest: parseInt(e.target.value) })
            }
            name="maxGuest"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("noOfBeds")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={newRoom.noOfBeds}
            onChange={(e) =>
              setNewRoom({ ...newRoom, noOfBeds: parseInt(e.target.value) })
            }
            name="noOfBeds"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("pricePerNight")}</label>
          <input
            type="number"
            min={0}
            className="form-control"
            value={newRoom.pricePerNight}
            onChange={(e) =>
              setNewRoom({
                ...newRoom,
                pricePerNight: e.target.value,
              })
            }
            name="pricePerNight"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("noOfRooms")}</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={newRoom.noOfRooms}
            onChange={(e) =>
              setNewRoom({ ...newRoom, noOfRooms: parseInt(e.target.value) })
            }
            name="noOfRooms"
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
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          ) : null}
          {loading ? c("adding") : c("add")}
        </button>
      </form>
      {/* Image Modal */}
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
