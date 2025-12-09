import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/auth-context"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { ChevronLeft, Calendar, Weight, Activity, Heart, Camera, Syringe } from "lucide-react"

export default function PetProfilePage() {
    const params = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const petId = params.id as string
    const pet = user?.pets.find((p) => p.id === petId)

    if (!pet) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-xl font-semibold">반려동물을 찾을 수 없습니다.</p>
                <Button onClick={() => navigate(-1)}>돌아가기</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center border-b bg-background/80 px-4 py-3 backdrop-blur-md">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="ml-2 text-lg font-bold">반려동물 프로필</h1>
            </div>

            <main className="container mx-auto max-w-2xl p-4 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
                            <AvatarImage src={pet.photo} alt={pet.name} />
                            <AvatarFallback>{pet.name[0]}</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute bottom-0 right-0 bg-primary px-3 py-1 text-sm">
                            {pet.gender}
                        </Badge>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">{pet.name}</h2>
                        <p className="text-muted-foreground">{pet.breed} • {pet.age}살</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="border-0 shadow-md bg-pink-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-4">
                            <Activity className="mb-2 h-6 w-6 text-pink-500" />
                            <p className="text-2xl font-bold text-pink-600">{pet.stats?.walks || 0}</p>
                            <p className="text-xs text-muted-foreground">산책 횟수</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-purple-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-4">
                            <Heart className="mb-2 h-6 w-6 text-purple-500" />
                            <p className="text-2xl font-bold text-purple-600">{pet.stats?.friends || 0}</p>
                            <p className="text-xs text-muted-foreground">친구</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-blue-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-4">
                            <Camera className="mb-2 h-6 w-6 text-blue-500" />
                            <p className="text-2xl font-bold text-blue-600">{pet.stats?.photos || 0}</p>
                            <p className="text-xs text-muted-foreground">사진</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">기본 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>생일</span>
                                </div>
                                <span className="font-medium">{pet.birthday || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Weight className="h-4 w-4" />
                                    <span>몸무게</span>
                                </div>
                                <span className="font-medium">{pet.healthStatus?.weight || "-"}</span>
                            </div>
                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">소개</p>
                                <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                                    {/* pet.bio is not in the interface yet, handling gracefully or assuming it might be added later or using a default */}
                                    {"새로운 가족입니다."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">성격 & 특징</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {pet.personality ? (
                                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                                        #{pet.personality}
                                    </Badge>
                                ) : (
                                    <span className="text-sm text-muted-foreground">등록된 성격이 없습니다.</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">건강 상태</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-4 w-4 text-green-500" />
                                    <span>예방접종</span>
                                </div>
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                    {pet.healthStatus?.vaccination || "미접종"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span>체중 상태</span>
                                </div>
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                    {pet.healthStatus?.weight || "정상"}
                                </Badge>
                            </div>
                            <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                마지막 검진일: {pet.healthStatus?.lastCheckup || "-"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-lg font-bold shadow-lg hover:opacity-90"
                    onClick={() => navigate(`/profile/pet/${petId}/edit`)}
                >
                    프로필 수정
                </Button>
            </main>
        </div>
    )
}
