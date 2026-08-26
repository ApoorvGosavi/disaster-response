// Shared shell for all auth pages (login, register, forgot/reset
// password). Left panel carries the "signature" element — a
// dispatch-style status ticker — right panel holds the form.
// No client JS required here, so this stays a server component.

const TICKER_LINES = [
  'GRID SYNC — all sectors reporting',
  'RESCUE UNITS — 12 active, 4 standby',
  'SHELTER CAPACITY — nominal',
  'HOSPITAL NETWORK — connected',
  'ALERT LEVEL — monitoring',
];

export default function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="flex min-h-screen bg-ink-950 font-body">
      {/* Left: brand / status panel — hidden on small screens to keep
          the form the priority on mobile */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden border-r border-ink-700 bg-ink-900 p-10 lg:flex">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-signal-teal" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-tag text-fog-500">
              System Status: Operational
            </span>
          </div>

          <h1 className="mt-10 font-display text-3xl font-medium leading-tight text-fog-100">
            Unified Disaster
            <br />
            Response Network
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog-300">
            One coordinated view across citizens, rescue teams, authorities,
            hospitals, and volunteers — from first report to resolution.
          </p>
        </div>

        {/* Signature element: scrolling dispatch ticker */}
        <div className="rounded-md border border-ink-700 bg-ink-800 p-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-tag text-fog-500">
            Live Feed
          </p>
          <ul className="space-y-2 font-mono text-xs text-fog-300">
            {TICKER_LINES.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-signal-teal" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:w-[58%]">
        <div className="w-full max-w-sm">
          <p className="mb-2 font-mono text-xs uppercase tracking-tag text-signal-teal">{eyebrow}</p>
          <h2 className="font-display text-2xl font-medium text-fog-100">{title}</h2>
          {description && <p className="mt-2 text-sm text-fog-500">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
