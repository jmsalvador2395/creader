export function ErrorFallBack({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="text-sm text-destructive">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary} className="underline">
        Retry
      </button>
    </div>
  )
}
