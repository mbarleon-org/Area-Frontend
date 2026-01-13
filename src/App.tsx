import React from 'react';
import Home from './pages/Home';
import ROUTES from './constants/Router';
import { CookiesProvider } from 'react-cookie';
import { ToastProvider } from './components/Toast';
import { BrowserRouter, Routes, Route } from './utils/router';
import { ApiConfigProvider } from './contexts/ApiConfigContext';

const detectIsWeb = (): boolean => {
  try {
    const { Platform } = require('react-native');
    return Platform && Platform.OS === 'web';
  } catch (e) {
    return typeof document !== 'undefined';
  }
};

const App: React.FC = () => {
  const isWeb = detectIsWeb();

  if (!isWeb) {
    try {
      const { NavigationContainer } = require('@react-navigation/native');
      let SafeAreaProvider: any = ({ children }: any) => children;
      try {
        const safe = require('react-native-safe-area-context');
        SafeAreaProvider = safe.SafeAreaProvider || SafeAreaProvider;
      } catch (e) {
        SafeAreaProvider = SafeAreaProvider;
      }
      const { createNativeStackNavigator } = require('@react-navigation/native-stack');
      const Stack = createNativeStackNavigator();

      return (
        <CookiesProvider>
          <ApiConfigProvider>
            <SafeAreaProvider>
              <ToastProvider>
                <NavigationContainer>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {ROUTES.map((r: any) => {
                      const screenName = r.label || r.path || String(r.path);
                      return (
                        <Stack.Screen key={r.path} name={screenName}>
                          {() => r.element}
                        </Stack.Screen>
                      );
                    })}
                  </Stack.Navigator>
                </NavigationContainer>
              </ToastProvider>
            </SafeAreaProvider>
          </ApiConfigProvider>
        </CookiesProvider>
      );
    } catch (e) {
      return <Home />;
    }
  }

  return (
    <CookiesProvider>
      <ApiConfigProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {ROUTES.map((r: any) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ApiConfigProvider>
    </CookiesProvider>
  );
};

export default App;
