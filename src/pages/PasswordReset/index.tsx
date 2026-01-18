import React from 'react';
import Navbar from '../../components/Navbar';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import { useToast } from '../../components/Toast';

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

const PasswordReset: React.FC = () => {
  const { post } = useApi();
  const { showToast } = useToast();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const navigation = safeUseNavigation();

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.backgroundColor = "#151316";
      document.body.style.overflow = "auto";
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      showToast({ message: 'Enter valid email <test@example.com>', duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
      return;
    }

    setLoading(true);
    try {
      //reset_password
      await post('/auth/reset_password', { email });
      showToast({ message: 'An email has been sent to your address with instructions to reset your password.', duration: 5000, barColor: '#4CAF50', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      let errorMessage = 'An error occurred while sending the reset email.';
      if (err?.response?.status === 404) {
        errorMessage = 'Password reset feature is not available yet. Please contact support.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      showToast({ message: errorMessage, duration: 5000, barColor: '#cd1d1d', backgroundColor: '#222', textColor: '#fff', position: isWeb ? 'top' : 'bottom', transitionSide: 'left' });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const RN = require('react-native');
    const { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } = RN;
    return (
      <KeyboardAvoidingView
        style={mobileStyles.fullScreen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Navbar />
        <ScrollView
          contentContainerStyle={mobileStyles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={mobileStyles.card}>
            <View style={mobileStyles.PasswordReset}>
              <Text style={mobileStyles.heading}>Reset Password</Text>
              <Text style={mobileStyles.description}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <TextInput
                placeholder="Enter your email"
                style={mobileStyles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#888"
              />

              <TouchableOpacity
                style={mobileStyles.button}
                onPress={() => handleSubmit()}
                disabled={loading}
              >
                <Text style={mobileStyles.buttonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.reset ? navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) : navigation.navigate('Login')}>
                <Text style={mobileStyles.backToLogin}>Back to Login</Text>
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
        <div style={webStyles.cardContainer}>
          <div style={webStyles.card}>
            <form style={webStyles.PasswordReset} onSubmit={handleSubmit}>
              <h2 style={{ margin: '0 0 10px 0' }}>Reset Password</h2>
              <p style={webStyles.description}>
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                style={webStyles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <button style={webStyles.button} type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <a href="/login" style={webStyles.backToLogin}>Back to Login</a>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const mobileStyles: any = {
  fullScreen: {
    flex: 1,
    backgroundColor: "#151316ff",
    paddingTop: 80,
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    elevation: 8,
  },
  PasswordReset: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#fff",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#888",
    textAlign: 'center',
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
  backToLogin: {
    color: "#fff",
    marginTop: 15,
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
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  PasswordReset: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    color: "#fff",
  },
  description: {
    fontSize: "14px",
    color: "#888",
    textAlign: "center",
    margin: "0 0 10px 0",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#161616",
    color: "#fff",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
    fontWeight: "bold",
  },
  backToLogin: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "none",
    marginTop: "10px",
  },
};

export default PasswordReset;
