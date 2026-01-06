import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from '@/shared/ui/card';

import { Badge } from "@/shared/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  PawPrint,
  Settings,
  Edit,
  ImageIcon,
  Plus,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"




import { Link, useNavigate, Outlet } from "react-router-dom"
import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { getUserApi, updateProfileApi, type GetUserDto } from "@/features/auth/api/auth-api"
import { deletePetApi, lostPetApi } from "@/features/healthcare/api/pet-api"

import UserDiaryPage from "./UserDiaryPage"

export default function ProfilePage() {
  const navigate = useNavigate()

  const { user, updateUser, addPet, updatePet, deletePet } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)


  // API state
  const [apiUserData, setApiUserData] = useState<GetUserDto | null>(null)
  // const [isLoadingApi, setIsLoadingApi] = useState(false)

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // setIsLoadingApi(true)
        const storedUser = localStorage.getItem('petlog_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          const userId = parseInt(userData.id)
          if (userId) {
            const response = await getUserApi(userId)
            setApiUserData(response)
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      } finally {
        // setIsLoadingApi(false)
      }
    }
    fetchUserData()
  }, [])








  // Pet Management State - use API data if available
  const pets = apiUserData?.pets.map(pet => ({
    id: pet.petId.toString(),
    name: pet.petName,
    species: pet.species === 'DOG' ? '강아지' : '고양이',
    breed: pet.breed,
    age: pet.age,
    photo: pet.profileImage || '/placeholder-pet.jpg',
    gender: pet.genderType === 'MALE' ? '남아' : '여아',
    neutered: pet.is_neutered,
    birthday: pet.birth,
    isMemorial: false, // Default to false for API pets
  })) || user?.pets || []
  const [showAddPetDialog, setShowAddPetDialog] = useState(false)
  const [showAddPetConfirmDialog, setShowAddPetConfirmDialog] = useState(false)
  const [showManagePetsDialog, setShowManagePetsDialog] = useState(false)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)

  // Edit Profile State
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const [editName, setEditName] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editAvatar, setEditAvatar] = useState<string | null>(null)

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)

  // Initialize edit state when dialog opens
  const handleOpenEditProfile = () => {
    setEditName(apiUserData?.username || user?.name || "")
    setEditUsername(apiUserData?.social || user?.username || "")
    // Bio removed
    setEditAvatar(apiUserData?.profileImage || user?.avatar || null)
    setSelectedPhotoFile(null)
    setShowEditProfileDialog(true)
  }

  const handleUpdateProfile = async () => {
    try {
      if (!user) return

      const userId = parseInt(user.id)
      await updateProfileApi(
        {
          username: editName,
          social: editUsername
        },
        selectedPhotoFile
      )

      // Refresh user data
      const response = await getUserApi(userId)
      setApiUserData(response)
      updateUser({
        name: response.username,
        username: response.social,
        avatar: response.profileImage
      })

      setShowEditProfileDialog(false)
    } catch (error) {
      console.error("Failed to update profile", error)
    }
  }

  // New Pet Form State
  const [newPetName, setNewPetName] = useState("")
  const [newPetBreed, setNewPetBreed] = useState("")
  const [newPetAge, setNewPetAge] = useState("")
  const [newPetGender] = useState("남아")

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePet = () => {
    if (!newPetName || !newPetBreed) return

    if (editingPetId) {
      updatePet(editingPetId, {
        name: newPetName,
        breed: newPetBreed,
        age: parseInt(newPetAge) || 0,
      })
    } else {
      const newPet = {
        id: Date.now().toString(),
        name: newPetName,
        species: "강아지", // Default value
        breed: newPetBreed,
        age: parseInt(newPetAge) || 0,
        gender: newPetGender as "남아" | "여아",
        photo: "/placeholder.svg",
        neutered: false, // Default value
        birthday: new Date().toISOString().split('T')[0],
        personality: "활발함", // Default value
        healthStatus: {
          lastCheckup: "-",
          vaccination: "미접종",
          weight: "정상"
        },
        stats: {
          walks: 0,
          friends: 0,
          photos: 0
        }
      }
      addPet(newPet, null)
    }

    setShowAddPetDialog(false)
    setEditingPetId(null)
    setNewPetName("")
    setNewPetBreed("")
    setNewPetAge("")
  }



  const handleDeletePet = async (id: string, event?: React.MouseEvent) => {
    // Prevent event bubbling if triggered from a button inside another clickable element
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!confirm("정말로 이 반려동물을 삭제하시겠습니까?")) return;

    try {
      await deletePetApi(parseInt(id));

      // Update local state via context
      deletePet(id);

      // Also update apiUserData if it exists locally to reflect change immediately in UI without refetch
      if (apiUserData) {
        setApiUserData({
          ...apiUserData,
          pets: apiUserData.pets.filter(p => p.petId.toString() !== id)
        });
      }

      alert("펫이 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete pet:", error);
      alert("펫 삭제에 실패했습니다.");
    }
  }





  const handleToggleMemorial = async (pet: any) => {
    if (pet.isMemorial) {
      // Already memorial (dead), user wants to revert (alive)?
      // Current API `lostPetApi` only sets status to 'DEAD'.
      // Assuming there isn't an easy way to revert via this specific API or user instructions imply one-way for 'lostPet'.
      // However, existing UI code tried to toggle locally. 
      // We will warn or just toggle locally if functionality is not supported by API, 
      // BUT user asked to "call memorial api" when clicking the button.
      // It's safer to only call it when turning ON memorial.

      // For now, let's assume we can only set it to memorial via API. Reverting might just be local or not supported.
      // But to keep UI responsive, let's just toggle local state if it's already memorial (maybe mis-click).
      updatePet(pet.id, { isMemorial: !pet.isMemorial });
      return;
    }

    if (!confirm("정말로 이 반려동물을 추모(사망) 처리하시겠습니까?")) return;

    try {
      await lostPetApi(parseInt(pet.id));
      updatePet(pet.id, { isMemorial: true });
      alert("반려동물이 추모 상태로 변경되었습니다.");
    } catch (error) {
      console.error("Failed to set memorial status:", error);
      alert("상태 변경에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl pb-20 md:pb-8 md:px-6 md:py-6">
        <div className="space-y-6 p-4 md:p-0">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-border md:h-32 md:w-32">
                    <AvatarImage src={apiUserData?.profileImage || user?.avatar || "/placeholder-user.jpg"} alt={apiUserData?.username || user?.name || "User"} />
                    <AvatarFallback>{apiUserData?.username?.[0] || user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-2 text-white shadow-md hover:opacity-90"
                    onClick={handleOpenEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4 flex items-center justify-center gap-3 md:justify-between">
                    <h2 className="text-2xl font-bold text-foreground md:text-3xl">{apiUserData?.username || user?.name || "김서연"}</h2>
                    <div className="flex gap-2">
                      <Link to="/settings">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-muted-foreground"
                        >
                          <Settings className="h-4 w-4" />
                          {/* 설정 */}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">@{apiUserData?.social || user?.username || user?.email?.split('@')[0] || "user"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Pets */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">마이 펫</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowManagePetsDialog(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {pets.map((pet) => (
                  <Link key={pet.id} to={`/profile/pet/${pet.id}`} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="relative">
                      <Avatar className={cn(
                        "h-16 w-16 border-2 border-primary/20 transition-transform hover:scale-105",
                        pet.isMemorial && "grayscale opacity-70"
                      )}>
                        <AvatarImage src={pet.photo} alt={pet.name} />
                        <AvatarFallback>{pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-white">
                        <PawPrint className="h-3 w-3" />
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{pet.name}</span>
                  </Link>
                ))}

                <button
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                  onClick={() => setShowAddPetConfirmDialog(true)}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:bg-muted/50">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">추가</span>
                </button>
              </div>
            </CardContent>
          </Card>


          <UserDiaryPage />
        </div>
      </main >

      {/* Edit Profile Dialog */}
      < Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              프로필 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={editAvatar || user?.avatar || "/placeholder-user.jpg"} alt={editName || "User"} />
                  <AvatarFallback>{editName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white shadow-sm hover:opacity-90"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-3 w-3" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                사진 변경
              </Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                이름
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                사용자 이름
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="pl-8"
                  placeholder="username"
                />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button onClick={handleUpdateProfile}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Add Pet Confirmation Dialog */}
      <Dialog open={showAddPetConfirmDialog} onOpenChange={setShowAddPetConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>반려동물 추가</DialogTitle>
            <DialogDescription>
              새로운 반려동물을 추가하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAddPetConfirmDialog(false)}
            >
              아니오
            </Button>
            <Button
              onClick={() => {
                setShowAddPetConfirmDialog(false)
                navigate("/pet-info?returnTo=/profile")
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Pet Dialog */}
      < Dialog open={showAddPetDialog} onOpenChange={setShowAddPetDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPetId ? "반려동물 정보 수정" : "반려동물 추가"}</DialogTitle>
            <DialogDescription>
              {editingPetId ? "반려동물 정보를 수정합니다." : "새로운 반려동물 정보를 입력해주세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">이름</Label>
              <Input id="name" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">품종</Label>
              <Input id="breed" value={newPetBreed} onChange={(e) => setNewPetBreed(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">나이</Label>
              <Input id="age" value={newPetAge} onChange={(e) => setNewPetAge(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSavePet}>{editingPetId ? "수정하기" : "추가하기"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Manage Pets Dialog */}
      < Dialog open={showManagePetsDialog} onOpenChange={setShowManagePetsDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반려동물 관리</DialogTitle>
            <DialogDescription>등록된 반려동물을 관리합니다.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {pets.map(pet => (
              <div key={pet.id} className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                pet.isMemorial ? "bg-gray-50 border-gray-200" : "border-border"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full overflow-hidden",
                    pet.isMemorial && "grayscale opacity-70"
                  )}>
                    <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="font-medium">{pet.name}</span>
                    {pet.isMemorial && (
                      <span className="ml-2 text-xs text-muted-foreground">🕊️ 추모</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleMemorial(pet)}
                    className={cn(
                      pet.isMemorial && "bg-gray-100"
                    )}
                  >
                    {pet.isMemorial ? "추모 해제" : "추모 모드"}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => handleDeletePet(pet.id, e)}>삭제</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog >



      <Outlet />
      <TabNavigation />
    </div >
  )
}