import React from "react";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/Toast";
import { isWeb } from "../../utils/IsWeb";
import { useApi } from "../../utils/UseApi";
import ApiConfigInput from "../../components/ApiConfigInput";

let safeUseNavigation: any = () => ({
  navigate: (_: any) => { },
  reset: (_: any) => { }
});

try {
  const rnNav = require('@react-navigation/native');
  if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {
}

const Register: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [needPassword, setNeedPassword] = React.useState<boolean>(false);
  const [showConfig, setShowConfig] = React.useState(false);
  const { post, get } = useApi();
  const [buttonHover, setButtonHover] = React.useState(false);
  const [buttonActive, setButtonActive] = React.useState(false);
  const { showToast } = useToast();
  const [pressed, setPressed] = React.useState(false);


  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.backgroundColor = "#151316ff";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await get('/auth/supports_check_email')
        if (mounted)
          setNeedPassword(false);
      } catch (e) {
        if (mounted)
          setNeedPassword(true);
      }
    })();
    return () => { mounted = false; };
  }, [get]);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let hasError = false;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (needPassword && (password.length < 8 || !passwordPattern.test(password))) {
      showToast({ message: "Password must be at least 8 characters long, and contain a letter (both upper and lowercase), a number, and a special character.", duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      hasError = true;
    }
    if (username.includes('@')) {
      showToast({ message: "Username cannot contain '@' character.", duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      hasError = true;
    }
    if (!emailPattern.test(email)) {
      showToast({ message: "Enter valid email <test@example.com>", duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      hasError = true;
    }
    if (hasError) return;
    try {
      await post('/auth/register', { username, email, password: needPassword ? password : undefined });
      showToast({ message: needPassword ? 'Account created successfully. You can now log in.' : 'An email has been sent to your address with instructions.', duration: 5000, barColor: '#4CAF50', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
      setPassword('');
    } catch (err) {
      showToast({ message: 'An error occurred while creating the account.', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: 'top', transitionSide: 'left' });
    }
  };

  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => { } };

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const RN = require('react-native');
    const { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } = RN;
    const SvgLib = require('react-native-svg');
    const { Svg, Defs, RadialGradient, Stop, Rect } = SvgLib;

    return (
      <>
        <KeyboardAvoidingView
          style={mobileStyles.fullScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={-100}
        >
          <View style={mobileStyles.spotlightWrapper} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient id="registerSpotlight" cx="50%" cy="65%" rx="55%" ry="40%" fx="50%" fy="35%" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="rgba(255,255,255,0.14)" stopOpacity="1" />
                <Stop offset="1" stopColor="rgba(5,5,5,0)" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#registerSpotlight)" />
          </Svg>
        </View>
          <Navbar />
          <ScrollView
            contentContainerStyle={mobileStyles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={mobileStyles.card}>
              <View style={mobileStyles.Register}>
                <Text style={mobileStyles.heading}>Register</Text>

                <TextInput
                  placeholder="Enter your username"
                  style={mobileStyles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor="#888"
                />
                <TextInput
                  placeholder="Enter your email"
                  style={mobileStyles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor="#888"
                />

                {needPassword ? <TextInput
                  placeholder="Enter your password"
                  style={mobileStyles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  placeholderTextColor="#888"
                /> : null}

                <TouchableOpacity
                  style={[mobileStyles.button, pressed ? mobileStyles.buttonActive : null]}
                  onPress={() => handleRegister()}
                  onPressIn={() => setPressed(true)}
                  onPressOut={() => setPressed(false)}
                >
                  <Text style={mobileStyles.buttonText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigationMobile.reset ? navigationMobile.reset({ index: 0, routes: [{ name: 'Login' }] }) : navigationMobile.navigate('Login')}>
                  <Text style={mobileStyles.login}>Already have an account</Text>
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
                    <ApiConfigInput showReset={true} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    )
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.container}>
        <div style={webStyles.spotlight} aria-hidden="true" />
        <div style={webStyles.cardContainer}>
          <div style={webStyles.card}>
            <form style={webStyles.Register} onSubmit={handleRegister}>
              <h2>Register</h2>
              <input
                type="text"
                placeholder="Enter your username"
                style={webStyles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your email"
                style={webStyles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {needPassword && <input
                type="password"
                placeholder="Enter your password"
                style={webStyles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />}
              <button
                style={{
                  ...webStyles.button,
                  ...(buttonHover ? webStyles.buttonHover : {}),
                  ...(buttonActive ? webStyles.buttonActive : {}),
                }}
                type="submit"
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => { setButtonHover(false); setButtonActive(false); }}
                onMouseDown={() => setButtonActive(true)}
                onMouseUp={() => setButtonActive(false)}
              >
                Register
              </button>
              <a href="/login" className="login" style={webStyles.login}>Already have an account</a>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

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
    boxSizing: "border-box",
  },
  Register: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    color: "#fff",
  },
  input: {
    width: "300px",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
    boxSizing: "border-box",
  },
  button: {
    width: "300px",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#fff",
    color: "#000",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  buttonHover: {
    boxShadow: '0 2px 8px rgb(255, 255, 255)'
  },
  buttonActive: {
    transform: 'translateY(0px) scale(0.98)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)'
  },
  login: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "none",
    marginTop: "10px",
  },
};

const mobileStyles: any = {
  fullScreen: {
    paddingTop: 80,
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: "#050505",
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spotlightWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  Register: {
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
  buttonActive: {
    transform: [{ translateY: 0 }],
    opacity: 0.95,
  },
  buttonText: {
    color: "#000",
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
  login: {
    color: "#fff",
    marginTop: 10,
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
  }
};

export default Register;
