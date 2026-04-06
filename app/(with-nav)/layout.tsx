import type { Metadata } from "next";
import Footer from "../ui/footer";
import { inter } from "../ui/fonts";
import { TopNav } from "../ui/nav";
import { getUser } from "@/lib/getUser";

export const metadata: Metadata = {
  title: "Jiffy Gigs",
  description:
    "A platform for finding and offering micro-jobs within university communities.",
};
export default async function WithNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <div className={`${inter.className}`}>
      <TopNav user={user} />
      {children}
      <Footer />
    </div>
  );
}
