interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return <table className={`data-table ${className}`}>{children}</table>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="data-table-header">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="data-table-body">{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={`data-table-row ${className}`}>{children}</tr>;
}

export function TableHead({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th className={`data-table-th ${className}`} style={{ textAlign: align }}>
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
}

export function TableCell({
  children,
  className = "",
  align = "left",
  style,
  ...props
}: TableCellProps) {
  return (
    <td
      className={`data-table-td ${className}`}
      style={{ textAlign: align, ...style }}
      {...props}
    >
      {children}
    </td>
  );
}

// CSS for tables - to be included in globals.css
export const tableStyles = `
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table-header {
  background-color: var(--color-page-bg);
}

.data-table-th {
  padding: var(--space-3) var(--space-4);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table-row {
  transition: background-color 150ms ease;
}

.data-table-row:hover {
  background-color: var(--color-page-bg);
}

.data-table-td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}
`;
