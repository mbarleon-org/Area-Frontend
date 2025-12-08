const detectIsWeb = (): boolean => {
  try {
    const { Platform } = require('react-native');
    return Platform && Platform.OS === 'web';
  } catch (e) {
    return typeof document !== 'undefined';
  }
};

export const isWeb = detectIsWeb();
