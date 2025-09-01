"use client";
import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useViews } from "@/contexts/ViewsContext";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

export default function RoomViews() {
  const locale = useLocale();
  const t = useTranslations("roomViews");
  const c = useTranslations("common");
  const { views, setViews, loading: dataLoading } = useViews();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [sortColumn, setSortColumn] = useState({
    path: "en",
    order: "asc",
  });
  const [newView, setNewView] = useState({ en: "", ar: "" });
  const [editingView, setEditingView] = useState(null);

  const sortedViews = [...views].sort((a, b) => {
    const valueA = (a.title?.[sortColumn.path] || "").toLowerCase();
    const valueB = (b.title?.[sortColumn.path] || "").toLowerCase();

    if (valueA < valueB) return sortColumn.order === "asc" ? -1 : 1;
    if (valueA > valueB) return sortColumn.order === "asc" ? 1 : -1;
    return 0;
  });

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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const id = nanoid();
      const viewData = {
        id,
        title: { ...newView },
        tableName: "views",
      };

      const res = await fetch("/api/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viewData),
      });

      if (!res.ok) throw new Error("Failed to save room view");

      const updated = [...views, { id, title: { ...newView } }];
      setViews(updated);
      toast.success(c("saveSuccess"));
      setNewView({ en: "", ar: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setDeletingIds((prev) => [...prev, id]);

    try {
      const res = await fetch("/api/deleteItem", {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ tableName: "views", id }),
      });

      if (!res.ok) throw new Error("Failed to delete room view");

      setViews(views.filter((view) => view.id !== id));
      toast.success(c("deleteSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setDeletingIds((prev) => prev.filter((did) => did !== id));
    }
  };

  const handleEditSave = async (id, updatedTitle) => {
    if (!editingView) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: "views",
          id: editingView.id,
          title: editingView.title,
        }),
      });
      if (!res.ok) throw new Error("Failed to update room view");

      setViews(
        views.map((v) =>
          v.id === editingView.id ? { ...v, title: editingView.title } : v
        )
      );
      toast.success(c("saveSuccess"));
      setEditingView(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
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
      <h4 className="mb-4">{t("pageTitle")}</h4>

      <form
        onSubmit={handleAdd}
        className="mb-3 d-flex gap-2 flex-wrap w-md-75"
      >
        <input
          type="text"
          placeholder={c("englishTitle")}
          value={newView.en}
          onChange={(e) => setNewView({ ...newView, en: e.target.value })}
          dir="ltr"
          className="form-control"
          required
        />
        <input
          type="text"
          placeholder={c("arabicTitle")}
          value={newView.ar}
          onChange={(e) => setNewView({ ...newView, ar: e.target.value })}
          className="form-control"
          required
        />
        <button
          type="submit"
          className="primaryButton border-0 rounded"
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

      {dataLoading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : views.length > 0 ? (
        <div className="table-responsive w-md-75">
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr style={{ userSelect: "none" }}>
                <th>#</th>
                <th onClick={() => handleSort("en")} className="cursor-pointer">
                  {c("english")} {getSortIcon("en")}
                </th>
                <th onClick={() => handleSort("ar")} className="cursor-pointer">
                  {c("arabic")} {getSortIcon("ar")}
                </th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedViews.map((view, index) => (
                <tr key={view.id}>
                  <td>{index + 1}</td>
                  <td>{view.title.en}</td>
                  <td>{view.title.ar}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditingView({ ...view })}
                    >
                      {c("edit")}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(view.id)}
                      disabled={deletingIds.includes(view.id)}
                    >
                      {deletingIds.includes(view.id) ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        c("delete")
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <h6 className="text-center my-5">{t("noViews")}</h6>
      )}
      {/* Modal */}
      {editingView && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{c("edit")}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingView(null)}
                ></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSave();
                }}
              >
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={editingView.title.en}
                    onChange={(e) =>
                      setEditingView({
                        ...editingView,
                        title: { ...editingView.title, en: e.target.value },
                      })
                    }
                    placeholder={c("englishTitle")}
                    required
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={editingView.title.ar}
                    onChange={(e) =>
                      setEditingView({
                        ...editingView,
                        title: { ...editingView.title, ar: e.target.value },
                      })
                    }
                    placeholder={c("arabicTitle")}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingView(null)}
                  >
                    {c("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={updating}
                  >
                    {updating ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      c("save")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
