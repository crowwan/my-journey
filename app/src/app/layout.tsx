import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Playfair_Display } from "next/font/google";
import { AIDrawerProvider } from "@/components/ai/AIDrawerProvider";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Journey - AI Travel Planner",
  description: "AI와 대화하며 여행 계획을 세우고, 예쁘게 보여주는 앱",
  openGraph: {
    title: "My Journey - AI Travel Planner",
    description: "AI와 대화하며 맞춤 여행 일정을 만들어보세요",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈️</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${playfairDisplay.variable} antialiased`}>
        {children}
        <AIDrawerProvider />
      </body>
    </html>
  );
}
