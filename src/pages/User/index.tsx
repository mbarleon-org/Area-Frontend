import React from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useToken } from "../../hooks/useToken";
import { useInRouterContext, useNavigate } from "../../utils/router";
import { useApi } from "../../utils/UseApi";
import { assetPath } from "../../utils/assets";


if (isWeb) import('../../index.css');

let safeUseNavigation: any = () => ({
  navigate: (_: any) => { },
  reset: (_: any) => { }
});

try {
  const rnNav = require('@react-navigation/native');
  if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {
}
const User: React.FC = () => {
  const [editHover, setEditHover] = React.useState(false);
  const [logoutHover, setLogoutHover] = React.useState(false);
  const [adminHover, setAdminHover] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const user_icon = isWeb ? assetPath('/user_icon2.png') : require('../../../public/user_icon2.png');
  const { setToken } = useToken();
  const { get, put } = useApi();
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : ((to: string) => { if (typeof window !== 'undefined') window.location.href = to; });
  const [fetchAttempt, setFetchAttempt] = React.useState(0);

  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => { } };

  React.useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      try {
        const res = await get('/users/me');
        if (!mounted)
          return;
        setUsername(res?.username ?? "");
        setEmail(res?.email ?? "");
        setIsAdmin(res?.isAdmin ?? false);
      } catch (err: any) {
        if (fetchAttempt >= 1)
          console.error('Failed to fetch user profile', err);
        const status = err?.response?.status;
        // Retry once on 401 because on mobile the token might not be ready yet (idk why)
        if ((status === 401 || status === 0) && fetchAttempt < 1) {
          setFetchAttempt((s) => s + 1);
          setTimeout(() => {
            if (!mounted)
              return;
            doFetch();
          }, 500);
          return;
        }
      } finally {
        if (mounted)
          setLoading(false);
      }
    };
    doFetch();
    return () => { mounted = false; };
  }, [get, fetchAttempt]);

  const handleSaveUsername = async () => {
    setSaving(true);
    try {
      const res = await put('/users/me', { username });
      setUsername(res?.username ?? username);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update username', err);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.mainContainer}>
        <Navbar />

        <View style={mobileStyles.content}>
          <View style={mobileStyles.iconContainer}>
            <Image source={user_icon as any} style={mobileStyles.avatarImg} />
          </View>

          <View style={mobileStyles.infoContainer}>
            {loading ? (
              <Text style={mobileStyles.displayText}>Loading user...</Text>
            ) : (
              <>
                <Text style={mobileStyles.label}>Username</Text>
                {isEditing ? (
                  <TextInput
                    style={mobileStyles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor="#888"
                  />
                ) : (
                  <Text style={mobileStyles.displayText}>{username || 'No username set'}</Text>
                )}

                <Text style={mobileStyles.label}>Email</Text>
                <Text style={mobileStyles.displayText}>{email || 'No email set'}</Text>
              </>
            )}

            <TouchableOpacity
              style={mobileStyles.editButton}
              onPress={() => {
                if (isEditing) {
                  handleSaveUsername();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving || loading}
            >
              <Text style={mobileStyles.buttonText}>
                {isEditing ? (saving ? "Saving..." : "Confirm") : "Edit username"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={mobileStyles.bottomBar}>
          {isAdmin && (
            <TouchableOpacity
              style={mobileStyles.adminPanelButton}
              onPress={() => {
                navigationMobile.navigate('Admin');
              }}
            >
              <Text style={mobileStyles.adminPanelButtonText}>Admin Panel</Text>
            </TouchableOpacity>)}
          <TouchableOpacity
            style={mobileStyles.logoutButton}
            onPress={() => {
              setToken(null);
              navigationMobile.navigate('Login');
            }}
          >
            <Text style={mobileStyles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <>
      <Navbar />
      {isAdmin && (<button
        style={{
          ...webStyles.adminButton,
          ...webStyles.adminTopRight,
          background: adminHover ? '#dcdcdc' : 'transparent',
          color: adminHover ? '#151316' : '#fff',
          border: '1px solid #dcdcdc',
        }}
        onMouseEnter={() => setAdminHover(true)}
        onMouseLeave={() => setAdminHover(false)}
        onClick={() => { navigate('/admin'); }}
      >
        Admin Panel
      </button>)}
      <button
        style={{
          ...webStyles.logoutButton,
          ...webStyles.logoutTopRight,
          background: logoutHover
            ? "linear-gradient(90deg, #c0392b 0%, #e74c3c 100%)"
            : "linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)"
        }}
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
        onClick={() => {
          setToken(null);
          navigate('/login');
          }}
      >
        Logout
      </button>
      <div style={webStyles.container}>
        <div style={webStyles.user}>
          <div style={webStyles.icon}>
            <img src={user_icon} alt="user_icon" style={webStyles.avatarImg}/>
          </div>
          <div style={webStyles.info}>
            {loading ? (
              <p style={{ color: '#aaa' }}>Loading user...</p>
            ) : (
              <>
                <label style={{ color: '#aaa', fontSize: '0.9em' }}>Username</label>
                {isEditing ? (
                  <input
                    style={webStyles.input}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                ) : (
                  <h1 className="Username">{username || 'No username set'}</h1>
                )}
                <label style={{ color: '#aaa', fontSize: '0.9em' }}>Email</label>
                <h1 className="Email">{email || 'No email set'}</h1>
              </>
            )}
            <button
              style={{
                ...webStyles.editButton,
                background: editHover
                  ? "linear-gradient(90deg, #4CAF50 0%, #196d1cff 100%)"
                  : "linear-gradient(90deg, #196d1cff 0%, #4CAF50 100%)"
              }}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              onClick={() => {
                if (isEditing) {
                  handleSaveUsername();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving || loading}
            >
              {isEditing ? (saving ? "Saving..." : "Confirm") : "Edit username"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const mobileStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#151316ff",
  },
  scrollContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 0,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    paddingBottom: 24,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#333',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingRight: 20,
    marginLeft: 24,
  },
  displayText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    width: '85%',
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 10,
    fontSize: 16,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  adminPanelButton: {
    backgroundColor: '#dcdcdc',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginRight: 12,
  },
  adminPanelButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

const webStyles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "0",
    margin: "0",
    paddingTop: "30px",
    paddingLeft: "150px",
    backgroundColor: "#151316ff",
    color: "#fff",
  },
  icon:{
    maxHeight: "20vh",
    maxWidth: "20vh",
    width: "20vh",
    height: "20vh",
    display: "flex",
    background: "#fff",
    borderRadius: "200px",
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  editButton: {
    width: "100%",
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    marginTop: "16px",
    boxShadow: "3px",
    textShadow: "2px 2px 8px #000",
  },
  logoutButton: {
    width: "auto",
    minWidth: 100,
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "1px",
    transition: "background 0.3s",
    zIndex: 10,
  },
  logoutTopRight: {
    position: "absolute",
    top: 24,
    right: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  adminTopRight: {
    position: "absolute",
    top: 24,
    right: 140,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  adminButton: {
    width: "auto",
    minWidth: 100,
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "1px",
    transition: "background 0.18s ease, color 0.18s ease",
    zIndex: 11,
    background: 'transparent',
  },
  input: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #444",
    marginTop: "20px",
    marginBottom: "12px",
    fontSize: "1.1em",
    background: "#222",
    color: "#fff",
    outline: "none",
  },
};

export default User;
