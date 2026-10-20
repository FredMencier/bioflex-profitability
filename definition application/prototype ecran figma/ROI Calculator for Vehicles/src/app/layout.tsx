import type { Metadata } from "next";
import "./globals.css";

const basePath = "/bioflex-profitability";

export const metadata: Metadata = {
  title: "Bioflex ROI | Rentabilité de votre boîtier E85",
  description: "Suivez les économies et l'amortissement de vos boîtiers Bioflex E85.",
  manifest: `${basePath}/manifest.webmanifest`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
