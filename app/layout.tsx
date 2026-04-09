import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./ui/fonts";
import { getUser } from "@/lib/getUser";
import { AuthProvider } from "@/context/authcontext";

export const metadata: Metadata = {
  title: "Jiffy Gigs",
  description:
    "A platform for finding and offering micro-jobs within university communities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`bg-neutral-light ${inter.className}`}>
        <AuthProvider serverUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
