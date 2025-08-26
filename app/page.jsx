import { useTranslations, useLocale } from "next-intl";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <h1>
      {t("welcome")} {locale}
    </h1>
  );
}
