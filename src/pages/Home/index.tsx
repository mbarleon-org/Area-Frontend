import React from 'react';
import Navbar from "../../components/Navbar";
import { View, Text } from 'react-native';
import { isWeb } from "../../utils/IsWeb";

if (isWeb) import('../../index.css');

const Home: React.FC = () => {

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    return (
      <>
        <Navbar />
        <View style={mobileStyles.container}>
          <Text style={mobileStyles.title}>Welcome to the AREA Home Page</Text>
        </View>
      </>
    );
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.container}>
        <h2 style={webStyles.title}>Welcome to the AREA Home Page</h2>
      </div>
    </>
  );
};

const webStyles: any = {
  container: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#151316',
    color: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    margin: 0,
    textAlign: 'center' as any,
    width: '100%'
  },
};

const mobileStyles: any = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151316',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
};

export default Home;
