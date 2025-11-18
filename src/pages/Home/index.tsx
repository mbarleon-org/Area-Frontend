import React from "react";
import "../../index.css";

const Home: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AREA</h1>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
    background: "linear-gradient(180deg, #000000 0%, #3b0066 100%)",
    color: "#fff",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "'Montserrat', sans-serif",
    color: "#fff",
    margin: 0,
  },
};

export default Home;
