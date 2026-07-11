export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card p-5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="h-72 rounded-xl border border-border bg-card lg:col-span-2" />
        <div className="h-72 rounded-xl border border-border bg-card lg:col-span-3" />
      </div>
    </div>
  )
}
