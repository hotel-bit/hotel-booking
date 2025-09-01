"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ViewsContext = createContext();

export const useViews = () => useContext(ViewsContext);

export const ViewsProvider = ({ children }) => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch("/api/fetchTable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableName: "views" }),
        });
        if (!res.ok) throw new Error("Failed to fetch views");
        const data = await res.json();
        setViews(data);
      } catch (err) {
        console.error("Failed to fetch views:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchViews();
  }, []);

  return (
    <ViewsContext.Provider value={{ views, setViews, loading }}>
      {children}
    </ViewsContext.Provider>
  );
};
