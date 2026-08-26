export const metadata = { title: 'Unauthorized — Disaster Response Network' };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center font-body">
      <p className="font-mono text-xs uppercase tracking-tag text-signal-crimson">Access Denied</p>
      <h1 className="mt-3 font-display text-2xl font-medium text-fog-100">
        You don't have access to this dashboard
      </h1>
      <p className="mt-3 max-w-sm text-sm text-fog-500">
        Your account role doesn't permit viewing this page. If you believe this is a mistake,
        contact an administrator.
      </p>
      <a
        href="/"
        className="mt-6 rounded-md bg-signal-teal px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-signal-teal/90"
      >
        Return to my dashboard
      </a>
    </main>
  );
}
