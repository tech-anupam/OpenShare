export const APP_NAME = "OpenShare";

export const GITHUB_REPO = "tech-anupam/OpenShare";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const FEEDBACK_URL = `${GITHUB_URL}/issues/new`;
export const COFFEE_URL = "https://buymeacoffee.com/techanupam";

export const MAX_FILE_SIZE = 512 * 1024 * 1024;
export const MAX_PASTE_LENGTH = 500_000;

export const EXPIRY_OPTIONS = [
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "24 hours", value: 86400 },
  { label: "7 days", value: 604800 },
] as const;

export const DEFAULT_EXPIRY = 86400;

export const GREETINGS = [
  { text: "\u0928\u092E\u0938\u094D\u0924\u0947", lang: "Hindi" },
  { text: "\u3053\u3093\u306B\u3061\u306F", lang: "Japanese" },
  { text: "\uC548\uB155\uD558\uC138\uC694", lang: "Korean" },
  { text: "\u4F60\u597D", lang: "Chinese" },
  { text: "\u0633\u0644\u0627\u0645", lang: "Arabic" },
  { text: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35", lang: "Thai" },
  { text: "Merhaba", lang: "Turkish" },
  { text: "Hola", lang: "Spanish" },
  { text: "Bonjour", lang: "French" },
  { text: "Ciao", lang: "Italian" },
  { text: "Hallo", lang: "German" },
  { text: "Ol\u00E1", lang: "Portuguese" },
];

export const SOCIAL_LINKS = [
  { name: "GitHub", url: "https://github.com/tech-anupam", type: "github" },
  { name: "YouTube", url: "https://youtube.com/@tech.anupam", type: "youtube" },
  { name: "Instagram", url: "https://instagram.com/tech.anupam", type: "instagram" },
  { name: "Twitter", url: "https://x.com/AnupamBuilds", type: "twitter" },
  { name: "Discord", url: "https://discord.gg/MNCdjVcbtc", type: "discord" },
] as const;
