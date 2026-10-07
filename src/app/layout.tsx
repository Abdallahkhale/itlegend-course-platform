import type { Metadata } from "next";
import localFont from "next/font/local";
import { withBasePath } from "@/lib/paths";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/poppins-700.woff2", weight: "700", style: "normal" },
  ], variable: "--font-poppins", display: "swap", preload: false,
});
const spartan = localFont({ src: "../../public/fonts/spartan-variable.woff2", weight: "100 900", variable: "--font-spartan", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Courses | IT Legend", template: "%s | IT Legend" },
  description: "Learn at your own pace. Explore courses, watch lessons, use course materials, and track your progress.",
  icons: { icon: withBasePath("/favicon.svg") },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${spartan.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
