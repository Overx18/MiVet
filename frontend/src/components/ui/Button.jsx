// frontend/src/components/ui/button.jsx
import { cn } from "../../lib/utils";

/**
 * Componente de botón reutilizable con variantes y tamaños.
 * Compatible con Tailwind + diseño limpio tipo Shadcn/UI.
 */
export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  disabled = false,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-2xl font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
