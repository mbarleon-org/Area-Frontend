import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { isWeb } from '../utils/IsWeb';
import * as SecureStore from 'expo-secure-store';

export function useToken() {
  if (isWeb) {
    const [cookies, setCookie] = useCookies(['token']);
    const token = cookies.token;
    const setToken = (value: string | null) => {
      if (value) {
        setCookie('token', value, { path: '/', httpOnly: false });
      } else {
        setCookie('token', '', { path: '/', expires: new Date(0) });
      }
    };
    return { token, setToken };
  } else {
    const [token, setTokenState] = useState<string | null>(null);

    useEffect(() => {
      const loadToken = async () => {
        try {
          const storedToken = await SecureStore.getItemAsync('token');
          setTokenState(storedToken);
        } catch (error) {
          console.error('Error loading token:', error);
        }
      };
      loadToken();
    }, []);

    const setToken = async (value: string | null) => {
      try {
        if (value) {
          await SecureStore.setItemAsync('token', value);
        } else {
          await SecureStore.deleteItemAsync('token');
        }
        setTokenState(value);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    };

    return { token, setToken };
  }
}
