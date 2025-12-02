import React from "react";
import "../../index.css";
import Navbar from "../../components/Navbar";

const User: React.FC = () => {
  const [editHover, setEditHover] = React.useState(false);
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.user}>
          <div style={styles.icon}>
            <img src="user_icon2.png" alt="user_icon" style={styles.avatarImg}/>
          </div>
          <div style={styles.info}>
            <h1 className="FullName">Full Name</h1>
            <h1 className="Username">Username</h1>
            <h1 className="Email">Email</h1>
            <button
              style={{
                ...styles.editButton,
                background: editHover
                  ? "linear-gradient(90deg, #4CAF50 0%, #196d1cff 100%)"
                  : "linear-gradient(90deg, #196d1cff 0%, #4CAF50 100%)"
              }}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
            >
              Edit
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
  }
};

export default User;