'use client';

import { useState } from 'react';
import { Card } from '../Widgets';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { createVolunteerTask } from '../../../services/volunteerTasks';

export default function AuthorityPostTask() {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (form.title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    setSaving(true);
    try {
      await createVolunteerTask({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
      });
      setForm({ title: '', description: '', location: '' });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not create task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Post a Volunteer Task">
      <Alert tone="error">{error}</Alert>
      {success && <Alert tone="success">Task posted — volunteers can now see and accept it.</Alert>}
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Input
            id="task_title"
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Distribute supplies"
          />
        </div>
        <div className="sm:col-span-1">
          <Input
            id="task_location"
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Sector 4 Shelter"
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <Button type="submit" loading={saving}>
            {saving ? 'Posting…' : 'Post Task'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
