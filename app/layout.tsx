import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillVault - Skill Assessment & Certification Platform",
  description: "AI-ready, skill-first assessment and certification platform for verified colleges",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/skill_logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/skill_logo.png",
    apple: "/images/skill_logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
