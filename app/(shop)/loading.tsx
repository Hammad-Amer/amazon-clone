/** Skeleton shown while a server-rendered shop page (e.g. search results) streams in. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 md:px-5" aria-busy="true" aria-label="Loading">
      <div className="mb-4 h-6 w-64 animate-pulse rounded bg-white" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-md bg-white">
            <div className="aspect-square animate-pulse bg-[#f0f2f2]" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#f0f2f2]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#f0f2f2]" />
              <div className="h-8 animate-pulse rounded-full bg-[#f0f2f2]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
