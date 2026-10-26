import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = "/bioflex-profitability";

export const metadata: Metadata = {
  title: "Bioflex ROI | Rentabilité de votre boîtier E85",
  description: "Suivez les économies et l'amortissement de vos boîtiers Bioflex E85.",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { url: `${basePath}/app-icon.svg`, sizes: "any", type: "image/svg+xml" },
    ],
    apple: `${basePath}/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bioflex ROI",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#278c67",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
