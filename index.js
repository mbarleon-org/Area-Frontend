console.log('[index] start');
try {
  console.log('[index] require expo...');
  const { registerRootComponent } = require('expo');
  console.log('[index] require ./App...');
  let App;
  try {
    App = require('./App').default || require('./App');
    console.log('[index] ./App loaded');
  } catch (reqErr) {
    console.error('[index] failed to require ./App:', reqErr && reqErr.stack ? reqErr.stack : reqErr);
    throw reqErr;
  }
  console.log('[index] calling registerRootComponent');
  registerRootComponent(App);
  console.log('[index] registerRootComponent called');
} catch (e) {
  console.error('[index] expo registration failed:', e && e.stack ? e.stack : e);
  try {
    console.error('Failed to register via expo.registerRootComponent:', e && e.stack ? e.stack : e);
  } catch {}

  try {
    const { AppRegistry } = require('react-native');
    const App = require('./App').default || require('./App');
    AppRegistry.registerComponent('main', () => App);
  } catch (innerErr) {
    try {
      console.error('Failed to register via AppRegistry:', innerErr && innerErr.stack ? innerErr.stack : innerErr);
    } catch {}
    throw innerErr;
  }
}
console.log('[index] end');
