import React from "react";
if (typeof document !== 'undefined') require('../../index.css');
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import Canvas from "../../components/Canvas";

const Automations: React.FC = () => {
  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const { View, Text } = require('react-native');
    return (
      <>
        <Navbar />
        <View style={{ paddingLeft: 24, minHeight: '100%', backgroundColor: '#151316ff', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}>
            Canvas is not available on mobile yet.
          </Text>
        </View>
      </>
    );
  }

  // ------------------------ Web view ---------------------------
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
