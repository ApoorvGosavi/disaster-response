'use client';

// Primitive button with a loading state. Kept deliberately plain —
// personality in this design system lives in typography/color, not
// in button chrome.
export default function Button({
  children,
  loading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  const base =
    'w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium font-body transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

  const variants = {
    primary: 'bg-signal-teal text-ink-950 hover:bg-signal-teal/90',
    secondary: 'bg-ink-700 text-fog-100 hover:bg-ink-600 border border-ink-600',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
