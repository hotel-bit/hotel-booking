"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCities } from "@/contexts/CitiesContext";
import Cropper from "react-easy-crop";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function AddCity() {
  const { cities, setCities } = useCities();
  const t = useTranslations("addCity");
    const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [newCity, setNewCity] = useState({
    image: null,
    title: { en: "", ar: "" },
  });
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setcroppedAreaPixels] = useState(null);

  const handleImgSelect = (event) => {
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
        setNewCity((prev) => ({
          ...prev,
          image: croppedImageFile,
        }));
      });
    document.getElementById("closeModal").click();
  };

  const handleChange = (field, value) => {
    setNewCity((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: value,
      },
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      if (!newCity.image) {
        toast.error(t("addImage"));
        return;
      }

      setLoading(true);

      const formData = new FormData();
      const storageId = nanoid();
      formData.append("file", newCity.image);
      formData.append("id", storageId);
      formData.append("bucket", "zahid-city-images");

      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const imageURL = data.url;

      const timestamp = new Date().toISOString();

      const cityData = {
        ...newCity,
        image: imageURL,
        id: storageId,
        timestamp,
        tableName: "cities",
      };

      const cityRes = await fetch("/api/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityData),
      });

      if (!cityRes.ok) throw new Error("Failed to save city");

      toast.success(t("success"));

      setCities((prev) => [cityData, ...prev]);
      setNewCity({
        image: null,
        title: { en: "", ar: "" },
      });
      router.back();
    } catch (error) {
      console.error("Failed to add city:", error);
      toast.error(t("failed"));
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

  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

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
      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {c("langSelect")}
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
      <div className="mb-4">
        <label className="form-label mb-3">{t("image")}</label>
        {newCity.image && (
          <img
            src={URL.createObjectURL(newCity.image)}
            alt="city image"
            style={{ width: "200px", borderRadius: "30px", display: "block" }}
            className="mb-4"
          />
        )}
        <div className="d-flex mb-3">
          <div
            className="primaryButton text-center me-2"
            onClick={() => document.getElementById("ImgInput").click()}
          >
            {newCity.image ? t("change") : t("add")}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImgSelect}
          style={{ display: "none" }}
          id="ImgInput"
        />
      </div>
      <form onSubmit={handleAdd} className="w-md-75">
        <div className="mb-4">
          <label htmlFor="cityTitle" className="form-label">
            {t("title")}
          </label>
          <input
            id="cityTitle"
            type="text"
            className="form-control"
            value={newCity.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
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
              {t("adding")}
            </>
          ) : (
            t("add")
          )}
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
                  aspect={1}
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
