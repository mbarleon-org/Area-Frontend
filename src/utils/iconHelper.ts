import { assetPath } from "./assets";

export const getIconForModule = (moduleName: string): string | null => {
  const lower = moduleName.toLowerCase();
  if (lower.includes("gmail")) return assetPath("/node_icons/gmail_logo.png");
  if (lower.includes("imap")) return assetPath("/node_icons/imap_logo.png");
  if (lower.includes("redis")) return assetPath("/node_icons/redis_logo.png");
  return null;
};
