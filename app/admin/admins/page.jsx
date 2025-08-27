"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";

export default function AdminsPage() {
  const locale = useLocale();
  const router = useRouter();
  const admins = [];

  const PRIMARY_ADMIN_UID = "trGMbIRionW4fKEXIHl5lmjmWqv1";

  const primaryAdmin = admins.find((admin) => admin.id === PRIMARY_ADMIN_UID);

  const filteredAdmins = admins.filter(
    (admin) => admin.id !== PRIMARY_ADMIN_UID
  );

  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return a.createdAt.toMillis() - b.createdAt.toMillis();
    }
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return 0;
  });

  const content = {
    en: {
      title: "Admins",
      add: "Add",
      removeConfirm: (name) =>
        `Are you sure you want to remove admin "${name}"?`,
      remove: "Remove",
      noAdmins: "No Admins",
      createdAt: "Created At",
      name: "Name",
      email: "Email",
      removedSuccess: "Admin removed successfully",
      removedError: "Failed to remove admin",
    },
    ar: {
      title: "المسؤولون",
      add: "إضافة",
      removeConfirm: (name) => `هل أنت متأكد أنك تريد إزالة المسؤول "${name}"؟`,
      remove: "إزالة",
      noAdmins: "لا يوجد مسؤولون",
      createdAt: "تاريخ الإنشاء",
      name: "الاسم",
      email: "البريد الإلكتروني",
      removedSuccess: "تمت إزالة المسؤول بنجاح",
      removedError: "فشل في إزالة المسؤول",
    },
  };

  const t = content[locale] || content.en;

  const handleRemoveAdmin = async (uid, adminName) => {
    const confirmed = window.confirm(t.removeConfirm(adminName));
    if (!confirmed) return;

    try {
      const res = await fetch("/api/remove-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t.removedSuccess);
      } else {
        toast.error(data.error || t.removedError);
      }
    } catch (err) {
      console.error(err);
      toast.error(t.removedError);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t.title}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px", cursor: "pointer" }}
          onClick={() => router.push(`/admin/add-admin`)}
        >
          {t.add}
        </div>
      </div>

      {admins.length > 0 ? (
        <div className="table-responsive">
          <table
            className="table table-striped table-bordered"
            style={{ whiteSpace: "nowrap" }}
          >
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>{t.name}</th>
                <th>{t.email}</th>
                <th>{t.createdAt}</th>
                <th>{t.remove}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>*</td>
                <td>{primaryAdmin.name}</td>
                <td>{primaryAdmin.email}</td>
                <td>
                  {primaryAdmin.createdAt
                    ? primaryAdmin.createdAt.toDate().toLocaleString()
                    : "—"}
                </td>
              </tr>
              {sortedAdmins.map((admin, index) => {
                const isPrimary = admin.id === PRIMARY_ADMIN_UID;
                return (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>
                      {admin.createdAt
                        ? admin.createdAt.toDate().toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {/*{user?.uid === PRIMARY_ADMIN_UID && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleRemoveAdmin(admin.id, admin.name)
                          }
                        >
                          {t.remove}
                        </button>
                      )}*/}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <h5 className="text-center my-5">{t.noAdmins}</h5>
      )}
    </div>
  );
}
