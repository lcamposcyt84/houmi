import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Houmi Store | Tu tienda de confianza",
    template: "%s | Houmi Store",
  },
  description:
    "Descubre los mejores productos en Houmi Store. Bicicletas, electrónicos, electrodomésticos y más. Envíos a todo el país. Precios en USD y Bolívares.",
  keywords: [
    "tienda online",
    "ecommerce",
    "bicicletas",
    "electrónicos",
    "electrodomésticos",
    "Venezuela",
    "USD",
    "Bolívares",
  ],
  authors: [{ name: "Houmi Store" }],
  creator: "Houmi Store",
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: "https://houmi.store",
    siteName: "Houmi Store",
    title: "Houmi Store | Tu tienda de confianza",
    description:
      "Descubre los mejores productos en Houmi Store. Bicicletas, electrónicos, electrodomésticos y más.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Houmi Store | Tu tienda de confianza",
    description:
      "Descubre los mejores productos en Houmi Store. Bicicletas, electrónicos, electrodomésticos y más.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${sora.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}





