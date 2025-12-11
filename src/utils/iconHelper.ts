import { assetPath } from "./assets";

export const getIconForModule = (moduleName: string): string | null => {
  const lower = moduleName.toLowerCase();
  // Custom choose icon based on module type/name
  if (lower.includes("gmail")) return assetPath("/node_icons/gmail_logo.png");
  if (lower.includes("imap")) return assetPath("/node_icons/imap_logo.png");
  if (lower.includes("redis")) return assetPath("/node_icons/redis_logo.png");
  return null;
};

export const getConnectionPointsForModule = (moduleName: string) => {
  const lower = moduleName.toLowerCase();
  // Custom connection points based on module type/name
  if (lower.includes("redis")) {
    return [
      { side: 'left' as const, offset: 0 },
      { side: 'right' as const, offset: 0 },
    ];
  }
  // Default configuration: four sides
  return [
    { side: 'left' as const, offset: 0 },
    { side: 'right' as const, offset: 0 },
    { side: 'top' as const, offset: 0 },
    { side: 'bottom' as const, offset: 0 },
  ];
};
