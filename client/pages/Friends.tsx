import React from 'react';
import { Users } from 'lucide-react';
import { PlaceholderPage } from '../components/PlaceholderPage';

export default function Friends() {
  return (
    <PlaceholderPage
      title="Arkadaşlar"
      description="Arkadaş ekle, çıkar ve oyun arkadaşlarınla iletişimde kal."
      icon={<Users className="w-12 h-12 text-white" />}
    />
  );
}
