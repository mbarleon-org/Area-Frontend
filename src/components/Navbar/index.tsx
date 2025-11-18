import React from "react";

const Navbar: React.FC = () => {
  return (
    <div style={styles.navbar}>
      <h1 style={styles.title}>AREA</h1>
      <div style={styles.navbarItemsContainer}>
        <h1 style={styles.navbarItems}>Accueil</h1>
        <h1 style={styles.navbarItems}>Services</h1>
        <h1 style={styles.navbarItems}>Contact</h1>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    backgroundColor: "#141414ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: "0",
    zIndex: 10000,
    boxShadow: "0 2px 4px rgba(51, 51, 51, 0.66)",
  },
  navbarItemsContainer: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },
  navbarItems: {
    fontSize: "12px",
    display: "flex",
    gap: "25px",
    color: "#fff",
    fontFamily: "'Montserrat', sans-serif",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "'Montserrat', sans-serif",
    color: "#fff",
    margin: 0,
    position: "absolute",
    left: "40px",
    top: "50%",
    transform: "translateY(-50%)",
  },
};

export default Navbar;
