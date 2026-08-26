'use client';

export default function Input({ label, id, error, hint, className = '', ...props }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-tag text-fog-500">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-md border bg-ink-800 px-3 py-2.5 text-sm text-fog-100 placeholder:text-fog-500 focus-visible:outline-2 focus-visible:outline-offset-2 ${
          error ? 'border-signal-crimson' : 'border-ink-600 focus:border-signal-teal'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-signal-crimson">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fog-500">
          {hint}
        </p>
      )}
    </div>
  );
}
