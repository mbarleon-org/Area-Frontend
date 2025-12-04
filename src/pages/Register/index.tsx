import React from "react";
import Navbar from "../../components/Navbar";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

let safeUseNavigation: any = () => ({ navigate: (_: any) => {} });
try {
  const rnNav = require('@react-navigation/native');
  if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {
}

const detectIsWeb = (): boolean => {
  try {
    const { Platform } = require('react-native');
    return Platform && Platform.OS === 'web';
  } catch (e) {
    return typeof document !== 'undefined';
  }
};

const isWeb = detectIsWeb();
if (isWeb) import ('../../index.css');

const Register: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

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

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let hasError = false;
    if (!email.includes(".") || !email.includes("@")) {
      setEmailError("Enter valide email <test@email.com>");
      hasError = true;
    } else {
      setEmailError("");
    }
    if (password.length < 8) {
      setPasswordError("Enter valide password, minimum 8 characters");
      hasError = true;
    } else {
      setPasswordError("");
    }
    if (hasError) return;
    // ...submit logic
  };

  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => {} };

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    return(
      <>
      <View style={mobileStyles.fullScreen}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.container}>
          <View style={mobileStyles.card}>
            <View style={mobileStyles.Register}>
              <Text style={mobileStyles.heading}>Register</Text>

              <TextInput
                placeholder="Enter your full name"
                style={mobileStyles.input}
                placeholderTextColor="#888"
              />
              <TextInput
                placeholder="Enter your username"
                style={mobileStyles.input}
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
              {emailError ? <Text style={mobileStyles.errorText}>{emailError}</Text> : null}

              <TextInput
                placeholder="Enter your password"
                style={mobileStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholderTextColor="#888"
              />
              {passwordError ? <Text style={mobileStyles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity
                style={mobileStyles.button}
                onPress={() => handleRegister()}
              >
                <Text style={mobileStyles.buttonText}>Register</Text>
              </TouchableOpacity>

              <View style={mobileStyles.divider}>
                <Text style={mobileStyles.dividerText}>Or continue with</Text>
              </View>

              <View style={mobileStyles.providersContainer}>
                <TouchableOpacity style={mobileStyles.providerButton}>
                  <Text style={mobileStyles.providerText}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={mobileStyles.providerButton}>
                  <Text style={mobileStyles.providerText}>F</Text>
                </TouchableOpacity>
                <TouchableOpacity style={mobileStyles.providerButton}>
                  <Text style={mobileStyles.providerText}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity style={mobileStyles.providerButton}>
                  <Text style={mobileStyles.providerText}>M</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => navigationMobile.navigate('Login')}>
                <Text style={mobileStyles.login}>Already have an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      </>
    )
  }

  // ------------------------ Web / desktop view ------------------------
  return(
    <>
      <Navbar />
      <div style={webStyles.container}>
        <div style={webStyles.cardContainer}>
          <div style={webStyles.card}>
            <form style={webStyles.Register} onSubmit={handleRegister}>
              <h2>Register</h2>
                <input
                type="text"
                placeholder="Enter your full name"
                style={webStyles.input}
                />
                <input
                type="text"
                placeholder="Enter your username"
                style={webStyles.input}
                />
              <input
                type="email"
                placeholder="Enter your email"
                style={webStyles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                />
                {emailError && <span style={{ color: 'red', fontSize: 12 }}>{emailError}</span>}
                <input
                type="password"
                placeholder="Enter your password"
                style={webStyles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                />
                {passwordError && <span style={{ color: 'red', fontSize: 12 }}>{passwordError}</span>}
                <button style={webStyles.button} type="submit">
                  Register
                </button>
                <div style={webStyles.divider}>
                  <span style={webStyles.dividerText}>Or continue with</span>
                </div>
                <div style={webStyles.providersContainer}>
                  <button style={webStyles.providerButton} title="GitHub" type="button">
                    <svg viewBox="0 0 24 24" fill="#fff" style={{width:"24px",height:"24px"}} xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </button>
                  <button style={webStyles.providerButton} title="Google" type="button">
                    <svg viewBox="0 0 24 24" style={{width:"24px",height:"24px"}} xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </button>
                  <button style={webStyles.providerButton} title="Apple" type="button">
                    <svg viewBox="0 0 24 24" fill="#fff" style={{width:"24px",height:"24px"}} xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  </button>
                  <button style={webStyles.providerButton} title="Microsoft" type="button">
                    <svg viewBox="0 0 24 24" style={{width:"24px",height:"24px"}} xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/><path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>
                  </button>
                </div>
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
    backgroundColor: "#151316ff",
    margin: "0",
    padding: "0",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
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
    backgroundColor: "#1f1f1f",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
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
    backgroundColor: "#161616ff",
    color: "#fff",
    boxSizing: "border-box",
  },
  button: {
    width: "300px",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  login: {
    color: "#fff",
  },
  divider: {
    width: "100%",
    textAlign: "center",
    position: "relative",
    margin: "10px 0",
  },
  dividerText: {
    color: "#888",
    fontSize: "12px",
    backgroundColor: "#1f1f1f",
    padding: "0 10px",
    position: "relative",
    zIndex: 1,
  },
  providersContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    width: "100%",
  },
  providerButton: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    border: "1px solid #333",
    backgroundColor: "#161616ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

const mobileStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#151316ff",
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    backgroundColor: "#161616ff",
    color: "#fff",
  },
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
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
  divider: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  dividerText: {
    color: "#888",
    fontSize: 12,
  },
  providersContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  providerButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#161616ff",
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    color: '#fff',
    fontSize: 20,
  }
});

export default Register;
