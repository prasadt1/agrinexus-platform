type BadgeStatus = "active" | "draft" | "paused" | "expired" | "attention";

interface BadgeProps {
  status: BadgeStatus;
  children?: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const label = children || status;
  return <span className={`badge badge-${status}`}>{label}</span>;
}

// CSS for badges - to be included in globals.css
export const badgeStyles = `
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: var(--radius-full);
  text-transform: capitalize;
}

.badge-active {
  background-color: var(--color-status-active-bg);
  color: var(--color-status-active);
}

.badge-draft {
  background-color: var(--color-status-draft-bg);
  color: var(--color-status-draft);
}

.badge-paused,
.badge-attention {
  background-color: var(--color-status-attention-bg);
  color: var(--color-status-attention);
}

.badge-expired {
  background-color: var(--color-status-draft-bg);
  color: var(--color-text-muted);
}
`;
