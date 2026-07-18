import React from 'react';
import { cn } from '@/lib/utils';

type SummaryCardProps = {
  title: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  variant = 'default',
  className 
}) => {
  const variants = {
    default: 'bg-card text-card-foreground border-border',
    success: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-secondary/10 text-secondary border-secondary/20',
    danger: 'bg-destructive/10 text-destructive border-destructive/20',
    neutral: 'bg-muted text-foreground border-border',
  };

  const valueColors = {
    default: 'text-foreground',
    success: 'text-primary',
    warning: 'text-secondary',
    danger: 'text-destructive',
    neutral: 'text-foreground',
  };

  return (
    <div className={cn("p-5 rounded-2xl border shadow-sm flex flex-col gap-2", variants[variant], className)}>
      <div className="flex items-center justify-between opacity-80">
        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
      <div className={cn("text-3xl font-bold tracking-tight mt-1", valueColors[variant])}>
        {value}
      </div>
    </div>
  );
};
