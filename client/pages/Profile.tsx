import React from 'react';
import { User } from 'lucide-react';
import { PlaceholderPage } from '../components/PlaceholderPage';

export default function Profile() {
  return (
    <PlaceholderPage
      title="Profilim"
      description="Profilini düzenle, oyun istatistiklerini gör ve bio'nu güncelle."
      icon={<User className="w-12 h-12 text-white" />}
    />
  );
}
