try {
  const { registerRootComponent } = require('expo');
  let App;
  try {
    App = require('./App').default || require('./App');
  } catch (reqErr) {
    console.error('[index] failed to require ./App:', reqErr && reqErr.stack ? reqErr.stack : reqErr);
    throw reqErr;
  }
  registerRootComponent(App);
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
