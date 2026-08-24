import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useSuspenseQuery, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallBack } from "../components/ErrorFallback";
import { readGalleryInfo } from "../api/library";
import { Tags } from "../components/Tags"
import { Thumbnails } from "../components/Thumbnails"

function GalleryTitleData({ container }) {
  const { data: galleryInfo } = useSuspenseQuery({
    queryKey: ["gallery-info", container],
    queryFn: () => readGalleryInfo(container),
  });

  return <h1>Title: { galleryInfo.title ?? galleryInfo.path }</h1>
}

function GalleryTitle({ container }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallBack}>
          <Suspense fallback={<h1>Loading ...</h1>}>
            <GalleryTitleData container={container} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default function Gallery() {
  const {container} = useParams();

  return (
    <>
    <div className="w-[90%] mx-auto border border-gray-300 border-collapse">
        <GalleryTitle container={container} />
        <Tags path={container} />
    </div>
    <div className="w-[50%] mx-auto border-gray-300">
      test
      <Thumbnails path={container} />
    </div>
    </>
  )
}

