export function Card({ title, action, children }) {
  return (
    <section className="rounded-lg border border-ink-700 bg-ink-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium uppercase tracking-tag text-fog-300">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
          <p className="font-mono text-2xl font-medium text-fog-100">{s.value}</p>
          <p className="mt-1 text-xs uppercase tracking-tag text-fog-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

const SEVERITY_DOT = {
  low: 'bg-signal-teal',
  medium: 'bg-signal-amber',
  high: 'bg-signal-amber',
  critical: 'bg-signal-crimson',
};

export function ListRow({ title, meta, severity }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
      <div className="flex items-center gap-3">
        {severity && <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[severity] || 'bg-fog-500'}`} />}
        <span className="text-sm text-fog-100">{title}</span>
      </div>
      <span className="font-mono text-xs text-fog-500">{meta}</span>
    </div>
  );
}

export function EmptyState({ text }) {
  return <p className="py-6 text-center text-sm text-fog-500">{text}</p>;
}
