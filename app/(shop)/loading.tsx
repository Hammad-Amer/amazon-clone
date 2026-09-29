/** Skeleton shown while a server-rendered shop page (e.g. search results) streams in. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 md:px-5" aria-busy="true" aria-label="Loading">
      <div className="mb-4 h-6 w-64 animate-pulse rounded-full bg-white" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)]">
            <div className="m-2 mb-0 aspect-square animate-pulse rounded-xl bg-sky" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-sky-tint" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-sky-tint" />
              <div className="h-8 animate-pulse rounded-full bg-sky-tint" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
