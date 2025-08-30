"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const MessagesContext = createContext();

export const useMessages = () => useContext(MessagesContext);

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/fetchTable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableName: "contactMessages" }),
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const unreadMessages = messages.filter((msg) => !msg.read).length;

  return (
    <MessagesContext.Provider
      value={{ messages, setMessages, loading, unreadMessages }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
