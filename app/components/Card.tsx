interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", noPadding = false, style }: CardProps) {
  return (
    <div className={`card ${noPadding ? "card-no-padding" : ""} ${className}`} style={style}>
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
