import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card"
import { Label } from "@/shared/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { Camera, User } from "lucide-react"

export default function SignupInfoPage() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [birthday, setBirthday] = useState("")
    const [gender, setGender] = useState("female")
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Get credentials from sessionStorage
            const credentialsStr = sessionStorage.getItem("signup_credentials")
            const credentials = credentialsStr ? JSON.parse(credentialsStr) : {}

            // Save user info to sessionStorage for next step
            const userInfo = {
                email: credentials.email,
                password: credentials.password,
                name,
                username,
                birthday,
                gender,
                avatar: previewUrl || "/placeholder.svg?height=40&width=40"
            }
            sessionStorage.setItem("signup_user_info", JSON.stringify(userInfo))

            // Navigate to pet registration
            navigate("/pet-info")
        } catch (error) {
            console.error("Failed to save user info", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-xl border-pink-100">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                        <User className="h-6 w-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">프로필 설정</CardTitle>
                    <CardDescription>
                        나만의 프로필을 완성해주세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group-hover:border-pink-500 transition-colors">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="h-8 w-8 text-slate-400 group-hover:text-pink-500 transition-colors" />
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                <div className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-1.5 shadow-md">
                                    <Camera className="h-3 w-3 text-white" />
                                </div>
                            </div>
                            <span className="text-xs text-slate-500">프로필 사진을 등록해주세요</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">이름 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="이름을 입력하세요"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">사용자 이름 <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                                    <Input
                                        id="username"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        required
                                        className="pl-8 bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">영문 소문자, 숫자, 밑줄(_)만 사용 가능합니다</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthday">생년월일</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>성별</Label>
                                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" id="female" />
                                        <Label htmlFor="female">여성</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" id="male" />
                                        <Label htmlFor="male">남성</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="other" id="other" />
                                        <Label htmlFor="other">기타</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2 rounded-lg transition-all duration-200 transform active:scale-95"
                            disabled={isLoading}
                        >
                            {isLoading ? "저장 중..." : "다음으로"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
