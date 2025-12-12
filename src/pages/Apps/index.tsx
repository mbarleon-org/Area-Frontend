import React from 'react';
import '../../index.css';
import { isWeb } from "../../utils/IsWeb";
import Navbar from '../../components/Navbar';

const Apps: React.FC = () => {

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const { View, Text, TouchableOpacity, ScrollView } = require('react-native');
    return (
      <>
        <Navbar />
        <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: "#151316", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center" }}>
              Welcome to the Area App page
            </Text>
            <Text style={{ color: "#fff", fontSize: 15, marginTop: 24, textAlign: "center" }}>
              This is a placeholder page for the Area app
            </Text>
          </View>
        </ScrollView>
      </>
    );
  }

  // ------------------------ Web view ---------------------------
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Welcome to the AREA Apps</h2>
        <p>This is a placeholder apps page.</p>
      </div>
    </>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: '#151316ff',
    color: '#fff',
  },
};

export default Apps;
