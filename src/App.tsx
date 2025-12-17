import React from 'react';
import Home from './pages/Home';
import ROUTES from './constants/Router';
import { CookiesProvider } from 'react-cookie';
import { ToastProvider } from './components/Toast';
import { BrowserRouter, Routes, Route } from './utils/router';

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
          <SafeAreaProvider>
            <ToastProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {ROUTES.map((r: any) => {
                    const Component = (r.element as any)?.type || (() => r.element);
                    // use r.label or a safe key as screen name
                    const screenName = r.label || r.path || String(r.path);
                    return <Stack.Screen key={r.path} name={screenName} component={Component} />;
                  })}
                </Stack.Navigator>
              </NavigationContainer>
            </ToastProvider>
          </SafeAreaProvider>
        </CookiesProvider>
      );
    } catch (e) {
      return <Home />;
    }
  }

  return (
    <CookiesProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {ROUTES.map((r: any) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CookiesProvider>
  );
};

export default App;
