import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";

import { NextIntlClientProvider } from "next-intl";
import RootLayoutClient from "./RootLayoutClient";

export const metadata = {
  title: "Hotel Booking Admin",
  description:
    "An admin dashboard for managing hotel bookings, reservations, and room availability.",
};

export default function RootLayout({ children }) {
  return (
    <NextIntlClientProvider>
      <RootLayoutClient>{children}</RootLayoutClient>
    </NextIntlClientProvider>
  );
}
