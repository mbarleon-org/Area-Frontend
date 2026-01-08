export const assetPath = (relativePath: string): string => {
  const cleaned = relativePath.replace(/^\/+/, "");
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return `${window.location.origin}/${cleaned}`;
  }
  return `/${cleaned}`;
};

export const resolveAsset = (p: string): any => {
  try {
    return assetPath(p);
  } catch (e) {
    return p;
  }
};

export default {
  assetPath,
  resolveAsset,
};
