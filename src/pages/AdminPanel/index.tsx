import React from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { View, Text, StyleSheet, ScrollView } from "react-native";

if (isWeb) import("../../index.css");

const AdminPanel: React.FC = () => {
  if (!isWeb) {
    return (
      <View style={mobileStyles.container}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.content}>
          <Text style={mobileStyles.title}>Admin Panel</Text>
          <Text style={mobileStyles.subtitle}>You have administrator access.</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <Navbar />
      <div style={webStyles.page}>
        <div style={webStyles.card}>
          <h1 style={webStyles.title}>Admin Panel</h1>
          <p style={webStyles.subtitle}>You have administrator access.</p>
        </div>
      </div>
    </>
  );
};

const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151316ff',
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#bdbdbd',
    fontSize: 16,
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#151316ff',
    color: '#fff',
    boxSizing: 'border-box',
    marginLeft: '100px',
    width: '100%',
    padding: '30px',
  },
  card: {
    background: 'rgba(26,26,28,0.85)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '32px',
    boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
    width: '100%',
    minHeight: 'calc(100vh - 60px)',
    boxSizing: 'border-box',
    flexDirection: 'column',
    overflow: 'auto',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: 800,
  },
  subtitle: {
    margin: '0',
    color: '#bdbdbd',
    fontSize: '16px',
  },
};

export default AdminPanel;
