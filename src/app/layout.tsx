import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

// Archivo variable con eje de ancho: el display "respira" entre 100% y 125%
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://waveform.example"),
  title: {
    default: "WAVEFORM · Surf, skate y verano",
    template: "%s · WAVEFORM",
  },
  description: "Ropa de surf y streetwear para días largos de agua salada, ruedas y música fuerte. Nueva colección Low Tide.",
  openGraph: {
    title: "WAVEFORM",
    description: "Nueva colección Low Tide, verano 27.",
    images: ["/videos/hero-poster.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#eef0ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>
        <AppShell>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AppShell>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
