"use client";
import React, { useState, useMemo, useEffect, use } from "react";
import { useCities } from "@/contexts/CitiesContext";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useTranslations, useLocale } from "next-intl";
import Cropper from "react-easy-crop";

import Loading from "@/components/Loading";

export default function EditCity({ params }) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations("editCity");
  const c = useTranslations("common");
  const { cities, setCities } = useCities();
  const router = useRouter();
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(null);
  const [newImage, setNewImage] = useState(null);
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
        setNewImage(croppedImageFile);
        setCity((prev) => ({
          ...prev,
          image: null,
        }));
      });
    document.getElementById("closeModal").click();
  };

  const handleChange = (field, value) => {
    setCity((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return;
    try {
      setLoading(true);

      let imageUrl = city.image;

      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("id", city.id);
        formData.append("bucket", "zahid-city-images");

        const res = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        imageUrl = data.url;
      }

      const cityData = {
        ...city,
        image: imageUrl,
        tableName: "cities",
      };

      const cityRes = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityData),
      });

      if (!cityRes.ok) throw new Error("Failed to update city");

      toast.success(t("success"));
      setNewImage(null);
      router.back();
    } catch (error) {
      console.log(t("error"), error);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cities.length > 0) {
      const filteredCity = cities.find((c) => c.id === id);
      if (filteredCity) {
        setCity(filteredCity);
      } else {
        toast.error("City not found.");
      }
    }
  }, [id, cities]);

  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  if (!city) {
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
      <h4 className="mb-4">{t("pageTitle")}</h4>

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

      <form onSubmit={handleSubmit} className="w-md-75">
        <div className="mb-4">
          <label className="form-label mb-3">{t("image")}</label>
          {(city.image || newImage) && (
            <img
              src={city.image || URL.createObjectURL(newImage)}
              alt="img"
              style={{ width: "200px", borderRadius: "30px", display: "block" }}
              className="mb-4"
            />
          )}
          <div className="d-flex mb-3">
            <div
              className="primaryButton text-center me-2"
              onClick={() => document.getElementById("ImgInput").click()}
            >
              {city.image || newImage ? "Change" : "Add"}
            </div>
          </div>
          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            onChange={handleImgSelect}
            style={{ display: "none" }}
            className="form-control"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cityTitle" className="form-label">
            {t("title")}
          </label>
          <input
            id="cityTitle"
            type="text"
            className="form-control"
            value={city.title?.[activeLang] || ""}
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
              {t("updating")}
            </>
          ) : (
            t("update")
          )}
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
