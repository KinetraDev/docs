import { SITE_BASE_URL } from "@/config";

export function isLinkExternal(href: string): boolean {
  return !!href?.match(/^https?:\/\//) && !href?.includes(SITE_BASE_URL);
}

export function computeStringHue(text: string): number {
  let hash = 0;
  for (const c of text) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function computeInitials(text: string): string {
  const parts = text.trim().split(/\s+/);
  return [parts.at(0), parts.at(-1)]
    .filter(Boolean)
    .map((part) => part?.charAt(0).toUpperCase())
    .join("");
}
