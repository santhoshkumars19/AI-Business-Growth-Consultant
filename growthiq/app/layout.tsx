import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "GrowthIQ AI — AI Business Growth Consultant",
  description: "Turn your business data into unstoppable growth. AI-powered insights, actionable recommendations, and monthly progress tracking for startups and small businesses.",
  keywords: "AI business consultant, growth analysis, small business, startup, revenue growth, AI recommendations",
  openGraph: {
    title: "GrowthIQ AI",
    description: "AI-powered business growth platform for entrepreneurs",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
