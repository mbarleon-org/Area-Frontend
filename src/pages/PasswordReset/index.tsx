import React from 'react';
import Navbar from '../../components/Navbar';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import { useToast } from '../../components/Toast';
import { useCookies } from 'react-cookie';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2)
      return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    let raw = '';
    if (typeof atob === 'function') {
      raw = atob(payload + '=='.slice((2 - payload.length * 3) & 3));
    } else if (typeof (globalThis as any).Buffer === 'function') {
      raw = (globalThis as any).Buffer.from(payload, 'base64').toString('utf8');
    } else {
      const binStr = payload.replace(/=+$/, '');
      raw = decodeURIComponent(binStr.split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const PasswordReset: React.FC = () => {
  const { post } = useApi();
  const { showToast } = useToast();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [tokenData, setTokenData] = React.useState<any>(null);
  const [_cookies, setCookie] = useCookies(['token']);

  React.useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
    const token = params.get('token') || '';
    const context = params.get('context') || '';
    if (!token || !context) return;
    setCookie('token', token, { path: '/' });
    const payload = decodeJwtPayload(token);
    setTokenData({ token, payload, context });
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenData) {
      showToast({ message: 'Missing token', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      return;
    }
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
    if (password.length < 8 || !passwordPattern.test(password)) {
      showToast({ message: "Password must be at least 8 characters long, and contain a letter (both upper and lowercase), a number, and a special character.", duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      return;
    }
    if (password !== confirm) {
      showToast({ message: 'Passwords do not match', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      return;
    }
    setLoading(true);
    try {
      await post('/auth/set_password', { password, context: tokenData.context });
      showToast({ message: 'Password set successfully. You can now log in.', duration: 5000, barColor: '#4CAF50', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      setPassword('');
      setConfirm('');
    } catch (err) {
      showToast({ message: 'Failed to set password. The link may be expired or invalid.', duration: 7000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const RN = require('react-native');
    const { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } = RN;
    const SvgLib = require('react-native-svg');
    const { Svg, Defs, RadialGradient, Stop, Rect } = SvgLib;

    return (
      <KeyboardAvoidingView
        style={mobileStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={mobileStyles.spotlightWrapper} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient id="resetSpotlight" cx="50%" cy="55%" rx="55%" ry="40%" fx="50%" fy="55%" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="rgba(255,255,255,0.14)" stopOpacity="1" />
                <Stop offset="1" stopColor="rgba(5,5,5,0)" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#resetSpotlight)" />
          </Svg>
        </View>
        <Navbar />
        <ScrollView
          contentContainerStyle={mobileStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={mobileStyles.card}>
            <Text style={mobileStyles.title}>Set your password</Text>
            {tokenData && tokenData.payload ? (
              <Text style={mobileStyles.email}>{tokenData.payload.email || tokenData.payload.username}</Text>
            ) : null}
            <View style={mobileStyles.form}>
              <TextInput placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} style={mobileStyles.input} placeholderTextColor="#888" />
              <TextInput placeholder="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} style={mobileStyles.input} placeholderTextColor="#888" />
              <TouchableOpacity onPress={handleSubmit} style={mobileStyles.button}>
                <Text style={mobileStyles.buttonText}>{loading ? 'Saving...' : 'Set password'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.container}>
        <div style={webStyles.spotlight} aria-hidden="true" />
        <div style={webStyles.cardContainer}>
          <div style={webStyles.card}>
            <h2 style={webStyles.setPassword}>Set your password</h2>
            {tokenData && tokenData.payload ? <div style={webStyles.email}>{tokenData.payload.email || tokenData.payload.username}</div> : null}
            <form onSubmit={handleSubmit} style={webStyles.form}>
              <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} style={ webStyles.passwordField } />
              <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} style={ webStyles.passwordField } />
              <button type="submit" style={ webStyles.submitButton }>{loading ? 'Saving...' : 'Set password'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const mobileStyles: any = {
  container: {
    flex: 1,
    backgroundColor: '#050505',
    position: 'relative',
    overflow: 'hidden',
  },
  spotlightWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 4px 12px #333',
    elevation: 8,
    border: "1px solid #222",
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 44,
    textAlign: 'center',
  },
  email: {
    color: "#ccc",
    fontSize: 16,
    paddingBottom: 10,
    marginLeft: 4,
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

const webStyles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#050505",
    margin: "0",
    padding: "0",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
    position: "relative",
    zIndex: 1,
  },
  spotlight: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), rgba(5,5,5,0) 55%)",
    zIndex: 0,
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#000",
    borderRadius: "16px",
    boxShadow: "0 4px 12px #333",
    padding: "40px",
    minWidth: "400px",
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: "100%",
    boxSizing: "border-box",
    border: "1px solid #222",
  },
  setPassword: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "44px",
    color: "#fff",
  },
  email: {
    color: "#ccc",
    alignSelf: "flex-start",
    width: "100%",
    textAlign: "left",
    fontSize: "16px",
    paddingBottom: "10px",
    marginLeft: "4px",
  },
  passwordField: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #333',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  submitButton: {
    width: '100%',
    padding: 12,
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: 8,
    marginTop: 16,
  },
};

export default PasswordReset;
