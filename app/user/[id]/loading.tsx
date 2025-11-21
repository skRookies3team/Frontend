export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <div className="mb-6 flex items-start gap-4 md:gap-8">
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted md:h-32 md:w-32" />
          <div className="flex-1 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="flex gap-8">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 md:gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
