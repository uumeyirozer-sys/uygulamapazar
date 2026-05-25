"use client";

import { useState } from "react";

type AdminAction = "İncele" | "Onayla" | "Reddet";

type AdminActionsProps = {
  listingId: string;
  listingTitle: string;
  onInspect: (listingId: string) => void;
  onStatusChange: (listingId: string, status: "approved" | "rejected") => Promise<void>;
};

const actions: AdminAction[] = ["İncele", "Onayla", "Reddet"];

export function AdminActions({ listingId, listingTitle, onInspect, onStatusChange }: AdminActionsProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: AdminAction) {
    setMessage("");

    if (action === "İncele") {
      onInspect(listingId);
      setMessage(`${listingTitle} ilanı açıldı.`);
      return;
    }

    setIsLoading(true);

    try {
      await onStatusChange(listingId, action === "Onayla" ? "approved" : "rejected");
      setMessage(action === "Onayla" ? "İlan onaylandı." : "İlan reddedildi.");
    } catch {
      setMessage("İşlem tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => void handleAction(action)}
            disabled={isLoading}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
              action === "Onayla"
                ? "bg-red-50 text-brand-red hover:bg-red-100"
                : action === "Reddet"
                  ? "bg-neutral-950 text-brand-white hover:bg-neutral-800"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {action}
          </button>
        ))}
      </div>
      {message ? <p className="text-xs font-bold text-brand-red">{message}</p> : null}
    </div>
  );
}
