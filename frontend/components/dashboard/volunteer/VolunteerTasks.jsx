'use client';

import { useEffect, useState } from 'react';
import { Card, StatGrid, EmptyState } from '../Widgets';
import Alert from '../../ui/Alert';
import {
  listVolunteerTasks,
  acceptVolunteerTask,
  patchVolunteerTaskStatus,
} from '../../../services/volunteerTasks';

const NEXT_STATUS = {
  assigned: 'in_progress',
  in_progress: 'completed',
};

export default function VolunteerTasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listVolunteerTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAccept(task) {
    setBusyId(task.id);
    setError('');
    try {
      const data = await acceptVolunteerTask(task.id);
      setTasks((list) => list.map((t) => (t.id === task.id ? data.task : t)));
    } catch (err) {
      setError(err.message || 'This task may have just been taken by someone else.');
      load(); // refresh to reflect reality
    } finally {
      setBusyId(null);
    }
  }

  async function advance(task) {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setBusyId(task.id);
    setError('');
    try {
      const data = await patchVolunteerTaskStatus(task.id, next);
      setTasks((list) => list.map((t) => (t.id === task.id ? data.task : t)));
    } catch (err) {
      setError(err.message || 'Could not update task status.');
    } finally {
      setBusyId(null);
    }
  }

  const availableTasks = tasks.filter((t) => t.status === 'open');
  const myTasks = tasks.filter((t) => t.assigned_to === userId);

  return (
    <div id="tasks" className="space-y-6">
      <StatGrid
        stats={[
          { label: 'Available Tasks', value: availableTasks.length },
          { label: 'My Tasks', value: myTasks.length },
          { label: 'Completed', value: myTasks.filter((t) => t.status === 'completed').length },
          { label: 'In Progress', value: myTasks.filter((t) => t.status === 'in_progress').length },
        ]}
      />

      <Alert tone="error">{error}</Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Available Tasks">
          {loading ? (
            <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
          ) : availableTasks.length ? (
            <div className="space-y-1">
              {availableTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
                  <div>
                    <p className="text-sm text-fog-100">{t.title}</p>
                    <p className="font-mono text-xs text-fog-500">{t.location || 'Location not set'}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(t)}
                    disabled={busyId === t.id}
                    className="rounded-md bg-signal-teal px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-signal-teal/90 disabled:opacity-50"
                  >
                    {busyId === t.id ? 'Accepting…' : 'Accept'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No open tasks right now." />
          )}
        </Card>

        <Card title="My Tasks">
          {loading ? (
            <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
          ) : myTasks.length ? (
            <div className="space-y-1">
              {myTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
                  <div>
                    <p className="text-sm text-fog-100">{t.title}</p>
                    <p className="font-mono text-xs text-fog-500">{t.status}</p>
                  </div>
                  {NEXT_STATUS[t.status] && (
                    <button
                      onClick={() => advance(t)}
                      disabled={busyId === t.id}
                      className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium text-fog-100 hover:border-signal-teal disabled:opacity-50"
                    >
                      {busyId === t.id ? 'Updating…' : `Mark ${NEXT_STATUS[t.status]}`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="You haven't accepted any tasks yet." />
          )}
        </Card>
      </div>
    </div>
  );
}
