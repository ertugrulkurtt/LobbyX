import React from 'react';
import { Construction, Sparkles } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
          {icon || <Construction className="w-12 h-12 text-white" />}
        </div>
        
        <h1 className="text-3xl font-bold text-gaming-text mb-4 flex items-center justify-center space-x-2">
          <span>{title}</span>
          <Sparkles className="w-6 h-6 text-neon-orange animate-pulse" />
        </h1>
        
        <p className="text-xl text-gaming-muted mb-8 max-w-md mx-auto">
          {description}
        </p>
        
        <div className="card-glass max-w-lg mx-auto p-6">
          <p className="text-gaming-muted mb-4">
            Bu sayfa şu anda geliştirilme aşamasında. Yakında burada harika özellikler olacak!
          </p>
          <p className="text-sm text-neon-cyan">
            Bu sayfanın içeriğini oluşturmak için bana söyleyebilirsin 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
