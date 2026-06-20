interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        <h1 className="text-page-title">{title}</h1>
        {description && (
          <p className="page-header-description">{description}</p>
        )}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}

// CSS for page header - to be included in globals.css
export const pageHeaderStyles = `
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.page-header-content {
  flex: 1;
}

.page-header-description {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.page-header-actions {
  flex-shrink: 0;
}
`;
