'use client';

import { useEffect, useState } from 'react';
import { Card, StatGrid, ListRow, EmptyState } from '../Widgets';
import IncidentReportForm from '../IncidentReportForm';
import Alert from '../../ui/Alert';
import { listIncidents } from '../../../services/incidents';

export default function CitizenIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listIncidents();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err.message || 'Could not load your incidents.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreated(incident) {
    setIncidents((list) => [incident, ...list]);
    setJustCreatedId(incident.id);
  }

  const activeCount = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;

  return (
    <div id="report" className="space-y-6">
      <StatGrid
        stats={[
          { label: 'My Reports', value: incidents.length },
          { label: 'Active', value: activeCount },
          { label: 'Nearby Shelters', value: '—' },
          { label: 'Alerts', value: 0 },
        ]}
      />

      {justCreatedId && (
        <Alert tone="success">
          Report submitted. Incident ID: <span className="font-mono">{justCreatedId}</span>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Report an Incident"
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="rounded-md bg-signal-teal px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-signal-teal/90"
            >
              + New Report
            </button>
          }
        >
          <p className="text-sm text-fog-500">
            Quickly report a hazard, injury, or disaster event in your area. Reports go directly
            to authorities for verification and rescue-team assignment.
          </p>
        </Card>

        <Card title="Emergency Information">
          <p className="text-sm text-fog-500">
            Evacuation routes, emergency contacts, and safety guidance for your registered area
            will appear here.
          </p>
        </Card>

        <div id="my-incidents" className="lg:col-span-2">
          <Card title="My Reports">
            <Alert tone="error">{error}</Alert>
            {loading ? (
              <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
            ) : incidents.length ? (
              incidents.map((i) => (
                <ListRow
                  key={i.id}
                  title={i.title}
                  meta={i.status}
                  severity={i.severity}
                />
              ))
            ) : (
              <EmptyState text="No reports yet." />
            )}
          </Card>
        </div>
      </div>

      <IncidentReportForm open={formOpen} onClose={() => setFormOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
