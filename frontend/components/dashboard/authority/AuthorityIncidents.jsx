'use client';

import { useEffect, useState } from 'react';
import { Card, StatGrid, ListRow, EmptyState } from '../Widgets';
import Alert from '../../ui/Alert';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { listIncidents, patchIncidentStatus } from '../../../services/incidents';
import { listRescueTeams } from '../../../services/rescueTeams';
import { createAssignment } from '../../../services/rescueAssignments';

export default function AuthorityIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignTarget, setAssignTarget] = useState(null); // incident being assigned
  const [selectedTeam, setSelectedTeam] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [incData, teamData] = await Promise.all([listIncidents(), listRescueTeams()]);
      setIncidents(incData.incidents || []);
      setTeams(teamData.rescueTeams || []);
    } catch (err) {
      setError(err.message || 'Could not load incidents.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleVerify(incident) {
    setBusyId(incident.id);
    setActionError('');
    try {
      const data = await patchIncidentStatus(incident.id, 'verified');
      setIncidents((list) => list.map((i) => (i.id === incident.id ? data.incident : i)));
    } catch (err) {
      setActionError(err.message || 'Could not verify incident.');
    } finally {
      setBusyId(null);
    }
  }

  function openAssign(incident) {
    setAssignTarget(incident);
    setSelectedTeam('');
    setActionError('');
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedTeam) return;
    setBusyId(assignTarget.id);
    setActionError('');
    try {
      await createAssignment(assignTarget.id, selectedTeam);
      await load();
      setAssignTarget(null);
    } catch (err) {
      setActionError(err.message || 'Could not assign rescue team.');
    } finally {
      setBusyId(null);
    }
  }

  const critical = incidents.filter((i) => i.severity === 'critical').length;
  const active = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const availableTeams = teams.filter((t) => t.status === 'available');

  return (
    <div id="incidents" className="space-y-6">
      <StatGrid
        stats={[
          { label: 'Active Incidents', value: active },
          { label: 'Critical', value: critical },
          { label: 'Rescue Teams', value: teams.length },
          { label: 'Available Teams', value: availableTeams.length },
        ]}
      />

      <Alert tone="error">{error || actionError}</Alert>

      <Card title="Active Incidents">
        {loading ? (
          <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
        ) : incidents.length ? (
          <div className="space-y-1">
            {incidents.map((i) => (
              <div key={i.id} className="flex items-center justify-between border-b border-ink-700 py-3 last:border-0">
                <div>
                  <p className="text-sm text-fog-100">{i.title}</p>
                  <p className="font-mono text-xs text-fog-500">
                    {i.severity} · {i.status} · {i.disaster_type || 'unclassified'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {i.status === 'reported' && (
                    <button
                      onClick={() => handleVerify(i)}
                      disabled={busyId === i.id}
                      className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium text-fog-100 hover:border-signal-teal disabled:opacity-50"
                    >
                      {busyId === i.id ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                  {i.status === 'verified' && (
                    <button
                      onClick={() => openAssign(i)}
                      className="rounded-md bg-signal-teal px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-signal-teal/90"
                    >
                      Assign Team
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No incidents reported yet." />
        )}
      </Card>

      <div id="teams">
        <Card title="Rescue Team Allocation">
          {teams.length ? (
            teams.map((t) => (
              <ListRow key={t.id} title={t.team_name} meta={t.status} severity={t.status === 'deployed' ? 'critical' : undefined} />
            ))
          ) : (
            <EmptyState text="No rescue teams registered yet." />
          )}
        </Card>
      </div>

      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title="Assign Rescue Team">
        {assignTarget && (
          <form onSubmit={handleAssign} className="space-y-4">
            <p className="text-sm text-fog-300">
              Assigning a team to: <span className="font-medium text-fog-100">{assignTarget.title}</span>
            </p>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-fog-100 focus:border-signal-teal"
            >
              <option value="">Select an available team…</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </select>
            {availableTeams.length === 0 && (
              <p className="text-xs text-signal-amber">No teams are currently available.</p>
            )}
            <Button type="submit" disabled={!selectedTeam} loading={busyId === assignTarget.id}>
              Assign
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
