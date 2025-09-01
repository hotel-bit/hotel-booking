"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const RoomTypesContext = createContext();

export const useRoomTypes = () => useContext(RoomTypesContext);

export const RoomTypesProvider = ({ children }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch("/api/fetchTable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableName: "roomTypes" }),
        });
        if (!res.ok) throw new Error("Failed to fetch roomTypes");
        const data = await res.json();
        setRoomTypes(data);
      } catch (err) {
        console.error("Failed to fetch roomTypes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  return (
    <RoomTypesContext.Provider value={{ roomTypes, setRoomTypes, loading }}>
      {children}
    </RoomTypesContext.Provider>
  );
};
