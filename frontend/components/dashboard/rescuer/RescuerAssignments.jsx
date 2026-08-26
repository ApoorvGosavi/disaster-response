'use client';

import { useEffect, useState } from 'react';
import { Card, StatGrid, EmptyState } from '../Widgets';
import Alert from '../../ui/Alert';
import { listMyAssignments, patchAssignmentStatus } from '../../../services/rescueAssignments';

// Mirrors backend/src/utils/statusTransitions.js — the backend is
// still the one that enforces this; this list just drives which
// single "next step" button makes sense to show.
const NEXT_STATUS = {
  assigned: 'accepted',
  accepted: 'en_route',
  en_route: 'arrived',
  arrived: 'responding',
  responding: 'resolved',
};

export default function RescuerAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listMyAssignments();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message || 'Could not load assignments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function advance(assignment) {
    const next = NEXT_STATUS[assignment.status];
    if (!next) return;
    setBusyId(assignment.id);
    setError('');
    try {
      const data = await patchAssignmentStatus(assignment.id, next);
      setAssignments((list) => list.map((a) => (a.id === assignment.id ? { ...a, ...data.assignment } : a)));
    } catch (err) {
      setError(err.message || 'Could not update status.');
    } finally {
      setBusyId(null);
    }
  }

  const active = assignments.filter((a) => a.status !== 'resolved').length;

  return (
    <div id="assignments" className="space-y-6">
      <StatGrid
        stats={[
          { label: 'Assigned', value: assignments.length },
          { label: 'Active', value: active },
          { label: 'Resolved', value: assignments.length - active },
          { label: 'SOS', value: 0 },
        ]}
      />

      <Alert tone="error">{error}</Alert>

      <Card title="My Team's Assignments">
        {loading ? (
          <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
        ) : assignments.length ? (
          <div className="space-y-1">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
                <div>
                  <p className="text-sm text-fog-100">{a.incidents?.title || 'Incident'}</p>
                  <p className="font-mono text-xs text-fog-500">
                    {a.incidents?.severity} · assignment: {a.status}
                  </p>
                </div>
                {NEXT_STATUS[a.status] && (
                  <button
                    onClick={() => advance(a)}
                    disabled={busyId === a.id}
                    className="rounded-md bg-signal-teal px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-signal-teal/90 disabled:opacity-50"
                  >
                    {busyId === a.id ? 'Updating…' : `Mark ${NEXT_STATUS[a.status]}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No incidents currently assigned to your team." />
        )}
      </Card>
    </div>
  );
}
