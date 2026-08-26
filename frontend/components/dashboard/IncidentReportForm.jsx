'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { createIncident } from '../../services/incidents';

const DISASTER_TYPES = ['flood', 'fire', 'earthquake', 'storm', 'medical', 'structural', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function IncidentReportForm({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    disaster_type: 'other',
    severity: 'medium',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      update('latitude', pos.coords.latitude.toFixed(6));
      update('longitude', pos.coords.longitude.toFixed(6));
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        disaster_type: form.disaster_type,
        severity: form.severity,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };
      const data = await createIncident(payload);
      onCreated(data.incident);
      setForm({ title: '', description: '', disaster_type: 'other', severity: 'medium', latitude: '', longitude: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not submit report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Report an Emergency">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert tone="error">{error}</Alert>

        <Input
          id="title"
          label="Title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Severe flooding near MG Road"
        />

        <div>
          <label htmlFor="description" className="mb-1.5 block text-xs font-medium uppercase tracking-tag text-fog-500">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-fog-100 placeholder:text-fog-500 focus:border-signal-teal focus-visible:outline-2 focus-visible:outline-offset-2"
            placeholder="What's happening? Any immediate danger?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="disaster_type" className="mb-1.5 block text-xs font-medium uppercase tracking-tag text-fog-500">
              Type
            </label>
            <select
              id="disaster_type"
              value={form.disaster_type}
              onChange={(e) => update('disaster_type', e.target.value)}
              className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-fog-100 focus:border-signal-teal"
            >
              {DISASTER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="severity" className="mb-1.5 block text-xs font-medium uppercase tracking-tag text-fog-500">
              Severity
            </label>
            <select
              id="severity"
              value={form.severity}
              onChange={(e) => update('severity', e.target.value)}
              className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-fog-100 focus:border-signal-teal"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-tag text-fog-500">Location (optional)</label>
            <button type="button" onClick={useMyLocation} className="text-xs font-medium text-signal-teal hover:underline">
              Use my location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="latitude"
              label="Latitude"
              value={form.latitude}
              onChange={(e) => update('latitude', e.target.value)}
              placeholder="19.2000"
            />
            <Input
              id="longitude"
              label="Longitude"
              value={form.longitude}
              onChange={(e) => update('longitude', e.target.value)}
              placeholder="72.9000"
            />
          </div>
        </div>

        <Button type="submit" loading={loading}>
          {loading ? 'Submitting…' : 'Submit Report'}
        </Button>
      </form>
    </Modal>
  );
}
