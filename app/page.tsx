"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageCircle, ShoppingBag, Users, Calendar, Heart, Camera, Wand2 } from 'lucide-react'
import { RecapGenerationAnimation } from "@/components/recap-generation-animation"
import { LandingIntroAnimation } from "@/components/landing-intro-animation"
import { FeaturePreviewAnimation } from "@/components/feature-preview-animation"
import { motion } from "framer-motion"

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true)
  const [hasSeenIntro, setHasSeenIntro] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem("petlog-intro-seen")
      if (seen === "true") {
        setShowIntro(false)
        setHasSeenIntro(true)
      }
    }
  }, [])

  const handleIntroComplete = () => {
    setShowIntro(false)
    setHasSeenIntro(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("petlog-intro-seen", "true")
    }
  }

  const features = [
    {
      title: "AI 다이어리",
      description: "반려동물의 순간을 AI가 감성적인 일기로 변환해드려요",
      icon: Calendar,
      image: "/golden-retriever-playing-park.jpg",
      href: "/ai-studio/diary",
      color: "from-pink-400 to-rose-400",
    },
    {
      title: "펫 챗봇",
      description: "우리 아이와 대화하는 특별한 경험을 만나보세요",
      icon: MessageCircle,
      image: "/corgi-sitting.png",
      href: "/chatbot",
      color: "from-purple-400 to-pink-400",
    },
    {
      title: "소셜 피드",
      description: "다른 반려동물 가족들과 일상을 공유하세요",
      icon: Users,
      image: "/dog-running-grass.jpg",
      href: "/feed",
      color: "from-rose-400 to-pink-400",
    },
    {
      title: "펫 쇼핑",
      description: "마일리지로 특별한 혜택과 함께 쇼핑하세요",
      icon: ShoppingBag,
      image: "/dog-food-bag.jpg",
      href: "/shop",
      color: "from-pink-400 to-fuchsia-400",
    },
  ]

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <>
      {showIntro && <LandingIntroAnimation onComplete={handleIntroComplete} />}

      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 w-fit">
                <Sparkles className="h-4 w-4" />
                반려동물과의 모든 순간을 기록하세요
              </div>
              <h1 className="text-4xl font-bold leading-tight text-balance text-foreground md:text-5xl lg:text-6xl">
                우리 아이의
                <br />
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  특별한 이야기
                </span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty md:text-xl">
                AI가 자동으로 작성하는 반려동물 일기부터
                <br />
                커뮤니티, 쇼핑까지 한 공간에서 관리하세요
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 sm:w-auto"
                  >
                    지금 시작하기 →
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-rose-400"
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">12,000+</span> 보호자들이 사용중
                </div>
              </div>
            </div>

            <div className="relative">
              <RecapGenerationAnimation />
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-pink-200 opacity-50 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-rose-200 opacity-50 blur-2xl" />
            </div>
          </div>
        </section>

        {/* New Feature Preview Section */}
        <motion.section 
          className="container mx-auto px-4 py-8 md:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.div className="mb-8 text-center" variants={fadeInUp}>
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">실제로 체험해보세요</h2>
            <p className="text-base text-muted-foreground md:text-lg">PetLog의 핵심 기능들을 미리 확인해보세요</p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <FeaturePreviewAnimation />
          </motion.div>
        </motion.section>

        {/* Vision Section */}
        <motion.section 
          className="container mx-auto px-4 py-12 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <motion.div className="space-y-4" variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                우리의 비전
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full" />
            </motion.div>
            
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed md:text-2xl"
              variants={fadeInUp}
            >
              반려동물과 함께하는 모든 순간이 소중합니다.
            </motion.p>
            
            <motion.p 
              className="text-lg text-muted-foreground leading-relaxed text-pretty"
              variants={fadeInUp}
            >
              PetLog는 단순한 기록을 넘어, 반려동물과의 교감을 더욱 깊고 의미있게 만들어갑니다. 
              AI 기술을 통해 일상의 순간들을 감성적인 이야기로 변환하고, 
              커뮤니티를 통해 더 많은 반려동물 가족들과 연결되며, 
              건강 관리부터 쇼핑까지 모든 것을 한 곳에서 해결할 수 있는 
              통합 플랫폼을 제공합니다.
            </motion.p>

            <motion.div 
              className="grid gap-6 md:grid-cols-3 pt-8"
              variants={staggerContainer}
            >
              <motion.div 
                className="space-y-3 p-6 rounded-2xl bg-pink-50/50 border border-pink-100"
                variants={fadeInUp}
              >
                <div className="text-3xl font-bold text-pink-600">12,000+</div>
                <div className="text-sm text-muted-foreground">활성 사용자</div>
              </motion.div>
              <motion.div 
                className="space-y-3 p-6 rounded-2xl bg-rose-50/50 border border-rose-100"
                variants={fadeInUp}
              >
                <div className="text-3xl font-bold text-rose-600">50,000+</div>
                <div className="text-sm text-muted-foreground">생성된 AI 다이어리</div>
              </motion.div>
              <motion.div 
                className="space-y-3 p-6 rounded-2xl bg-pink-50/50 border border-pink-100"
                variants={fadeInUp}
              >
                <div className="text-3xl font-bold text-pink-600">98%</div>
                <div className="text-sm text-muted-foreground">사용자 만족도</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="container mx-auto px-4 py-8 md:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-6 text-center shadow-2xl md:p-8">
            <div className="relative z-10 mx-auto max-w-3xl space-y-4">
              <h2 className="text-xl font-bold text-white md:text-2xl">지금 바로 시작하세요</h2>
              <p className="text-base text-pink-50 md:text-lg">3분만에 가입하고 우리 아이의 특별한 순간을 기록해보세요</p>
              <div className="flex justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
                    로그인
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="mb-4 font-semibold">PetLog</h3>
                <p className="text-sm text-muted-foreground">
                  반려동물과의 모든 순간을
                  <br />
                  특별하게 기록하세요
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">서비스</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/ai-studio/diary" className="text-muted-foreground hover:text-primary">
                      AI 다이어리
                    </Link>
                  </li>
                  <li>
                    <Link href="/chatbot" className="text-muted-foreground hover:text-primary">
                      펫 챗봇
                    </Link>
                  </li>
                  <li>
                    <Link href="/feed" className="text-muted-foreground hover:text-primary">
                      소셜 피드
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" className="text-muted-foreground hover:text-primary">
                      쇼핑
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">고객지원</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      공지사항
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      자주 묻는 질문
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      문의하기
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">법적 고지</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      이용약관
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      개인정보처리방침
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              © 2025 PetLog. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
