import React, { useState } from "react"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { PlusCircle, Activity, Weight, Heart, Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { saveHealthRecordApi } from "../api/healthcareApi"

export function ManualHealthEntry({ onSave, petName = "My Pet", petId }: { onSave?: (data: any) => void; petName?: string; petId?: string | number }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    weight: "",
    heartRate: "",
    respiratoryRate: "",
    steps: "",
    condition: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSaveStatus('idle')

    try {
      // [수정] petlog_token 우선 확인 (auth-context.tsx 저장 키와 일치)
      const token = localStorage.getItem('petlog_token') || localStorage.getItem('accessToken')
      const userId = localStorage.getItem('userId') || '0'
      // const petId = localStorage.getItem('selectedPetId') || '0' // Remove this line as we use the prop

      const response = await saveHealthRecordApi(
        {
          petName: petName,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
          respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
          steps: formData.steps ? parseInt(formData.steps) : undefined,
          condition: formData.condition,
          notes: formData.notes,
          recordType: 'MANUAL',
        },
        userId,
        petId?.toString() || '0',
        token
      )

      if (response.success) {
        setSaveStatus('success')
        if (onSave) {
             onSave({
                 ...formData,
                 weight: formData.weight ? parseFloat(formData.weight) : 0,
                 steps: formData.steps ? parseInt(formData.steps) : 0,
             }); 
        }
        setTimeout(() => {
          setOpen(false)
          setFormData({ weight: "", heartRate: "", respiratoryRate: "", steps: "", condition: "", notes: "" })
          setSaveStatus('idle')
        }, 1500)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Health record save failed:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
          <PlusCircle className="h-4 w-4" />
          데이터 수기 입력
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>건강 데이터 기록</DialogTitle>
          <DialogDescription>
            측정하지 못한 건강 데이터를 직접 입력하여 기록할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right flex items-center justify-end gap-2">
              <Weight className="h-4 w-4 text-gray-500" />
              체중
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="kg"
              className="col-span-3"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="heartRate" className="text-right flex items-center justify-end gap-2">
              <Heart className="h-4 w-4 text-gray-500" />
              심박수
            </Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="BPM"
              className="col-span-3"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="respRate" className="text-right flex items-center justify-end gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              호흡수
            </Label>
            <Input
              id="respRate"
              type="number"
              placeholder="회/분"
              className="col-span-3"
              value={formData.respiratoryRate}
              onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="steps" className="text-right flex items-center justify-end gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              걸음수
            </Label>
            <Input
              id="steps"
              type="number"
              placeholder="걸음"
              className="col-span-3"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right flex items-center justify-end gap-2">
               <span>😊</span>
               컨디션
            </Label>
            <div className="col-span-3 flex gap-2">
              {['최고', '좋음', '보통', '나쁨'].map((cond) => (
                <Button
                  key={cond}
                  type="button"
                  variant={formData.condition === cond ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, condition: cond })}
                >
                  {cond}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right flex items-center justify-end gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              메모
            </Label>
            <Input
              id="notes"
              placeholder="특이사항을 기록해주세요"
              className="col-span-3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className={`text-white min-w-[100px] ${
                saveStatus === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  저장 완료!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  저장 실패
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
