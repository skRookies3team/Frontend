export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-pink-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-pink-100 rounded mb-8"></div>
          <div className="h-[680px] bg-pink-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
