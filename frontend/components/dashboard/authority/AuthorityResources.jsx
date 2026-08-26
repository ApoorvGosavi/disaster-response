'use client';

import { useEffect, useState } from 'react';
import { Card, ListRow, EmptyState } from '../Widgets';
import Alert from '../../ui/Alert';
import { listHospitals } from '../../../services/hospitals';
import { listShelters } from '../../../services/shelters';

export default function AuthorityResources() {
  const [hospitals, setHospitals] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [h, s] = await Promise.all([listHospitals(), listShelters()]);
        setHospitals(h.hospitals || []);
        setShelters(s.shelters || []);
      } catch (err) {
        setError(err.message || 'Could not load hospital/shelter data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Alert tone="error">{error}</Alert>

      <div id="hospitals">
        <Card title="Hospital Overview">
          {loading ? (
            <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
          ) : hospitals.length ? (
            hospitals.map((h) => (
              <ListRow
                key={h.id}
                title={h.name}
                meta={`${h.available_beds ?? 0}/${h.total_beds ?? 0} beds · ICU ${h.icu_available ?? 0}`}
                severity={(h.available_beds ?? 0) < 5 ? 'high' : undefined}
              />
            ))
          ) : (
            <EmptyState text="No hospitals registered yet." />
          )}
        </Card>
      </div>

      <div id="shelters">
        <Card title="Shelter Overview">
          {loading ? (
            <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
          ) : shelters.length ? (
            shelters.map((s) => (
              <ListRow
                key={s.id}
                title={s.name}
                meta={`${s.current_occupancy ?? 0}/${s.capacity ?? 0} occupied`}
              />
            ))
          ) : (
            <EmptyState text="No shelters registered yet." />
          )}
        </Card>
      </div>
    </div>
  );
}
