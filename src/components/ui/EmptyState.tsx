import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="text-muted">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
