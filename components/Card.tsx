import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// card props
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

// variant styles
const variantStyles = {
  default: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
  bordered: "bg-transparent border-2 border-neutral-200 dark:border-neutral-700",
  elevated: "bg-white dark:bg-neutral-900 shadow-md dark:shadow-neutral-900/50",
  ghost: "bg-neutral-50 dark:bg-neutral-800/50",
};

// padding styles
const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// card
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          variantStyles[variant],
          paddingStyles[padding],
          hover &&
            "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-components
function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-neutral-900 dark:text-white leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
