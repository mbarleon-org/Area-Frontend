import React from "react";
if (typeof document !== 'undefined') require('../../index.css');
import Navbar from "../../components/Navbar";
import Canvas from "../../components/Canvas";
import MobileCanva from "../../components/MobileCanvas";
import { isWeb } from '../../utils/IsWeb';

const Automations: React.FC = () => {
  if (!isWeb) {
    const { View } = require('react-native');
    return (
      <>
        <Navbar />
        <View style={{ flex: 1, backgroundColor: '#151316ff' }}>
          <MobileCanva />
        </View>
      </>
    );
  }

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
