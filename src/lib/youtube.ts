const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function normalizeUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    return new URL(trimmedValue);
  } catch {
    try {
      return new URL(`https://${trimmedValue}`);
    } catch {
      return null;
    }
  }
}

export function getYoutubeEmbedUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const url = normalizeUrl(value);

  if (!url) {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  let videoId: string | null = null;

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/").filter(Boolean)[1] ?? null;
    }
  }

  if (hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (!videoId || !YOUTUBE_ID_PATTERN.test(videoId)) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}
