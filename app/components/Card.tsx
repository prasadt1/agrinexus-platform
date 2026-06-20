interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = "", noPadding = false }: CardProps) {
  return (
    <div className={`card ${noPadding ? "card-no-padding" : ""} ${className}`}>
      {children}
    </div>
  );
}

// CSS for cards - to be included in globals.css
export const cardStyles = `
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
}

.card-no-padding {
  padding: 0;
}
`;
