import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Crystal",
  description: "AI-powered syllabus organizer",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('crystal_theme') || 'system';
                let isDark = false;
                if (stored === 'system') {
                  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme-setting', 'system');
                } else {
                  document.documentElement.setAttribute('data-theme', stored);
                  document.documentElement.setAttribute('data-theme-setting', stored);
                  isDark = stored === 'dark' || stored === 'nord' || stored === 'midnight' || stored === 'forest';
                }
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${manrope.className} antialiased min-h-screen select-none font-sans`}>
        {children}
      </body>
    </html>
  );
}
