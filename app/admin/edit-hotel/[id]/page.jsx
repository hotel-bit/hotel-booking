"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useHotels } from "@/contexts/HotelsContext";
import { useCities } from "@/contexts/CitiesContext";
import Cropper from "react-easy-crop";
import { nanoid } from "nanoid";

import Loading from "@/components/Loading";

export default function EditHotel() {
  const locale = useLocale();
  const router = useRouter();
  const { id } = useParams();
  const t = useTranslations("editHotel");
  const c = useTranslations("common");
  const a = useTranslations("addHotel");
  const { cities } = useCities();
  const { hotels, setHotels } = useHotels();

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [originalHotel, setOriginalHotel] = useState(null);
  const [hotel, setHotel] = useState({
    title: { en: "", ar: "" },
    address: { en: "", ar: "" },
    images: [],
    services: { en: [], ar: [] },
    rooms: [],
    terms: { en: "", ar: "" },
    brief: { en: "", ar: "" },
    city: { id: "", en: "", ar: "" },
  });

  const briefEditor = useRef(null);
  const termsEditor = useRef(null);

  const config = useMemo(
    () => ({
      height: 300,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder: activeLang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

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
          const croppedImageFile = new File([blob], "hotel-image", {
            type: "image/jpeg",
          });
          setHotel((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                file: croppedImageFile,
                preview: croppedDataURL,
              },
            ],
          }));
        });
    };
    document.getElementById("closeModal").click();
  };

  const handleChange = (field, value) => {
    if (field === "title" && value.includes("_")) {
      setError(c("noUnderscores"));
      return;
    } else {
      setError("");
    }
    if (["title", "address", "terms", "brief"].includes(field)) {
      setHotel((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setHotel((prev) => ({ ...prev, [field]: value }));
    }
  };

  const removeImage = (index) => {
    setHotel((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleService = (serviceEn, serviceAr) => {
    setHotel((prev) => {
      const alreadySelected = prev.services.en.includes(serviceEn);
      return {
        ...prev,
        services: {
          en: alreadySelected
            ? prev.services.en.filter((s) => s !== serviceEn)
            : [...prev.services.en, serviceEn],
          ar: alreadySelected
            ? prev.services.ar.filter((s) => s !== serviceAr)
            : [...prev.services.ar, serviceAr],
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (hotel.images.length === 0) {
        toast.error(a("addImages"));
        return;
      }
      setLoading(true);

      const uploaded = [];
      for (const img of hotel.images) {
        if (img.url) {
          uploaded.push(img);
          continue;
        }
        const formData = new FormData();
        const imgId = nanoid();
        const path = `${id}/main/${imgId}`;
        formData.append("file", img.file);
        formData.append("id", path);
        formData.append("bucket", "zahid-hotel-images");

        const res = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        uploaded.push({ url: data.url, path });
      }

      const removedImages = originalHotel.images.filter(
        (oldImg) => !uploaded.some((newImg) => newImg.path === oldImg.path)
      );
      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map((img) =>
            fetch("/api/image", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: img.path,
                bucket: "zahid-hotel-images",
              }),
            }).catch((err) =>
              console.warn(
                "Failed to delete image from storage:",
                img.path,
                err
              )
            )
          )
        );
      }

      const updatedHotel = {
        ...hotel,
        images: uploaded,
        tableName: "hotels",
        id: hotel.id,
      };

      const res = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHotel),
      });

      if (!res.ok) throw new Error("Failed to update hotel");

      setHotels((prev) =>
        prev.map((h) => (h.id === hotel.id ? updatedHotel : h))
      );

      toast.success(t("success"));
      router.back();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(t("failed"));
    } finally {
      setLoading(false);
    }
  };

  const availableServices = {
    en: [
      "Free WiFi",
      "Parking",
      "Pool",
      "Gym",
      "Breakfast included",
      "Airport shuttle",
      "Pet-friendly",
      "Restaurant",
      "Bar",
      "Room service",
      "Spa",
      "Laundry service",
      "24-hour front desk",
      "Air conditioning",
      "Business center",
      "Concierge service",
      "Wheelchair accessible",
      "Sauna",
      "Hot tub",
      "Conference rooms",
    ],
    ar: [
      "واي فاي مجاني",
      "موقف سيارات",
      "مسبح",
      "نادي رياضي",
      "إفطار مشمول",
      "خدمة نقل من وإلى المطار",
      "مسموح بالحيوانات الأليفة",
      "مطعم",
      "بار",
      "خدمة الغرف",
      "سبا",
      "خدمة غسيل الملابس",
      "مكتب استقبال على مدار 24 ساعة",
      "تكييف هواء",
      "مركز أعمال",
      "خدمة الكونسيرج",
      "مناسب لذوي الاحتياجات الخاصة",
      "ساونا",
      "جاكوزي",
      "غرف اجتماعات",
    ],
  };

  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

  useEffect(() => {
    if (hotels.length > 0) {
      const filteredHotel = hotels.find((h) => h.id === id);
      if (filteredHotel) {
        setHotel(filteredHotel);
        setOriginalHotel(filteredHotel);
      } else {
        toast.error("Hotel not found.");
      }
    }
  }, [id, hotels]);

  useEffect(() => {
    const modal = document.getElementById("Modal");
    if (modal) {
      modal.addEventListener("hidden.bs.modal", () => {
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setCroppedAreaPixels(null);
        setImgUrl("");
      });
    }
  }, []);

  if (!originalHotel) {
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
      <h4 className="mb-5">{t("pageTitle")}</h4>

      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label className="form-label fw-bold">{c("langSelect")}</label>
        <select
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
          <label className="form-label fw-bold mb-3">{a("images")}</label>
          <div className="d-flex flex-wrap gap-3 mb-3">
            {hotel.images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={img.url || img.preview}
                  alt="preview"
                  style={{
                    width: 120,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => removeImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="primaryButton border-0"
            style={{ borderRadius: "12px" }}
            onClick={() => document.getElementById("ImgInput").click()}
          >
            {c("add")}
          </button>

          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImgSelect}
            style={{ display: "none" }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{a("title")}</label>
          <input
            type="text"
            className="form-control"
            value={hotel.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
          {error && <div className="form-text text-danger">{error}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{a("city")}</label>
          <select
            className="form-select"
            value={hotel.city.id}
            onChange={(e) => {
              const cityId = e.target.value;
              const selectedCity = cities.find((c) => c.id === cityId);
              setHotel((prev) => ({
                ...prev,
                city: {
                  id: selectedCity.id,
                  en: selectedCity.title.en,
                  ar: selectedCity.title.ar,
                },
              }));
            }}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          >
            <option defaultValue="">{a("selectCity")}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.title[activeLang]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{a("address")}</label>
          <input
            type="text"
            className="form-control"
            value={hotel.address[activeLang]}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{a("brief")}</label>
          <JoditEditor
            ref={briefEditor}
            config={config}
            value={hotel.brief[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => handleChange("brief", newContent)}
            onChange={() => {}}
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-bold">{a("services")}</label>
          <div className="row">
            {availableServices.en.map((srv, i) => (
              <div key={srv} className="col-12 col-sm-6 col-md-4 col-xl-3 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id={`srv-${srv}`}
                    className="form-check-input"
                    checked={hotel.services.en.includes(srv)}
                    onChange={() => toggleService(srv, availableServices.ar[i])}
                  />
                  <label htmlFor={`srv-${srv}`} className="form-check-label">
                    {activeLang === "en" ? srv : availableServices.ar[i]}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="form-label fw-bold">{a("terms")}</label>
          <JoditEditor
            ref={termsEditor}
            config={config}
            value={hotel.terms[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => handleChange("terms", newContent)}
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
                  locale === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {c("updating")}
            </>
          ) : (
            c("update")
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
                  aspect={16 / 9}
                  cropShape="rect"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(croppedArea, croppedAreaPixels) =>
                    setCroppedAreaPixels(croppedAreaPixels)
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
