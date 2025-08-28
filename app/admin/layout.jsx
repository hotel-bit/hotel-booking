"use client";
import styles from "@/styles/admin.module.css";
import React, { useState, useEffect } from "react";
import { useMessages } from "@/contexts/MessagesContext";
import { use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ArrowDropDownSharpIcon from "@mui/icons-material/ArrowDropDownSharp";
import ArrowDropUpSharpIcon from "@mui/icons-material/ArrowDropUpSharp";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import NightShelterOutlinedIcon from "@mui/icons-material/NightShelterOutlined";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

import Loading from "@/components/Loading";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AdminAccount({ children }) {
  const locale = useLocale();
  const router = useRouter();
  const { unreadMessages } = useMessages();
  const pathName = usePathname();
  //  const { loading, user, isAdmin } = useAuth();
  const [showSettingDropdown, setShowSettingDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      //  await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const toggleSettingDropdown = () => {
    setShowSettingDropdown(!showSettingDropdown);
  };

  const t = useTranslations("layout");

  //  useEffect(() => {
  //    if (!loading && (!user || !isAdmin)) {
  //      router.push(`/login`);
  //    }
  //  }, [loading, user, isAdmin]);

  //  if (loading) {
  //    return <Loading />;
  //  }

  //  return user && isAdmin ? (

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Link href="/" className="d-none d-lg-flex">
          <img src="/logo.png" alt="logo" style={{ width: "50px" }} />
        </Link>

        <MenuOpenRoundedIcon
          style={{ width: "56px", height: "56px", cursor: "pointer" }}
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasMenu"
          className={`${styles.menuIcon} d-lg-none`}
        />

        <div className="d-flex align-items-center">
          <LanguageSwitcher locale={locale} className="w-100" />
        </div>
      </div>
      <div className="d-flex bg-light">
        <div
          className={`offcanvas-lg offcanvas-${
            locale === "ar" ? "end" : "start"
          }`}
          tabIndex="-1"
          id="offcanvasMenu"
          aria-labelledby="offcanvasMenuLabel"
        >
          <div className="offcanvas-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasMenu"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <div
              className="navigation bg-white p-3"
              style={{
                position: "fixed",
                top: "91.38px",
                bottom: 0,
                overflowY: "auto",
              }}
            >
              <div data-bs-dismiss="offcanvas" data-bs-target="#offcanvasMenu">
                <Link
                  className={`${styles["account-nav-item"]} mb-1 mb-xl-2 ${
                    pathName === `/admin/hotels` ? styles["active-route"] : ""
                  }`}
                  href={`/admin/hotels`}
                >
                  <NightShelterOutlinedIcon />
                  <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                    {t("hotels")}
                  </h5>
                </Link>
              </div>
              <div data-bs-dismiss="offcanvas" data-bs-target="#offcanvasMenu">
                <Link
                  className={`${styles["account-nav-item"]} mb-1 mb-xl-2 ${
                    pathName === `/admin/articles` ? styles["active-route"] : ""
                  }`}
                  href={`/admin/articles`}
                >
                  <ArticleOutlinedIcon />
                  <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                    {t("articles")}
                  </h5>
                </Link>
              </div>
              <div
                data-bs-dismiss="offcanvas"
                data-bs-target="#offcanvasMenu"
                style={{ position: "relative" }}
              >
                <Link
                  className={`${styles["account-nav-item"]} mb-1 mb-xl-2 ${
                    pathName === `/admin/contacts` ? styles["active-route"] : ""
                  }`}
                  href={`/admin/contacts`}
                >
                  <ContactsOutlinedIcon />
                  <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                    {t("contacts")}
                  </h5>
                  {unreadMessages > 0 && (
                    <div
                      className="badge rounded-pill bg-danger"
                      style={{ position: "absolute", top: 17, right: 53 }}
                    >
                      {unreadMessages}
                    </div>
                  )}
                </Link>
              </div>
              <div data-bs-dismiss="offcanvas" data-bs-target="#offcanvasMenu">
                <Link
                  className={`${styles["account-nav-item"]} mb-1 mb-xl-2 ${
                    pathName === `/admin/admins` ? styles["active-route"] : ""
                  }`}
                  href={`/admin/admins`}
                >
                  <SupervisorAccountIcon />
                  <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                    {t("admins")}
                  </h5>
                </Link>
              </div>
              <div
                className={`${styles["account-nav-item"]} mb-1 mb-xl-2 cursor-pointer`}
                onClick={toggleSettingDropdown}
              >
                <SettingsOutlinedIcon />
                <h5
                  className={`m-0 ${locale === "en" ? "ms-3" : "me-3"} ${
                    locale === "en" ? "me-5" : "ms-5"
                  }`}
                >
                  {t("settings")}
                </h5>
                {showSettingDropdown === false ? (
                  <ArrowDropDownSharpIcon />
                ) : (
                  <ArrowDropUpSharpIcon />
                )}
              </div>
              <div>
                {showSettingDropdown && (
                  <div style={{ paddingLeft: "40px" }}>
                    <div
                      data-bs-dismiss="offcanvas"
                      data-bs-target="#offcanvasMenu"
                    >
                      <Link
                        className={`${
                          styles["account-nav-item"]
                        } mb-1 mb-xl-2 ${
                          pathName === `/admin/profile`
                            ? styles["active-route"]
                            : ""
                        }`}
                        href={`/admin/profile`}
                        style={{ fontWeight: "500" }}
                      >
                        {t("profile")}
                      </Link>
                    </div>
                    <div
                      data-bs-dismiss="offcanvas"
                      data-bs-target="#offcanvasMenu"
                    >
                      <Link
                        className={`${
                          styles["account-nav-item"]
                        } mb-1 mb-xl-2 ${
                          pathName === `/admin/change-password`
                            ? styles["active-route"]
                            : ""
                        }`}
                        href={`/admin/change-password`}
                        style={{ fontWeight: "500" }}
                      >
                        {t("password")}
                      </Link>
                    </div>
                    <div
                      data-bs-dismiss="offcanvas"
                      data-bs-target="#offcanvasMenu"
                    >
                      <Link
                        className={`${
                          styles["account-nav-item"]
                        } mb-1 mb-xl-2 ${
                          pathName === `/admin/change-email`
                            ? styles["active-route"]
                            : ""
                        }`}
                        href={`/admin/change-email`}
                        style={{ fontWeight: "500" }}
                      >
                        {t("email")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`${styles["sign-out"]} ${styles["account-nav-item"]} mt-5 cursor-pointer`}
                onClick={handleLogout}
                data-bs-dismiss="offcanvas"
                data-bs-target="#offcanvasMenu"
              >
                <LogoutOutlinedIcon />
                <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                  {t("signOut")}
                </h5>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-3 ${styles["account-child-container"]}`}>
          {children}
        </div>
      </div>
    </>
  );

  //  ) : (
  //    <Loading />
  //  );
}
