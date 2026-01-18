import React from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { useApi } from "../../utils/UseApi";
import { useToast } from "../../components/Toast";
import { useToken } from "../../hooks/useToken";
import ApiConfigInput from "../../components/ApiConfigInput";

let safeUseNavigation: any = () => ({
  navigate: (_: any) => { },
  reset: (_: any) => { }
});

if (!isWeb) {
  try {
    const rnNav = require('@react-navigation/native');
    if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
  } catch (e) {
    // ignore
  }
}

const Login: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showConfig, setShowConfig] = React.useState(false);
  const { post } = useApi();
  const { showToast } = useToast();
  const { setToken } = useToken();

  const navigation = safeUseNavigation();

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.backgroundColor = "#151316";
      document.body.style.overflow = "auto";
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await post('/auth/login', { user: email, password: password });
      if (res && res.token) {
        setToken(res.token);
        showToast({ message: 'Login successful!', duration: 5000, barColor: '#4CAF50', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
        setPassword('');
      }
    } catch (err: any) {
      if (err && err.status === 401) {
        showToast({ message: 'Login failed. Invalid credentials.', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
      } else {
        showToast({ message: 'An error occurred while logging in.', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
      }
    }
  };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    const RN = require('react-native');
    const { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } = RN;
    const SvgLib = require('react-native-svg');
    const { Svg, Defs, RadialGradient, Stop, Rect } = SvgLib;

    return (
      <KeyboardAvoidingView
        style={mobileStyles.fullScreen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={mobileStyles.spotlightWrapper} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient id="loginSpotlight" cx="50%" cy="65%" rx="55%" ry="40%" fx="50%" fy="35%" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="rgba(255,255,255,0.14)" stopOpacity="1" />
                <Stop offset="1" stopColor="rgba(5,5,5,0)" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#loginSpotlight)" />
          </Svg>
        </View>
        <Navbar />
        <ScrollView
          contentContainerStyle={mobileStyles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={mobileStyles.card}>
            <View style={mobileStyles.Login}>
              <Text style={mobileStyles.heading}>Login</Text>

              <TextInput
                placeholder="Enter your Username or Email"
                style={mobileStyles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#888"
              />

              <TextInput
                placeholder="Enter your password"
                style={mobileStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholderTextColor="#888"
              />

              <TouchableOpacity onPress={() => navigation.reset ? navigation.reset({ index: 0, routes: [{ name: 'PasswordReset' }] }) : navigation.navigate('PasswordReset')}>
                <Text style={mobileStyles.forgot}>Forgot password ?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={mobileStyles.button}
                onPress={() => handleLogin()}
              >
                <Text style={mobileStyles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.reset ? navigation.reset({ index: 0, routes: [{ name: 'Register' }] }) : navigation.navigate('Register')}>
                <Text style={mobileStyles.register}>Don't have an account</Text>
              </TouchableOpacity>

              {/* Server Configuration Toggle */}
              <TouchableOpacity
                onPress={() => setShowConfig(!showConfig)}
                style={mobileStyles.configToggle}
              >
                <Text style={mobileStyles.configToggleText}>
                  {showConfig ? '▲ Hide Server Config' : '▼ Server Config'}
                </Text>
              </TouchableOpacity>

              {showConfig && (
                <View style={mobileStyles.configContainer}>
                  <ApiConfigInput
                    showReset={true}
                    onSave={() => showToast({
                      message: 'Server address saved!',
                      duration: 3000,
                      barColor: '#4CAF50',
                      backgroundColor: '#222',
                      textColor: '#fff',
                      position: 'bottom',
                      transitionSide: 'left'
                    })}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ------------------------ Web / Desktop View ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.container}>
        <div style={webStyles.spotlight} aria-hidden="true" />
        <div style={webStyles.cardContainer}>
          <div style={webStyles.card}>
            <form style={webStyles.Login} onSubmit={handleLogin}>
              <h2 style={{ margin: '0 0 20px 0' }}>Login</h2>
              <input
                type="text"
                placeholder="Enter your Username or Email"
                style={webStyles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter your password"
                style={webStyles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <a href="/password_reset" style={webStyles.forgot}>Forgot password ?</a>
              <button style={webStyles.button} type="submit">
                Login
              </button>
              <a href="/register" className="register" style={webStyles.register}>Don't have an account</a>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

const mobileStyles: any = {
  fullScreen: {
    flex: 1,
    backgroundColor: "#050505",
    paddingTop: 80,
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 4px 12px #333',
    elevation: 8,
  },
  Login: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
  },
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: -10,
    width: '100%',
  },
  forgot: {
    color: "#fff",
    alignSelf: 'flex-end',
    fontSize: 12,
    marginBottom: 10,
  },
  register: {
    color: "#fff",
    marginTop: 15,
  },
  configToggle: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  configToggleText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  configContainer: {
    width: '100%',
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
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
    maxWidth: "100%",
    boxSizing: "border-box",
    border: "1px solid #222",
  },
  Login: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
    boxSizing: "border-box",
  },
  forgot: {
    color: "#fff",
    cursor: "pointer",
    alignSelf: "flex-end",
    width: "100%",
    textAlign: "right",
    fontSize: "12px",
    textDecoration: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#fff",
    color: "#000",
    cursor: "pointer",
    boxSizing: "border-box",
    fontWeight: "bold",
  },
  register: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "none",
    marginTop: "10px",
  },
};

export default Login;
