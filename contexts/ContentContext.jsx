"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [privacy, setPrivacy] = useState({
    en: { headline: "", copy: "", content: "" },
    ar: { headline: "", copy: "", content: "" },
  });
  const [terms, setTerms] = useState({
    en: { headline: "", copy: "", content: "" },
    ar: { headline: "", copy: "", content: "" },
  });

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const res = await fetch("/api/fetchItem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "privacy", tableName: "content" }),
        });

        const data = await res.json();
        setPrivacy(data);
      } catch (err) {
        console.error("Failed to fetch privacy policy:", err);
      }
    };

    fetchPrivacy();
  }, []);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch("/api/fetchItem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "terms", tableName: "content" }),
        });

        const data = await res.json();
        setTerms(data);
      } catch (err) {
        console.error("Failed to fetch terms and conditions:", err);
      }
    };

    fetchTerms();
  }, []);

  return (
    <ContentContext.Provider value={{ privacy, terms }}>
      {children}
    </ContentContext.Provider>
  );
};
