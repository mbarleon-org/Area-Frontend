import React from 'react';
if (typeof document !== 'undefined') require('../../index.css');
// import Navbar from "../../components/Navbar";

const isWeb = typeof document !== 'undefined';

const Home: React.FC = () => {
  if (!isWeb) {
    const { View, Text } = require('react-native');
    return (
      <>
        {/* <Navbar /> */}
        <View style={mobileStyles.container}>
          <Text style={mobileStyles.title}>Welcome to the AREA Home Page</Text>
        </View>
      </>
    );
  }
  return (
    <>
      {/* <Navbar /> */}
      <div style={webStyles.container}>
        <h2 style={webStyles.title}>Welcome to the AREA Home Page</h2>
      </div>
    </>
  );
};

const webStyles: any = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    width: '100vw',
    height: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#151316',
    color: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    margin: 0,
    textAlign: 'center' as any,
    width: '100%'
  },
};

const mobileStyles = {
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
