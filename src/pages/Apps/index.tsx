
import React from 'react';
import '../../index.css';
import Navbar from '../../components/Navbar';
import { isWeb } from '../../utils/IsWeb';

const Apps: React.FC = () => {
  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    const { View, Text, TouchableOpacity, ScrollView } = require('react-native');
    return (
      <>
        <Navbar />
        <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: "#151316", justifyContent: "center", alignItems: "center", paddingTop: 80 }}>
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 16 }}>
              Welcome to the Area Apps page
            </Text>
            <Text style={{ color: "#fff", fontSize: 16, marginTop: 12, textAlign: "center", opacity: 0.85 }}>
              This is a placeholder page for the Area app. Enjoy exploring automations and integrations!
            </Text>
            <TouchableOpacity
              style={{ marginTop: 32, backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 32 }}
              onPress={() => {}}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Discover More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }

  // ------------------------ Web view ------------------------
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ fontSize: 32, marginBottom: 16 }}>Welcome to the AREA Apps</h2>
        <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 32 }}>This is a placeholder apps page. Enjoy exploring automations and integrations!</p>
        <button style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '16px 32px', fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>
          Discover More
        </button>
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
