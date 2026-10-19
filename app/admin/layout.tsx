import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NyayaLink — Admin Portal",
  description: "Secure Administrative Management Portal for NyayaLink Legal Services Marketplace",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[#090B10] text-slate-100 antialiased selection:bg-[#C5A059]/30">
      {children}
    </div>
  );
}
