import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_KR, Gaegu } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { FloatingChatbotWidget } from "@/components/floating-chatbot-widget"
import "./globals.css"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
})

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "PetLog - 우리 아이의 특별한 이야기",
  description: "AI 다이어리, 챗봇, 소셜 피드로 반려동물과의 모든 순간을 기록하세요",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${gaegu.variable} font-sans antialiased`}>
        <AuthProvider>
          <Header />
          {children}
          <FloatingChatbotWidget />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
