'use client';

// tone: 'error' | 'success' | 'info'
export default function Alert({ tone = 'info', children }) {
  if (!children) return null;

  const toneStyles = {
    error: 'border-signal-crimson/40 bg-signal-crimson/10 text-signal-crimson',
    success: 'border-signal-teal/40 bg-signal-teal/10 text-signal-teal',
    info: 'border-ink-600 bg-ink-800 text-fog-300',
  };

  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2.5 text-sm ${toneStyles[tone]}`}>
      {children}
    </div>
  );
}
