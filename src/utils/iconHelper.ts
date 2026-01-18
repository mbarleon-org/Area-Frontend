const MODULE_ICONS: Record<string, any> = {
  gmail: require("../../public/node_icons/gmail_logo.png"),
  imap: require("../../public/node_icons/imap_logo.png"),
  redis: require("../../public/node_icons/redis_logo.png"),
};

export const getIconForModule = (moduleName: string): any | null => {
  if (!moduleName) return null;
  const lower = moduleName.toLowerCase();

  if (lower.includes("gmail")) return MODULE_ICONS.gmail;
  if (lower.includes("imap")) return MODULE_ICONS.imap;
  if (lower.includes("redis")) return MODULE_ICONS.redis;

  return null;
};

export const getConnectionPointsForModule = (moduleName: string) => {
  const lower = moduleName.toLowerCase();
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
