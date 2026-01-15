import React from "react";
if (typeof document !== 'undefined') require('../../index.css');
import Navbar from "../../components/Navbar";
import Canvas from "../../components/Canvas";
import { isWeb } from '../../utils/IsWeb';

const Automations: React.FC = () => {
    // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const { View } = require('react-native');
    return (
      <>
        <Navbar />
        <View style={{ paddingLeft: 24, minHeight: '100%', backgroundColor: '#151316ff', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Canvas />
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
