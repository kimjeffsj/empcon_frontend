import React from "react";
import { FallbackProps } from "react-error-boundary";

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div
      role="alert"
      className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      <h2 className="text-lg font-semibold">Something went wrong:</h2>
      <pre className="mt-2 text-sm whitespace-pre-wrap">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;
