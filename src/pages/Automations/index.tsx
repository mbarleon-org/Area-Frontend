import React from "react";
if (typeof document !== 'undefined') require('../../index.css');
import Navbar from "../../components/Navbar";
import Canvas from "../../components/Canvas";

const Automations: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingLeft: "100px", minHeight: "100vh", background: "#151316ff", flex: 1 }}>
        <Canvas />
      </div>
    </>
  );
};

export default Automations;
