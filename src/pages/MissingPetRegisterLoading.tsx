export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  )
}
