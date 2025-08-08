import React from 'react';
import { MessageSquare } from 'lucide-react';
import { PlaceholderPage } from '../components/PlaceholderPage';

export default function Chat() {
  return (
    <PlaceholderPage
      title="Sohbet Odaları"
      description="Arkadaşlarınla gerçek zamanlı sohbet et, takım kur ve oyun planları yap."
      icon={<MessageSquare className="w-12 h-12 text-white" />}
    />
  );
}
