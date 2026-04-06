import { SideNav } from "@/app/ui/nav";

export default function SideNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full h-full flex items-center pt-22">
      <SideNav />
      {children}
    </main>
  );
}
