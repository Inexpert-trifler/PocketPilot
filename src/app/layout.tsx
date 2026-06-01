import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PocketPilot | Smart Finance for GenZ",
  description: "AI-powered finance platform to manage expenses, track subscriptions, and achieve savings goals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PocketPilot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <html lang="en" className={`dark ${outfit.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );

  if (hasClerkKey) {
    return (
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: '#a855f7',
            colorBackground: '#0a0a0a',
            colorText: '#ffffff',
            colorTextSecondary: '#a3a3a3',
            colorInputBackground: '#171717',
            colorInputText: '#ffffff',
            colorBorder: 'rgba(255,255,255,0.08)'
          }
        }}
      >
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
