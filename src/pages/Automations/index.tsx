import React from "react";
import "../../index.css";
import Navbar from "../../components/Navbar";
import Canvas from "../../components/Canvas";

const Automations: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingLeft: "100px", minHeight: "100vh", background: "#151316ff" }}>
        <Canvas />
      </div>
    </>
  );
};

export default Automations;
