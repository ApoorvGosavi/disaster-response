'use client';

import { useEffect, useState } from 'react';
import { Card, EmptyState } from '../Widgets';
import Alert from '../../ui/Alert';
import { listResourceRequests, patchResourceRequestStatus } from '../../../services/resourceRequests';

export default function AuthorityResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listResourceRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || 'Could not load resource requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function review(request, status) {
    setBusyId(request.id);
    setError('');
    try {
      const data = await patchResourceRequestStatus(request.id, status);
      setRequests((list) => list.map((r) => (r.id === request.id ? data.request : r)));
    } catch (err) {
      setError(err.message || 'Could not update request.');
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <Card title="Resource Requests">
      <Alert tone="error">{error}</Alert>
      {loading ? (
        <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
      ) : pending.length ? (
        <div className="space-y-1">
          {pending.map((r) => (
            <div key={r.id} className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
              <div>
                <p className="text-sm text-fog-100">{r.resource_type} × {r.quantity}</p>
                {r.notes && <p className="text-xs text-fog-500">{r.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => review(r, 'fulfilled')}
                  disabled={busyId === r.id}
                  className="rounded-md bg-signal-teal px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-signal-teal/90 disabled:opacity-50"
                >
                  Fulfill
                </button>
                <button
                  onClick={() => review(r, 'rejected')}
                  disabled={busyId === r.id}
                  className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium text-fog-100 hover:border-signal-crimson/50 hover:text-signal-crimson disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="No pending resource requests." />
      )}
    </Card>
  );
}
