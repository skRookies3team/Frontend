export default function AIStudioLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 md:pb-0">
      <main className="container mx-auto max-w-4xl p-4 pt-8 md:p-6 md:pt-12">
        <div className="mb-8 text-center md:mb-12">
          <div className="mx-auto mb-4 h-20 w-20 animate-pulse rounded-full bg-pink-200 md:h-24 md:w-24" />
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-pink-200 md:h-10 md:w-64" />
          <div className="mx-auto mt-2 h-6 w-64 animate-pulse rounded bg-pink-100 md:w-80" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-pink-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-purple-100" />
        </div>
      </main>
    </div>
  )
}
