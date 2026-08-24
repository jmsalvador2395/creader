import { Suspense } from "react";
import { useSuspenseQuery, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { generatePath} from "react-router-dom";

import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

import { listEntries } from "../api/directory";
import { ErrorFallBack } from "./ErrorFallback";

function generateReaderUrl(container, image) {
  const containerEncode = encodeURIComponent(container);
  const imageEncode = encodeURIComponent(image);

  return `/reader/${containerEncode}/${image}`;
}

function ThumbnailsData({ path }) {
  const { data: thumbnails } = useSuspenseQuery({
    queryKey: ["thumbnails", path],
    queryFn: () => listEntries({p: path, img: true}),
  });

  console.log(thumbnails);

  return (
    // <div className="flex flex-wrap items-center gap-1">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {thumbnails.map((item) => (
        <a href={generateReaderUrl(item.container, item.name)}>
        <img key={item.id} src={item.thumbnailLink} className="object-cover" />
        </a>
      ))}
    </div>
  )
}

export function Thumbnails({ path }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallBack}>
          <Suspense fallback={<ThumbnailSkeleton />}>
            <ThumbnailsData path={path} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export function ThumbnailSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-14 rounded-4xl" />
      ))}
    </div>
  )
}

export function TagsById({ path }) {

}

export function TagsByList({ tags }) {

}
