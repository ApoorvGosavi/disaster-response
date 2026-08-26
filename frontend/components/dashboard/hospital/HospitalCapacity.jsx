'use client';

import { useEffect, useState } from 'react';
import { Card, StatGrid } from '../Widgets';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { listHospitals, updateHospital } from '../../../services/hospitals';

export default function HospitalCapacity({ userId }) {
  const [hospital, setHospital] = useState(null);
  const [form, setForm] = useState({ total_beds: '', available_beds: '', icu_available: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listHospitals();
      const mine = (data.hospitals || []).find((h) => h.managed_by === userId);
      if (mine) {
        setHospital(mine);
        setForm({
          total_beds: mine.total_beds ?? '',
          available_beds: mine.available_beds ?? '',
          icu_available: mine.icu_available ?? '',
        });
      }
    } catch (err) {
      setError(err.message || 'Could not load hospital record.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hospital) {
      setError('No hospital resource record is linked to your account yet. Ask an admin to create one and set managed_by to your user id.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const data = await updateHospital(hospital.id, {
        total_beds: form.total_beds === '' ? undefined : parseInt(form.total_beds, 10),
        available_beds: form.available_beds === '' ? undefined : parseInt(form.available_beds, 10),
        icu_available: form.icu_available === '' ? undefined : parseInt(form.icu_available, 10),
      });
      setHospital(data.hospital);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not update capacity.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id="capacity" className="space-y-6">
      <StatGrid
        stats={[
          { label: 'Total Beds', value: hospital?.total_beds ?? '—' },
          { label: 'Available Beds', value: hospital?.available_beds ?? '—' },
          { label: 'ICU Available', value: hospital?.icu_available ?? '—' },
          { label: 'Incoming', value: 0 },
        ]}
      />

      <Card title="Update Capacity">
        <Alert tone="error">{error}</Alert>
        {success && <Alert tone="success">Capacity updated.</Alert>}

        {loading ? (
          <p className="py-6 text-center text-sm text-fog-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <Input
              id="total_beds"
              label="Total Beds"
              type="number"
              min="0"
              value={form.total_beds}
              onChange={(e) => setForm((f) => ({ ...f, total_beds: e.target.value }))}
            />
            <Input
              id="available_beds"
              label="Available Beds"
              type="number"
              min="0"
              value={form.available_beds}
              onChange={(e) => setForm((f) => ({ ...f, available_beds: e.target.value }))}
            />
            <Input
              id="icu_available"
              label="ICU Available"
              type="number"
              min="0"
              value={form.icu_available}
              onChange={(e) => setForm((f) => ({ ...f, icu_available: e.target.value }))}
            />
            <div className="sm:col-span-3">
              <Button type="submit" loading={saving}>
                {saving ? 'Saving…' : 'Save Capacity'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
