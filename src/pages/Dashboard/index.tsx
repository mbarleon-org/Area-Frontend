import React from 'react';
import '../../index.css';
import Navbar from '../../components/Navbar';

const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Welcome to the AREA Dashboard</h2>
        <p>This is a placeholder dashboard page.</p>
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
    padding: 0,
    margin: 0,
    paddingLeft: '80px',
    backgroundColor: '#151316ff',
    color: '#fff',
  },
};

export default Dashboard;
