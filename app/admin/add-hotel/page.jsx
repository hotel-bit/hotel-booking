"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function AddHotel() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("addHotel");
  const c = useTranslations("common");

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newHotel, setNewHotel] = useState({
    title: { en: "", ar: "" },
    address: { en: "", ar: "" },
    images: [],
    services: { en: [], ar: [] },
    rooms: [],
    terms: { en: "", ar: "" },
    brief: { en: "", ar: "" },
    city: { en: "", ar: "" },
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

  const handleChange = (field, value) => {
    if (field === "title" && value.includes("_")) {
      setError(c("noUnderscores"));
      return;
    } else {
      setError("");
    }

    if (["title", "address", "terms", "brief"].includes(field)) {
      setNewHotel((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setNewHotel((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewHotel((prev) => ({
      ...prev,
      images: [...prev.images, ...mapped],
    }));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setNewHotel((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleService = (lang, service) => {
    setNewHotel((prev) => {
      const alreadySelected = prev.services[lang].includes(service);
      return {
        ...prev,
        services: {
          ...prev.services,
          [lang]: alreadySelected
            ? prev.services[lang].filter((s) => s !== service)
            : [...prev.services[lang], service],
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (newHotel.images.length === 0) {
        toast.error(t("addImages"));
        return;
      }

      setLoading(true);

      const hotelId = nanoid();
      const uploaded = [];

      for (const img of newHotel.images) {
        const formData = new FormData();
        const imgId = nanoid();
        const path = `${hotelId}/main/${imgId}`;
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

      const timestamp = new Date().toISOString();

      const hotelData = {
        ...newHotel,
        images: uploaded,
        id: hotelId,
        timestamp,
        tableName: "hotels",
      };

      const hotelRes = await fetch("/api/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelData),
      });

      if (!hotelRes.ok) throw new Error("Failed to save hotel");

      toast.success(t("success"));

      setNewHotel({
        title: { en: "", ar: "" },
        address: { en: "", ar: "" },
        images: [],
        services: { en: [], ar: [] },
        rooms: [],
        terms: { en: "", ar: "" },
        brief: { en: "", ar: "" },
        city: { en: "", ar: "" },
      });
      router.back();
    } catch (error) {
      console.error("Add hotel failed:", error);
      toast.error(t("failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

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
          <label className="form-label fw-bold mb-3">{t("images")}</label>
          <div className="d-flex flex-wrap gap-3 mb-3">
            {newHotel.images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={img.preview}
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
            className="btn btn-primary"
            onClick={() => document.getElementById("ImgInput").click()}
          >
            {c("add")}
          </button>

          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            style={{ display: "none" }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{t("title")}</label>
          <input
            type="text"
            className="form-control"
            value={newHotel.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
          {error && <div className="form-text text-danger">{error}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{t("address")}</label>
          <input
            type="text"
            className="form-control"
            value={newHotel.address[activeLang]}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">{t("brief")}</label>
          <JoditEditor
            ref={briefEditor}
            config={config}
            value={newHotel.brief[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => handleChange("brief", newContent)}
            onChange={() => {}}
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-bold">{t("services")}</label>
          <div className="row">
            {availableServices[activeLang].map((srv) => (
              <div key={srv} className="col-12 col-sm-6 col-md-4 col-xl-3 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id={`${srv}-${activeLang}`}
                    className="form-check-input"
                    checked={newHotel.services[activeLang].includes(srv)}
                    onChange={() => toggleService(activeLang, srv)}
                  />
                  <label
                    htmlFor={`${srv}-${activeLang}`}
                    className="form-check-label"
                  >
                    {srv}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="form-label fw-bold">{t("terms")}</label>
          <JoditEditor
            ref={termsEditor}
            config={config}
            value={newHotel.terms[activeLang]}
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
              {c("adding")}
            </>
          ) : (
            c("add")
          )}
        </button>
      </form>
    </div>
  );
}
