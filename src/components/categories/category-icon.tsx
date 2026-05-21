import type { ReactNode } from "react";

type CategoryIconProps = {
  type: string;
  className?: string;
};

const iconClassName = "block h-6 w-6 max-h-6 max-w-6 shrink-0 overflow-hidden";

function IconSvg({
  children,
  className = iconClassName
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{
        width: "24px",
        height: "24px",
        maxWidth: "24px",
        maxHeight: "24px",
        minWidth: "24px",
        minHeight: "24px",
        flexShrink: 0,
        overflow: "hidden"
      }}
    >
      {children}
    </svg>
  );
}

export function CategoryIcon({ type, className = iconClassName }: CategoryIconProps) {
  if (type === "game") {
    return (
      <IconSvg className={className}>
        <path d="M7 14h3m-1.5-1.5v3m6-1.5h.01m2.49 0h.01M6.2 9.5h11.6c1.1 0 2 .8 2.2 1.9l.8 4.6a2.5 2.5 0 0 1-4.2 2.2l-1.5-1.4H8.9l-1.5 1.4A2.5 2.5 0 0 1 3.2 16l.8-4.6c.2-1.1 1.1-1.9 2.2-1.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </IconSvg>
    );
  }

  if (type === "code") {
    return (
      <IconSvg className={className}>
        <path d="m8.5 8-4 4 4 4m7-8 4 4-4 4M13 6l-2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </IconSvg>
    );
  }

  if (type === "ai") {
    return (
      <IconSvg className={className}>
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M7.8 7.8 5.7 5.7m12.6 12.6-2.1-2.1m0-8.4 2.1-2.1M5.7 18.3l2.1-2.1M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </IconSvg>
    );
  }

  if (type === "design") {
    return (
      <IconSvg className={className}>
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10v6H6.5A2.5 2.5 0 0 1 4 7.5v-1Zm6-2.5h3.5a2.5 2.5 0 0 1 0 5H10V4Zm0 6h3.5a2.5 2.5 0 0 1 0 5H10v-5Zm-6 2.5A2.5 2.5 0 0 1 6.5 10H10v10H6.5A2.5 2.5 0 0 1 4 17.5v-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </IconSvg>
    );
  }

  if (type === "wp") {
    return (
      <IconSvg className={className}>
        <path d="M4.5 7.5h15m-12 0 3 9m0-9 3 9m0-9 3 9M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </IconSvg>
    );
  }

  return (
    <IconSvg className={className}>
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 13h6M9 7h6v6H9V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}
