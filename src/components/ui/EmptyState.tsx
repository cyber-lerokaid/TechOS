import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative bg-card border border-border/50 p-4 rounded-2xl shadow-xl">
          <Icon className="w-10 h-10 text-primary opacity-80" />
        </div>
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">{description}</p>
      
      {action ? (
        action
      ) : (
        actionLabel && onAction && (
          <Button variant="premium" onClick={onAction} className="shadow-lg shadow-primary/20">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};
