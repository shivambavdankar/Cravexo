import type { Metadata } from "next";
import "./globals.css";
import { AccountProvider } from "./context/AccountContext";

export const metadata: Metadata = {
  title: "Cravexo — The Future of Food Discovery",
  description: "Cravexo is an AI-powered food discovery platform. Meet Mr. Fry, your personalized AI craving companion.",
  keywords: "Cravexo, AI food discovery, food, personalized recommendations, Mr. Fry, food tech startup",
  openGraph: {
    title: "Cravexo — The Future of Food Discovery",
    description: "AI-powered food discovery. Personalized cravings, mystery picks, and a smarter way to explore food.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AccountProvider>
          {children}
        </AccountProvider>
      </body>
    </html>
  );
}
