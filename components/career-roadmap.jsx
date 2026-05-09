"use client";
import { useEffect, useState } from 'react';
import CareerGoalForm from './career-goal-form';

export default function CareerRoadmap() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/career-goals');
      const data = await res.json();
      if (res.ok) setGoals(data.goals || []);
      else console.error(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreated = (goal) => { setGoals((g) => [goal, ...g]); };

  const handleUpdated = (goal) => {
    setGoals((prev) => prev.map(g => (g.id === goal.id ? goal : g)));
    setEditingGoal(null);
  };

  const handleDeleted = (id) => {
    setGoals((prev) => prev.filter(g => g.id !== id));
    if (editingGoal?.id === id) setEditingGoal(null);
  };

  const toggleMilestone = async (milestone) => {
    try {
      const updated = { ...milestone, done: !milestone.done };
      // fetch API to update milestone via goal PUT
      const res = await fetch(`/api/career-goals/${milestone.goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: [updated] }),
      });
      const data = await res.json();
      if (res.ok) {
        setGoals((prev) => prev.map((g) => (g.id === data.goal.id ? data.goal : g)));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Create Career Goal</h2>
        <CareerGoalForm onCreated={handleCreated} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Your Goals</h2>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {goals.length === 0 && <div className="text-sm text-muted-foreground">No goals yet.</div>}
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                    {goal.description && <p className="text-base text-gray-700">{goal.description}</p>}
                    {goal.dueDate && <p className="text-sm mt-1 text-gray-700">Target: {new Date(goal.dueDate).toLocaleDateString()}</p>}
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-lg font-semibold text-gray-900">Milestones</h4>
                  <div className="mt-2 mb-2">
                    {/* progress */}
                    {goal.milestones?.length > 0 && (() => {
                      const total = goal.milestones.length;
                      const done = goal.milestones.filter(m => m.done).length;
                      const pct = Math.round((done / total) * 100);
                      return (
                        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden mb-2">
                          <div className={`h-2 ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-yellow-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setEditingGoal(goal)} className="text-sm text-blue-600">Edit</button>
                    <button onClick={async () => {
                      if (!confirm('Delete this goal?')) return;
                      try {
                        const res = await fetch(`/api/career-goals/${goal.id}`, { method: 'DELETE' });
                        if (res.ok) setGoals((prev) => prev.filter(g => g.id !== goal.id));
                        else {
                          const data = await res.json();
                          alert(data.error || 'Failed to delete');
                        }
                      } catch (err) { console.error(err); alert('Error deleting'); }
                    }} className="text-sm text-red-600">Delete</button>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {goal.milestones.map((m) => (
                      <li key={m.id} className="flex items-center justify-between">
                        <div>
                          <label className={`mr-2 text-base ${m.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{m.title}</label>
                          {m.dueDate && <span className="text-sm text-gray-600"> — {new Date(m.dueDate).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleMilestone({ ...m, goalId: goal.id })} className="text-base text-blue-600 px-2 py-1">{m.done ? 'Undo' : 'Done'}</button>
                          <button onClick={async () => {
                            // delete milestone
                            try {
                              const res = await fetch(`/api/career-goals/${goal.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ milestones: [{ id: m.id, _delete: true }] }),
                              });
                              const data = await res.json();
                              if (res.ok) setGoals(prev => prev.map(g => (g.id === data.goal.id ? data.goal : g)));
                              else console.error(data);
                            } catch (err) { console.error(err); }
                          }} className="ml-2 text-base text-red-600 px-2 py-1">Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {editingGoal && editingGoal.id === goal.id && (
                  <div className="mt-3 bg-gray-50 p-3 rounded">
                    <CareerGoalForm initial={editingGoal} onUpdated={handleUpdated} onDeleted={handleDeleted} onCancel={() => setEditingGoal(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
