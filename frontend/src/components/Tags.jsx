import { Suspense } from "react";
import { useSuspenseQuery, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { readTags } from "../api/library";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { ErrorFallBack } from "./ErrorFallback";

function TagsData({ path }) {
  const { data: tags } = useSuspenseQuery({
    queryKey: ["tags", path],
    queryFn: () => readTags(path),
  });

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <Badge key={tag.id ?? tag} variant="secondary">
          {tag.name ?? tag}
        </Badge>
      ))}
    </div>
  )
}

export function Tags({ path }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallBack}>
          <Suspense fallback={<TagSkeleton />}>
            <TagsData path={path} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export function TagSkeleton({ count = 4 }) {
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