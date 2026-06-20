import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-primary-hover)",
  },
  secondary: {
    backgroundColor: "var(--color-page-bg)",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className = "", style, children, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`btn btn-${variant} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// CSS for buttons - add to globals.css via styled component pattern
export const buttonStyles = `
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #FFFFFF;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-page-bg);
}
`;
