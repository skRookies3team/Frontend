import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    ChevronLeft,
    User,
    Bell,
    Lock,
    Monitor,
    HelpCircle,
    LogOut,
    Moon,
    Sun,
    Laptop,
    ChevronRight,
    Shield,
    Mail
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { setTheme, theme } = useTheme()

    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [marketingEnabled, setMarketingEnabled] = useState(false)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [privateProfile, setPrivateProfile] = useState(false)

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">설정</h1>
                </div>
            </header>

            <main className="container mx-auto max-w-3xl space-y-6 p-4 md:p-6">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                        <TabsTrigger value="account" className="flex flex-col gap-1 py-2 text-xs sm:text-sm">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">계정</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex flex-col gap-1 py-2 text-xs sm:text-sm">
                            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">알림</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex flex-col gap-1 py-2 text-xs sm:text-sm">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">개인정보</span>
                        </TabsTrigger>
                        <TabsTrigger value="display" className="flex flex-col gap-1 py-2 text-xs sm:text-sm">
                            <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">화면</span>
                        </TabsTrigger>
                        <TabsTrigger value="support" className="flex flex-col gap-1 py-2 text-xs sm:text-sm">
                            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">지원</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-6">
                        <TabsContent value="account" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>계정 정보</CardTitle>
                                    <CardDescription>기본 계정 정보를 관리합니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <Input id="email" defaultValue={user?.email || "user@example.com"} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">이름</Label>
                                        <Input id="name" defaultValue={user?.name || "사용자"} disabled />
                                        <p className="text-xs text-muted-foreground">이름 변경은 프로필 페이지에서 가능합니다.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>계정 보안</CardTitle>
                                    <CardDescription>비밀번호 및 계정 보안 설정입니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full justify-between">
                                        비밀번호 변경
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Separator />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        로그아웃
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
                                        <User className="mr-2 h-4 w-4" />
                                        계정 삭제
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>알림 설정</CardTitle>
                                    <CardDescription>원하는 알림을 선택하여 받을 수 있습니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                                            <span>푸시 알림</span>
                                            <span className="font-normal text-muted-foreground">새로운 활동, 댓글, 좋아요 알림을 받습니다.</span>
                                        </Label>
                                        <Switch id="push-notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                                            <span>이메일 알림</span>
                                            <span className="font-normal text-muted-foreground">중요한 업데이트 및 활동 내역을 이메일로 받습니다.</span>
                                        </Label>
                                        <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="marketing" className="flex flex-col space-y-1">
                                            <span>마케팅 정보 수신</span>
                                            <span className="font-normal text-muted-foreground">이벤트, 프로모션 및 새로운 기능 소식을 받습니다.</span>
                                        </Label>
                                        <Switch id="marketing" checked={marketingEnabled} onCheckedChange={setMarketingEnabled} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="privacy" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>개인정보 보호</CardTitle>
                                    <CardDescription>내 정보의 공개 범위를 설정합니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="private-profile" className="flex flex-col space-y-1">
                                            <span>비공개 프로필</span>
                                            <span className="font-normal text-muted-foreground">승인된 팔로워만 내 게시물과 정보를 볼 수 있습니다.</span>
                                        </Label>
                                        <Switch id="private-profile" checked={privateProfile} onCheckedChange={setPrivateProfile} />
                                    </div>
                                    <Separator />
                                    <Button variant="outline" className="w-full justify-between">
                                        차단한 사용자 관리
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="display" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>화면 설정</CardTitle>
                                    <CardDescription>앱의 테마와 화면 구성을 설정합니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Label>테마 선택</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button
                                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted ${theme === "root" ? "border-primary bg-primary/5" : "border-muted"
                                                    }`}
                                                onClick={() => setTheme("root")}
                                            >
                                                <Sun className="h-6 w-6" />
                                                <span className="text-sm font-medium">라이트</span>
                                            </button>
                                            <button
                                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted ${theme === "dark" ? "border-primary bg-primary/5" : "border-muted"
                                                    }`}
                                                onClick={() => setTheme("dark")}
                                            >
                                                <Moon className="h-6 w-6" />
                                                <span className="text-sm font-medium">다크</span>
                                            </button>
                                            <button
                                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted ${theme === "system" ? "border-primary bg-primary/5" : "border-muted"
                                                    }`}
                                                onClick={() => setTheme("system")}
                                            >
                                                <Laptop className="h-6 w-6" />
                                                <span className="text-sm font-medium">시스템</span>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="support" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>고객 지원</CardTitle>
                                    <CardDescription>도움이 필요하신가요?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            자주 묻는 질문 (FAQ)
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="outline" className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            문의하기
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Separator />
                                    <Button variant="ghost" className="w-full justify-between text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            이용약관
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-between text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            개인정보 처리방침
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <div className="pt-4 text-center text-xs text-muted-foreground">
                                        앱 버전 1.0.0
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    )
}