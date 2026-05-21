const turkishCharacterMap: Record<string, string> = {
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ş: "s",
  Ş: "s",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c"
};

export function slugifyTr(value: string): string {
  return value
    .trim()
    .split("")
    .map((character) => turkishCharacterMap[character] ?? character)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
