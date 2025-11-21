export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-white to-rose-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  )
}
