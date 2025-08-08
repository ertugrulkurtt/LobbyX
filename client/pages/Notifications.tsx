import React from 'react';
import { Bell } from 'lucide-react';
import { PlaceholderPage } from '../components/PlaceholderPage';

export default function Notifications() {
  return (
    <PlaceholderPage
      title="Bildirimler"
      description="Arkadaşlık istekleri, mesajlar ve oyun davetlerini takip et."
      icon={<Bell className="w-12 h-12 text-white" />}
    />
  );
}
