import React from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useToken } from "../../hooks/useToken";
import { useInRouterContext, useNavigate } from "react-router-dom";


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
  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState("Full Name : Loïs");
  const [username, setUsername] = React.useState("Username : Le plus beau");
  const [email, setEmail] = React.useState("Email : LadiesMan69@mommy.com");
  const user_icon = require('../../../assets/user_icon2.png');
  const { setToken } = useToken();
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : ((to: string) => { if (typeof window !== 'undefined') window.location.href = to; });

  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => { } };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.mainContainer}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.scrollContainer}>

          <View style={mobileStyles.iconContainer}>
            <Image source={user_icon} style={mobileStyles.avatarImg} />
          </View>

          <View style={mobileStyles.infoContainer}>
            {isEditing ? (
              <>
                <Text style={mobileStyles.label}>Full Name</Text>
                <TextInput
                  style={mobileStyles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                />

                <Text style={mobileStyles.label}>Username</Text>
                <TextInput
                  style={mobileStyles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="#888"
                />

                <Text style={mobileStyles.label}>Email</Text>
                <TextInput
                  style={mobileStyles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#888"
                />
              </>
            ) : (
              <>
                <Text style={mobileStyles.displayText}>{fullName}</Text>
                <Text style={mobileStyles.displayText}>{username}</Text>
                <Text style={mobileStyles.displayText}>{email}</Text>
              </>
            )}

            <TouchableOpacity
              style={mobileStyles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={mobileStyles.buttonText}>
                {isEditing ? "Confirm" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={mobileStyles.bottomBar}>
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

        </ScrollView>
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <>
      <Navbar />
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
            {isEditing ? (
              <>
                <input
                  style={webStyles.input}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
                <input
                  style={webStyles.input}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                />
                <input
                  style={webStyles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </>
            ) : (
              <>
                <h1 className="FullName">{fullName}</h1>
                <h1 className="Username">{username}</h1>
                <h1 className="Email">{email}</h1>
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
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Confirm" : "Edit"}
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
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 380,
    marginRight: 10,
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
    marginLeft: 40,
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
