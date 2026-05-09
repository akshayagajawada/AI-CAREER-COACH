"use client";
import { useState } from 'react';

export default function CareerGoalForm({ onCreated, initial = null, onUpdated, onDeleted, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.split('T')[0] : '');
  const [milestones, setMilestones] = useState(
    initial?.milestones?.length ? initial.milestones.map(m => ({ id: m.id, title: m.title || '', notes: m.notes || '', dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : '', done: !!m.done })) : [{ title: '' }]
  );
  const [loading, setLoading] = useState(false);

  const addMilestone = () => setMilestones([...milestones, { title: '' }]);
  const updateMilestone = (i, value) => {
    const copy = [...milestones];
    copy[i] = { ...copy[i], title: value };
    setMilestones(copy);
  };

  const updateMilestoneField = (i, key, value) => {
    const copy = [...milestones];
    copy[i] = { ...copy[i], [key]: value };
    setMilestones(copy);
  };

  const removeMilestone = (i, markForDelete = false) => {
    const copy = [...milestones];
    if (markForDelete && copy[i]?.id) {
      // mark for deletion but keep in UI so PUT can handle deletion
      copy[i] = { ...copy[i], _delete: true };
    } else {
      copy.splice(i, 1);
    }
    setMilestones(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // filter out empty/whitespace-only milestones
      const filteredMilestones = (milestones || [])
        .map(m => ({ ...m, title: m.title?.toString().trim() }))
        .filter(m => m.title && m.title.length > 0)
        .map(m => ({ id: m.id, title: m.title, notes: m.notes || '', dueDate: m.dueDate || null, done: !!m.done, _delete: m._delete }));

      if (initial && initial.id) {
        const res = await fetch(`/api/career-goals/${initial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, dueDate: dueDate || null, milestones: filteredMilestones }),
        });
        const data = await res.json();
        if (res.ok) {
          onUpdated && onUpdated(data.goal);
        } else {
          alert(data.error || 'Failed to update');
        }
      } else {
        const res = await fetch('/api/career-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, dueDate: dueDate || null, milestones: filteredMilestones }),
        });
        const data = await res.json();
        if (res.ok) {
          setTitle(''); setDescription(''); setDueDate(''); setMilestones([{ title: '' }]);
          onCreated && onCreated(data.goal);
        } else {
          alert(data.error || 'Failed to create');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/career-goals/${initial.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted && onDeleted(initial.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Goal title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2 text-lg" placeholder="Become Senior Backend Engineer" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2 text-base" placeholder="What you want to achieve" />
      </div>
      <div>
        <label className="block text-sm font-medium">Target date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Milestones</label>
        <div className="space-y-2 mt-2">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex gap-2">
                <input value={m.title} onChange={(e) => updateMilestone(idx, e.target.value)} placeholder={`Milestone ${idx+1}`} className="flex-1 rounded-md border px-3 py-2 text-base" />
                <button type="button" onClick={() => removeMilestone(idx)} className="text-base text-red-600 px-2 py-1">Remove</button>
            </div>
          ))}
            <button type="button" onClick={addMilestone} className="text-base text-blue-600">+ Add milestone</button>
        </div>
      </div>

      <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-5 py-2 text-base">{loading ? (initial ? 'Saving...' : 'Creating...') : (initial ? 'Save' : 'Create Goal')}</button>
          {initial && <button type="button" onClick={handleDelete} disabled={loading} className="rounded bg-red-600 text-white px-5 py-2 text-base">Delete</button>}
          {initial && onCancel && <button type="button" onClick={onCancel} className="rounded bg-gray-200 px-5 py-2 text-base">Cancel</button>}
      </div>
    </form>
  );
}
