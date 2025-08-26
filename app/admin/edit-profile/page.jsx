"use client";
import React, { useContext, useState, useEffect, use } from "react";
import { Context } from "@/providers/ContextProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import useAuth from "@/hooks/UseAuth";
import { toast } from "react-toastify";

export default function EditProfile({ params }) {
  const { lang } = use(params);
  const { user } = useAuth();
  const { profileData } = useContext(Context);
  const [currentData, setCurrentData] = useState({ name: "" });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: "Edit Profile",
      name: "Name",
      save: "Save Changes",
      saving: "Saving",
      success: "Changes saved successfully",
      noChanges: "No changes detected",
    },
    ar: {
      title: "تعديل الملف الشخصي",
      name: "الاسم",
      save: "حفظ التغييرات",
      saving: "جاري الحفظ",
      success: "تم حفظ التغييرات بنجاح",
      noChanges: "لم يتم اكتشاف أي تغييرات",
    },
  };

  const t = translations[lang] || translations.en;

  const dataChange = (e) => {
    const { name, value } = e.target;
    setCurrentData({ ...currentData, [name]: value });
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const hasDataChanged = originalData.name !== currentData.name;
      if (hasDataChanged) {
        const userDocRef = doc(db, "users", user?.uid);
        await updateDoc(userDocRef, { ...currentData });
        toast.success(t.success);
      } else {
        toast.info(t.noChanges);
      }
    } catch (error) {
      console.log("Failed to save changes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentData(profileData);
    setOriginalData(profileData);
  }, [profileData]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t.title}</h4>
      <form className="w-md-75" onSubmit={saveChanges}>
        <div className="row mb-5">
          <div>
            <label htmlFor="userName" className="form-label">
              {t.name}
            </label>
            <input
              type="text"
              className="form-control"
              name="name"
              id="userName"
              style={{ borderRadius: "10px" }}
              value={currentData.name}
              onChange={dataChange}
              required
            />
          </div>
        </div>
        <button
          disabled={loading}
          className="primaryButton d-inline-block"
          style={{ border: 0, borderRadius: "12px" }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {t.saving}
            </>
          ) : (
            <>{t.save}</>
          )}
        </button>
      </form>
    </div>
  );
}
