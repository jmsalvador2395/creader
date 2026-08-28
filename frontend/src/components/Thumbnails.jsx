import { Suspense, useState, useEffect } from "react";
import { useSuspenseQuery, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { generatePath} from "react-router-dom";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";


import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, 
  SelectValue, SelectLabel,
} from "@/components/ui/select" 
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"


import { listEntries } from "../api/directory";
import { ErrorFallBack } from "./ErrorFallback";

function generateReaderUrl(container, image) {
  const containerEncode = encodeURIComponent(container);
  const imageEncode = encodeURIComponent(image);

  return `/reader/${containerEncode}/${image}`;
}

function Thumbnail({ item }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      <a href={generateReaderUrl(item.container, item.name)} className="relative block">
        {!loaded && <Skeleton className="w-full aspect-square" />}
        <img
          src={item.thumbnailLink}
          onLoad={() => setLoaded(true)}
          className={`w-full h-auto ${loaded ? "" : "hidden"}`}
        />
      </a>
      <div className="mt-auto w-full text-center">
        <span className="text-sm truncate block" title={item.name}>
          {item.name}
        </span>
      </div>
    </div>
    );
}

function ThumbnailPagination({
  numPages,
	pageSize,
	setPageSize,
	page,
	setPage
}) {

  const pageNumbers = [...Array(numPages).keys()];
  const pageSizeOptions = [30, 60, 120, 240, 480];

  return (
    <div className="p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <Select 
        placeholder={`Page Size (${pageSize})`}
        selectedKey={pageSize}
        onSelectionChange={(key) => setPageSize(Number(key))}
      >
        <SelectTrigger className="w-45">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Page Sizes</SelectLabel>
            {pageSizeOptions.map((item) => (
              <SelectItem key={item} id={item} isDisabled={ pageSize == item }>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Pagination className="mx-0 w-auto col-start-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => {setPage(Math.max(page-1, 0))}} />
          </PaginationItem>
          {pageNumbers.map((i) => (
            <PaginationItem key={i}>
              <PaginationLink onClick={() => {setPage(i)}} isActive={ page===i }>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => {setPage(Math.min(page+1, Math.max(numPages-1, 0)))}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function ThumbnailsData({ path }) {

  // listeners
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(localStorage.getItem("thumbnailsPageSize") ?? 60);
  const { data: thumbnails } = useSuspenseQuery({
    queryKey: ["thumbnails", path],
    queryFn: () => listEntries({p: path, img: true}),
  });

  // effects
  useEffect(() => {
    localStorage.setItem("thumbnailsPageSize", pageSize);
  }, [pageSize]);

  // derived data
  const numPages = Math.ceil(thumbnails.length / pageSize);
  const displayData = thumbnails.slice(
    pageSize * page, pageSize * (page + 1)
  );

  return (
    <>
    <ThumbnailPagination 
      numPages={numPages}
      pageSize={pageSize} 
      setPageSize={setPageSize}
      page={page} 
      setPage={setPage} 
    />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {/* {thumbnails.map((item) => ( */}
      {displayData.map((item) => (
        <Thumbnail key={item.id ?? item.name} item={item} />
      ))}
    </div>
    <ThumbnailPagination 
      numPages={numPages}
      pageSize={pageSize} 
      setPageSize={setPageSize}
      page={page} 
      setPage={setPage} 
    />
    </>
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

export function ThumbnailSkeleton({ count = 6 }) {
  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-full aspect-square" />
      ))}
    </div>
    <div className="flex justify-center">
      <span className="flex items-center gap-1">
        {[1, 2, 3].map((_, i) => (
          <Skeleton key={i} className="h-3 w-3 rounded-full" />
        ))}
      </span>
    </div>
    </>
  )
}