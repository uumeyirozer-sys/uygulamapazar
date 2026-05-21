"use client";

import { useState } from "react";

type ProductVisualProps = {
  accent: string;
  title: string;
  thumbnailUrl?: string | null;
  compact?: boolean;
  variant?: "simple" | "window" | "cover";
};

function FallbackVisual({ accent, title, compact = false, variant = "simple" }: ProductVisualProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${accent} ${compact ? "aspect-[16/11]" : "aspect-[16/10]"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(229,9,20,0.22),transparent_32%)]" />
      {variant !== "simple" ? (
        <div className="absolute inset-x-5 top-5 flex items-center justify-between rounded-xl border border-white/15 bg-white/12 px-4 py-3 backdrop-blur">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          </div>
          <span className="h-2 w-24 rounded-full bg-white/50" />
        </div>
      ) : null}
      <div className={`absolute border border-white/15 bg-white/12 shadow-2xl backdrop-blur ${variant === "cover" ? "bottom-5 left-5 right-5 rounded-xl p-4" : "bottom-4 left-4 right-4 rounded-xl p-3"}`}>
        <div className="mb-3 h-3 w-2/3 rounded-full bg-white/85" />
        {variant === "cover" ? <div className="mb-4 h-2 w-1/2 rounded-full bg-white/40" /> : null}
        <div className="grid grid-cols-3 gap-2">
          <div className={variant === "cover" ? "h-12 rounded-lg bg-white/20" : "h-10 rounded-lg bg-white/20"} />
          <div className={variant === "cover" ? "h-12 rounded-lg bg-white/30" : "h-10 rounded-lg bg-white/30"} />
          <div className={variant === "cover" ? "h-12 rounded-lg bg-brand-red/85" : "h-10 rounded-lg bg-brand-red/85"} />
        </div>
      </div>
      <span className="sr-only">{title} ürün görseli</span>
    </div>
  );
}

export function ProductVisual(props: ProductVisualProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const thumbnailUrl = props.thumbnailUrl?.trim();

  if (thumbnailUrl && !hasImageError) {
    return (
      <div className={`relative overflow-hidden bg-neutral-100 ${props.compact ? "aspect-[16/11]" : "aspect-[16/10]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={`${props.title} görseli`}
          title={props.title}
          data-src={thumbnailUrl}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      </div>
    );
  }

  return <FallbackVisual {...props} />;
}
