import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { toast } from 'react-toastify';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded text-red-800">
      <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
      <pre className="text-xs whitespace-pre-wrap break-all mb-2">{error.message}</pre>
      <button
        className="mt-4 px-4 py-2 bg-red-200 rounded hover:bg-red-300"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => toast.error(error.message)}
    >
      {children}
    </ReactErrorBoundary>
  );
}
