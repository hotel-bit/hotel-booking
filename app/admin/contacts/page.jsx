"use client";
import React, { useState, useContext, useEffect, use } from "react";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
//import { Context } from "@/providers/ContextProvider";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";

export default function ContactsPage({ params }) {
  const { lang } = use(params);
  //  const { contacts } = useContext(Context);
  const contacts = [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [sortColumn, setSortColumn] = useState({
    path: "name",
    order: "asc",
  });

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, contacts.length);

  const messages = filteredMessages.length > 0 ? filteredMessages : contacts;
  messages.sort((a, b) => {
    const valueA = a[sortColumn.path];
    const valueB = b[sortColumn.path];
    const comparison =
      sortColumn.path === "timestamp"
        ? valueA.toDate() - valueB.toDate()
        : valueA.localeCompare(valueB);
    return sortColumn.order === "asc" ? comparison : -comparison;
  });

  const currentMessages = messages.slice(startPageIndex, endPageIndex);

  const messagesContent = {
    en: {
      deleteConfirm: "Are you sure you want to delete this message?",
      deleteSuccess: "Message deleted successfully.",
      noMessagesFound: "No messages found.",
    },
    ar: {
      deleteConfirm: "هل أنت متأكد أنك تريد حذف هذه الرسالة؟",
      deleteSuccess: "تم حذف الرسالة بنجاح.",
      noMessagesFound: "لم يتم العثور على رسائل.",
    },
  };

  const labels = {
    en: {
      title: "Contacts",
      searchPlaceholder: "Search by name",
      table: {
        name: "Name",
        email: "Email",
        message: "Message",
        timestamp: "Date & Time",
        action: "Action",
      },
      noMessages: "No Messages",
    },
    ar: {
      title: "جهات الاتصال",
      searchPlaceholder: "ابحث بالاسم",
      table: {
        name: "الاسم",
        email: "البريد الإلكتروني",
        message: "الرسالة",
        timestamp: "التاريخ والوقت",
        action: "الإجراء",
      },
      noMessages: "لا توجد رسائل",
    },
  };

  const t = labels[lang] || labels.en;
  const c = messagesContent[lang] || messagesContent.en;

  const deleteMessage = async (id) => {
    const confirm = window.confirm(c.deleteConfirm);
    if (confirm) {
      if (currentMessages.length === 1 && contacts.length > 20) {
        setcurrentPageIndex(currentPageIndex - 1);
      }
      await deleteDoc(doc(db, "contacts", id));
      toast.success(c.deleteSuccess);
    }
  };

  const filterMessagesByName = (e) => {
    e.preventDefault();
    const filtered = contacts.filter((message) =>
      message.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (filtered.length > 0) {
      setFilteredMessages(filtered);
      setcurrentPageIndex(1);
    } else {
      toast(c.noMessagesFound);
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

  const unreadMessages = contacts.filter((contact) => contact.read === false);

  useEffect(() => {
    const readMessages = async () => {
      try {
        const updatePromises = unreadMessages.map((message) => {
          const messageRef = doc(db, "contacts", message.id);
          return updateDoc(messageRef, { read: true });
        });
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error updating messages read status:", error);
      }
    };
    readMessages();
  }, []);

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
      <h4 className="mb-5">{t.title}</h4>
      {contacts.length > 0 ? (
        <>
          <form
            onSubmit={filterMessagesByName}
            className="w-md-75 mb-5 position-relative"
          >
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              className="form-control"
              style={{
                height: "50px",
                paddingRight: lang === "en" ? "80px" : undefined,
                paddingLeft: lang === "ar" ? "80px" : undefined,
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
                right: lang === "en" ? "8px" : "auto",
                left: lang === "ar" ? "8px" : "auto",
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
                <tr>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <h6>
                      {t.table.name} {getSortIcon("name")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <h6>
                      {t.table.email} {getSortIcon("email")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("message")}
                  >
                    <h6>
                      {t.table.message} {getSortIcon("message")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("timestamp")}
                  >
                    <h6>
                      {t.table.timestamp} {getSortIcon("timestamp")}
                    </h6>
                  </th>
                  <th className="text-secondary">
                    <h6>{t.table.action}</h6>
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
                      {message.timestamp.toDate().toLocaleString("en-US", {
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
          {contacts.length > 20 && (
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
        <h6 className="text-center my-5">{t.noMessages}</h6>
      )}
    </div>
  );
}
