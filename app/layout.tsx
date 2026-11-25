import type { Metadata, Viewport } from "next";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wecodee.",
  description:
    "A little world for big ideas. WeCodee guides students from their first idea to building and presenting real software, one milestone at a time.",
  openGraph: {
    title: "WeCodee — Big ideas start small.",
    description:
      "From your first idea to your first real project. Learn the process. Build with confidence. Make something yours.",
    images: ["/posters/hero-end.webp"],
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "WeCodee", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased"
    >
      <head>
        {/* Lets reveal targets start hidden only when JS will animate them in. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
