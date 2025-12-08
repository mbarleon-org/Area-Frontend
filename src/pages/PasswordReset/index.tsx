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
    console.log('Token data set:', tokenData);
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
    const { View, Text, TextInput, TouchableOpacity } = RN;
    return (
      <View style={mobileStyles.container}>
        <Navbar />
        <View style={mobileStyles.content}>
          <Text style={mobileStyles.title}>Set your password</Text>
          {tokenData && tokenData.payload ? (
            <Text style={mobileStyles.email}>{tokenData.payload.email || tokenData.payload.username}</Text>
          ) : null}
          <TextInput placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} style={mobileStyles.input} />
          <TextInput placeholder="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} style={mobileStyles.input} />
          <TouchableOpacity onPress={handleSubmit} style={mobileStyles.button}>
            <Text style={mobileStyles.buttonText}>{loading ? 'Saving...' : 'Set password'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.container}>
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
    </>
  );
};

const mobileStyles: any = {
  container: {
    flex: 1,
    backgroundColor: '#151316ff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
  },
};

const webStyles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#151316",
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
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: "40px",
    minWidth: "400px",
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: "100%",
    boxSizing: "border-box",
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
    background: '#161616',
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
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
  },
};

export default PasswordReset;
