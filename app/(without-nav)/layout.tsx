import { inter } from "../ui/fonts";

export default function WithoutNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.className} w-screen h-screen bg-linear-to-br to-primary-dark from-primary-light flex items-center justify-center`}
    >
      {children}
    </div>
  );
}
