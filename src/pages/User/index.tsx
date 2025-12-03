import React from "react";
if (typeof document !== 'undefined') require('../../index.css');
import Navbar from "../../components/Navbar";

const User: React.FC = () => {
  const [editHover, setEditHover] = React.useState(false);
  const [logoutHover, setLogoutHover] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState("Full Name");
  const [username, setUsername] = React.useState("Username");
  const [email, setEmail] = React.useState("Email");
  return (
    <>
      <Navbar />
      <button
        style={{
          ...styles.logoutButton,
          ...styles.logoutTopRight,
          background: logoutHover
            ? "linear-gradient(90deg, #c0392b 0%, #e74c3c 100%)"
            : "linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)"
        }}
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
      >
        Logout
      </button>
      <div style={styles.container}>
        <div style={styles.user}>
          <div style={styles.icon}>
            <img src="user_icon2.png" alt="user_icon" style={styles.avatarImg}/>
          </div>
          <div style={styles.info}>
            {isEditing ? (
              <>
                <input
                  style={styles.input}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
                <input
                  style={styles.input}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                />
                <input
                  style={styles.input}
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
                ...styles.editButton,
                background: editHover
                  ? "linear-gradient(90deg, #4CAF50 0%, #196d1cff 100%)"
                  : "linear-gradient(90deg, #196d1cff 0%, #4CAF50 100%)"
              }}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Valider" : "Edit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
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
