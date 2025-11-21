export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted"></div>
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted"></div>
        </div>

        <div className="mb-6 flex gap-2 border-b border-border pb-2">
          <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
