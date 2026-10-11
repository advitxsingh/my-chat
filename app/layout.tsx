import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";

export const metadata: Metadata = {
  title: "MyChat",
  description: "Minimalist, fast AI chat interface powered by Gemini",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%22><text y=%2222%22 font-size=%2220%22 fill=%22%23ffffff%22 font-family=%22sans-serif%22 font-weight=%22bold%22>M</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-white antialiased min-h-screen selection:bg-neutral-800 selection:text-white">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
