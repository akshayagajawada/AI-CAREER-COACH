import SettingsPanel from '@/components/settings-panel';
import { getUserSettings } from '@/actions/user';

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <SettingsPanel initialAutoTranslate={settings?.autoTranslate ?? true} />
    </div>
  );
}