import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={["app-container", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
