import React from 'react';
import Home from './pages/Home';
import ROUTES from './constants/Router';
import { CookiesProvider } from 'react-cookie';

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
    const { createNativeStackNavigator } = require('@react-navigation/native-stack');
    const Stack = createNativeStackNavigator();

    return (
      <CookiesProvider>
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
      </CookiesProvider>
    );
  } catch (e) {
    // fallback
    return <Home />;
  }
  }

  try {
    const { BrowserRouter, Routes, Route } = require('react-router-dom');
    return (
      <CookiesProvider>
        <BrowserRouter>
          <Routes>
            {ROUTES.map((r: any) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </CookiesProvider>
    );
  } catch (e) {
    // fallback
    return <Home />;
  }
};

export default App;
