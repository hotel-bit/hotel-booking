"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const HotelsContext = createContext();

export const useHotels = () => useContext(HotelsContext);

export const HotelsProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("/api/fetchTable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableName: "hotels" }),
        });
        if (!res.ok) throw new Error("Failed to fetch hotels");
        const data = await res.json();
        setHotels(data);
      } catch (err) {
        console.error("Failed to fetch hotels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <HotelsContext.Provider value={{ hotels, setHotels, loading }}>
      {children}
    </HotelsContext.Provider>
  );
};
