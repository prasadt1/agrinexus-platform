interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// CSS for empty state - to be included in globals.css
export const emptyStateStyles = `
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
}

.empty-state-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-2) 0;
}

.empty-state-description {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 320px;
  margin: 0 auto;
}

.empty-state-action {
  margin-top: var(--space-4);
}
`;
