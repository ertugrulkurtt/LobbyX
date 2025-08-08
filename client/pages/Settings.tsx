import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { PlaceholderPage } from '../components/PlaceholderPage';

export default function Settings() {
  return (
    <PlaceholderPage
      title="Ayarlar"
      description="Hesap ayarları, gizlilik seçenekleri ve bildirim tercihlerini yönet."
      icon={<SettingsIcon className="w-12 h-12 text-white" />}
    />
  );
}
