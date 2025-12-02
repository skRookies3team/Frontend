import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft, MapPin, Calendar, AlertCircle } from "lucide-react"

export default function RegisterMissingPetPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    photo: "",
    lastSeen: "",
    date: "",
    contact: "",
    description: "",
  })
  const [photoPreview, setPhotoPreview] = useState<string>("")

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setFormData({ ...formData, photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const existingPets = JSON.parse(localStorage.getItem("missingPets") || "[]")
    const newPet = {
      ...formData,
      id: Date.now().toString(),
    }
    localStorage.setItem("missingPets", JSON.stringify([...existingPets, newPet]))
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="h-6 w-6" />
              실종견 등록
            </CardTitle>
            <p className="text-rose-50 text-sm mt-2">소중한 반려동물을 찾는데 도움을 드리겠습니다</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-base font-semibold">
                  사진 *
                </Label>
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-40 h-40 rounded-xl object-cover border-4 border-rose-200"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-xl border-4 border-dashed border-rose-200 flex items-center justify-center bg-rose-50">
                      <Upload className="h-10 w-10 text-rose-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("photo")?.click()}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    사진 업로드
                  </Button>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    required
                  />
                </div>
              </div>

              {/* Name & Breed */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="예: 바둑이"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">품종 *</Label>
                  <Input
                    id="breed"
                    placeholder="예: 믹스견"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    required
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">나이 *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="예: 5"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>

              {/* Last Seen Location */}
              <div className="space-y-2">
                <Label htmlFor="lastSeen" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-600" />
                  실종 위치 *
                </Label>
                <Input
                  id="lastSeen"
                  placeholder="예: 서울시 강남구 역삼동"
                  value={formData.lastSeen}
                  onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                  required
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rose-600" />
                  실종 날짜 *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact">연락처 *</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">특징 *</Label>
                <Textarea
                  id="description"
                  placeholder="예: 갈색 털에 왼쪽 귀에 흰 점이 있습니다"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="border-rose-200 focus:border-rose-400 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                실종견 등록하기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
