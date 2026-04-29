export const SITE_NAME = "Kinetra";
export const ORG_NAME = "Kinetra Foundation";

export const DISCORD_URL = "https://discord.gg/kinetra";

export const DOCS_GITHUB_OWNER = "KinetraDev";
export const DOCS_GITHUB_REPO = "docs";
export const DOCS_GITHUB_BRANCH = "main";

export const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || "localhost:3000";

export const IS_LIVE =
  process.env.NODE_ENV === "production" && !SITE_HOST.includes("localhost");

export const SITE_BASE_URL = `http${IS_LIVE ? "s" : ""}://${SITE_HOST}`;

export const PLAUSIBLE_HOST = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || false;

export const METADATA_KEYWORDS_DEFAULT = [
  "Kinetra",
  "Motion Control",
  "Rust",
  "Robotics",
  "OSS",
  "OSHW",
  "Open Source",
  "Open Source Hardware",
  "Open Source Software",
];
export const METADATA_KEYWORDS_DEFAULT_DOCS = [
  "Documentation",
  "Docs",
  "User Guide",
  "Documentation",
];
