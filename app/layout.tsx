import "./globals.css";
import Script from "next/script";
import { GA_ID } from "@/lib/gtag";

export const metadata = {
  title: "Life Sentinel",
  description: "Prepared for life. Ready for whatever comes next.",
  metadataBase: new URL("https://lifesentinelfamily.com"),
  openGraph: {
    title: "Life Sentinel",
    description: "Prepared for life. Ready for whatever comes next.",
    url: "https://lifesentinelfamily.com",
    siteName: "Life Sentinel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life Sentinel",
    description: "Prepared for life. Ready for whatever comes next.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground pointer-events-auto">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <div className="relative z-0 pointer-events-auto">{children}</div>
      </body>
    </html>
  );
}