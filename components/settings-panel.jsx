"use client";

import { useState } from 'react';
import useFetch from '@/hooks/use-fetch';
import { setAutoTranslate } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPanel({ initialAutoTranslate = true }) {
  const [autoTranslate, setAutoTranslateLocal] = useState(initialAutoTranslate);

  const { loading, fn } = useFetch(setAutoTranslate);

  const handleSave = async () => {
    try {
      await fn({ enabled: autoTranslate });
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving preference', error);
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">AI Auto-Translation</h3>
          <p className="text-sm text-muted-foreground">Automatically translate resumes when creating new language versions.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslateLocal(e.target.checked)}
            />
          </label>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}