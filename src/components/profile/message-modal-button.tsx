import Link from "next/link";

type MessageModalButtonProps = {
  userId?: string;
  listingId?: string;
  className?: string;
};

export function MessageModalButton({ userId, listingId, className = "btn-primary w-full sm:w-auto" }: MessageModalButtonProps) {
  const searchParams = new URLSearchParams();

  if (userId) {
    searchParams.set("to", userId);
  }

  if (listingId) {
    searchParams.set("listing", listingId);
  }

  const href = searchParams.size > 0 ? `/mesajlar?${searchParams.toString()}` : "/mesajlar";

  return (
    <Link href={href} className={className}>
      Mesaj Gönder
    </Link>
  );
}
