'use client';

import { useEffect, useState } from 'react';
import { Card, ListRow, EmptyState } from '../Widgets';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { listResourceRequests, createResourceRequest } from '../../../services/resourceRequests';

export default function HospitalResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ resource_type: '', quantity: 1, notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.resource_type.trim()) {
      setError('Resource type is required.');
      return;
    }
    setSaving(true);
    try {
      const data = await createResourceRequest({
        resource_type: form.resource_type.trim(),
        quantity: parseInt(form.quantity, 10) || 1,
        notes: form.notes.trim() || undefined,
      });
      setRequests((list) => [data.request, ...list]);
      setForm({ resource_type: '', quantity: 1, notes: '' });
    } catch (err) {
      setError(err.message || 'Could not submit request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Resource Requests">
      <Alert tone="error">{error}</Alert>

      <form onSubmit={handleSubmit} className="mb-5 grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            id="resource_type"
            label="Resource"
            placeholder="e.g. Blood units (O-)"
            value={form.resource_type}
            onChange={(e) => setForm((f) => ({ ...f, resource_type: e.target.value }))}
          />
        </div>
        <Input
          id="quantity"
          label="Quantity"
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
        />
        <div className="flex items-end">
          <Button type="submit" loading={saving}>
            {saving ? 'Sending…' : 'Request'}
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="py-4 text-center text-sm text-fog-500">Loading…</p>
      ) : requests.length ? (
        requests.map((r) => (
          <ListRow
            key={r.id}
            title={`${r.resource_type} × ${r.quantity}`}
            meta={r.status}
            severity={r.status === 'pending' ? 'medium' : undefined}
          />
        ))
      ) : (
        <EmptyState text="No resource requests yet." />
      )}
    </Card>
  );
}
