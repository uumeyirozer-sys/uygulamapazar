import type { ComponentPropsWithoutRef, ReactNode } from "react";

type CardProps = ComponentPropsWithoutRef<"article"> & {
  children: ReactNode;
};

type DivProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

type HeadingProps = ComponentPropsWithoutRef<"h3"> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article className={["market-card overflow-hidden", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </article>
  );
}

export function CardHeader({ children, className, ...props }: DivProps) {
  return (
    <div className={["space-y-2 border-b border-neutral-100 p-5", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HeadingProps) {
  return (
    <h3 className={["card-title", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: DivProps) {
  return (
    <div className={["p-5", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
