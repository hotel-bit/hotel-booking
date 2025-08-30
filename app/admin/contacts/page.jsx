"use client";
import React, { useState, useEffect } from "react";
import { useMessages } from "@/contexts/MessagesContext";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { useTranslations, useLocale } from "next-intl";

export default function ContactsPage() {
  const locale = useLocale();
  const t = useTranslations("contacts");
  const { messages, setMessages, unreadMessages, loading } = useMessages();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [sortColumn, setSortColumn] = useState({
    path: "name",
    order: "asc",
  });

  const messagesToDisplay =
    filteredMessages.length > 0 ? filteredMessages : messages;

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, messagesToDisplay);

  messagesToDisplay.sort((a, b) => {
    const valueA = a[sortColumn.path];
    const valueB = b[sortColumn.path];
    let comparison = 0;

    if (sortColumn.path === "timestamp") {
      comparison = new Date(valueA) - new Date(valueB);
    } else {
      comparison = String(valueA).localeCompare(String(valueB));
    }

    return sortColumn.order === "asc" ? comparison : -comparison;
  });

  const currentMessages = messagesToDisplay.slice(startPageIndex, endPageIndex);

  const filterMessagesByName = (e) => {
    e.preventDefault();
    const filtered = messages.filter((message) =>
      message.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (filtered.length > 0) {
      setFilteredMessages(filtered);
      setcurrentPageIndex(1);
    } else {
      toast(t("noMessagesFound"));
    }
  };

  const handleSort = (path) => {
    if (sortColumn.path === path) {
      setSortColumn({
        ...sortColumn,
        order: sortColumn.order === "asc" ? "desc" : "asc",
      });
    } else setSortColumn({ path: path, order: "asc" });
  };

  const getSortIcon = (path) => {
    if (sortColumn.path === path) {
      return sortColumn.order === "asc" ? (
        <i className="fa fa-sort-asc text-dark"></i>
      ) : (
        <i className="fa fa-sort-desc text-dark"></i>
      );
    }
    return null;
  };

  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm(t("deleteConfirm"));
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: "contactMessages", id }),
      });

      if (!res.ok) throw new Error("Failed to delete the message");

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const markAsRead = async (id) => {
    try {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
      await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: "contactMessages",
          id: id,
          read: true,
        }),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.read) {
        markAsRead(msg.id);
      }
    });
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMessages([]);
    }
  }, [searchQuery]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t("title")}</h4>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : messages.length > 0 ? (
        <>
          <form
            onSubmit={filterMessagesByName}
            className="w-md-75 mb-5 position-relative"
          >
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="form-control"
              style={{
                height: "50px",
                paddingRight: locale === "en" ? "80px" : undefined,
                paddingLeft: locale === "ar" ? "80px" : undefined,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              className="primaryButton border-0"
              style={{
                borderRadius: "8px",
                position: "absolute",
                right: locale === "en" ? "8px" : "auto",
                left: locale === "ar" ? "8px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <IoSearch style={{ width: "20px", height: "20px" }} />
            </button>
          </form>

          <div className="table-responsive mb-5">
            <table
              className="table table-hover table-borderless"
              style={{ whiteSpace: "nowrap" }}
            >
              <thead>
                <tr style={{ userSelect: "none" }}>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <h6>
                      {t("name")} {getSortIcon("name")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <h6>
                      {t("email")} {getSortIcon("email")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("message")}
                  >
                    <h6>
                      {t("message")} {getSortIcon("message")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("timestamp")}
                  >
                    <h6>
                      {t("timestamp")} {getSortIcon("timestamp")}
                    </h6>
                  </th>
                  <th className="text-secondary">
                    <h6>{t("action")}</h6>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentMessages.map((message, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <h6>{message.name}</h6>
                      </div>
                    </td>
                    <td>{message.email}</td>
                    <td
                      style={{
                        whiteSpace: "normal",
                        minWidth: "300px",
                        width: "300px",
                      }}
                    >
                      {message.message}
                    </td>
                    <td>
                      {new Date(message.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <div
                        className="primaryButton d-inline-block py-1 px-2"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {messagesToDisplay.length > 20 && (
            <div className="d-flex justify-content-center">
              <Pagination
                count={totalPages}
                page={currentPageIndex}
                onChange={(event, page) => displayPage(page)}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      ) : (
        <h6 className="text-center my-5">{t("noMessages")}</h6>
      )}
    </div>
  );
}
