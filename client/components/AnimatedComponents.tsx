import React from 'react';
import { cn } from '../lib/utils';

// Floating Action Button with 3D effect
interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function FloatingButton({ children, onClick, className, variant = 'primary' }: FloatingButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-br from-neon-purple to-neon-cyan hover:shadow-glow',
    secondary: 'bg-gradient-to-br from-neon-orange to-neon-pink hover:shadow-glow-pink',
    accent: 'bg-gradient-to-br from-neon-green to-neon-cyan hover:shadow-glow-cyan'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-3d transition-all duration-300 hover:scale-110 active:scale-95 transform-3d',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

// Animated Card with hover effects
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt';
  delay?: number;
}

export function AnimatedCard({ children, className, hoverEffect = 'lift', delay = 0 }: AnimatedCardProps) {
  const hoverEffects = {
    lift: 'hover:transform hover:-translate-y-2 hover:shadow-3d',
    glow: 'hover:shadow-glow',
    scale: 'hover:scale-105',
    tilt: 'hover:rotate-1 hover:scale-105'
  };

  return (
    <div
      className={cn(
        'card-glass transition-all duration-500 animate-fade-in-up',
        hoverEffects[hoverEffect],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// Pulse Indicator
interface PulseIndicatorProps {
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function PulseIndicator({ color = 'green', size = 'md', label }: PulseIndicatorProps) {
  const colors = {
    green: 'bg-neon-green',
    red: 'bg-red-500',
    yellow: 'bg-neon-orange',
    blue: 'bg-neon-blue',
    purple: 'bg-neon-purple'
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn('rounded-full animate-pulse', colors[color], sizes[size])} 
           style={{ boxShadow: `0 0 10px ${color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'yellow' ? '#f97316' : color === 'blue' ? '#3b82f6' : '#a855f7'}` }} />
      {label && <span className="text-sm text-gaming-muted">{label}</span>}
    </div>
  );
}

// Loading Spinner with neon effect
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'cyan' | 'pink';
}

export function LoadingSpinner({ size = 'md', color = 'purple' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colors = {
    purple: 'border-neon-purple',
    cyan: 'border-neon-cyan',
    pink: 'border-neon-pink'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-transparent border-t-current',
      sizes[size],
      colors[color]
    )} />
  );
}

// Animated Progress Bar
interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: 'purple' | 'cyan' | 'green' | 'orange';
  showValue?: boolean;
  label?: string;
}

export function AnimatedProgress({ value, max = 100, color = 'purple', showValue = true, label }: AnimatedProgressProps) {
  const percentage = (value / max) * 100;
  
  const colors = {
    purple: 'from-neon-purple to-neon-pink',
    cyan: 'from-neon-cyan to-neon-blue',
    green: 'from-neon-green to-neon-cyan',
    orange: 'from-neon-orange to-neon-pink'
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gaming-text">{label}</span>
          {showValue && <span className="text-gaming-muted">{value}/{max}</span>}
        </div>
      )}
      <div className="w-full bg-gaming-surface rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full bg-gradient-to-r transition-all duration-1000 ease-out', colors[color])}
          style={{ 
            width: `${percentage}%`,
            boxShadow: `0 0 10px ${color === 'purple' ? '#a855f7' : color === 'cyan' ? '#06b6d4' : color === 'green' ? '#22c55e' : '#f97316'}`
          }}
        />
      </div>
    </div>
  );
}

// Notification Toast
interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function NotificationToast({ title, message, type = 'info', onClose }: NotificationToastProps) {
  const types = {
    success: { bg: 'from-neon-green/20 to-neon-cyan/20', border: 'border-neon-green/30', icon: '✓' },
    error: { bg: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30', icon: '✕' },
    warning: { bg: 'from-neon-orange/20 to-yellow-500/20', border: 'border-neon-orange/30', icon: '⚠' },
    info: { bg: 'from-neon-blue/20 to-neon-cyan/20', border: 'border-neon-blue/30', icon: 'ℹ' }
  };

  const config = types[type];

  return (
    <div className={cn(
      'fixed top-4 right-4 p-4 rounded-xl backdrop-blur-xl border max-w-sm animate-slide-in-right z-50',
      `bg-gradient-to-br ${config.bg}`,
      config.border
    )}>
      <div className="flex items-start space-x-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gaming-text">{title}</h4>
          <p className="text-sm text-gaming-muted mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gaming-muted hover:text-gaming-text transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Typing Animation
interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypingAnimation({ text, speed = 50, className }: TypingAnimationProps) {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
