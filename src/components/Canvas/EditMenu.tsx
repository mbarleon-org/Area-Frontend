import React from "react";
import "../../index.css";

const EditMenu: React.FC = () => {
  return (
    <div style={styles.container}>
        <h3>Edit Menu</h3>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "30%",
    height: "100vh",
    backgroundColor: "#141414",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "16px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
};

export default EditMenu;
