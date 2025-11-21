export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="h-[600px] md:h-[700px] w-full rounded-3xl bg-gray-200 animate-pulse" />
      </div>
    </div>
  )
}
