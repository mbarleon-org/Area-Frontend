import React, { useState } from 'react';
import '../../index.css';
import Navbar from '../../components/Navbar';

const NavLinkWrapper: React.FC<any> = ({ children, ...props }) => {
  if (typeof document !== 'undefined') {
    const { NavLink } = require('react-router-dom');
    return <NavLink {...props}>{children}</NavLink>;
  }
  try {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={() => {}}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  } catch {
    return <>{children}</>;
  }
};

const Dashboard: React.FC = () => {
  const [automations] = useState([
    { id: 1, name: 'Backup DB nightly (Fake data)', desc: 'Nightly saving (Fake data)', status: 'OK', lastRun: '2025-11-24 02:00' },
    { id: 2, name: 'Sync users (Fake data)', desc: 'User synchronization from LDAP (Fake data)', status: 'Error', lastRun: '2025-11-24 09:12' },
    { id: 3, name: 'Generate report (Fake data)', desc: 'Daily report generation (Fake data)', status: 'Running', lastRun: '2025-11-24 11:03' },
  ] as Array<{ id: number; name: string; desc: string; status: string; lastRun: string }> );

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <NavLinkWrapper to="/automations" style={{ textDecoration: 'none' }}>
            <button style={styles.addButton}>+ New automation</button>
          </NavLinkWrapper>
        </div>

        <h2 style={styles.title}>Automations</h2>

        <div style={styles.column}>
          {automations.map(a => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>{a.name}</div>
                <div style={{ ...styles.status, ...(a.status === 'OK' ? styles.statusOk : a.status === 'Running' ? styles.statusRunning : styles.statusError) }}>{a.status}</div>
              </div>
              <div style={styles.cardBody}>{a.desc}</div>
              <div style={styles.cardFooter}>Last run: {a.lastRun}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '20px',
    marginTop: "40px",
    backgroundColor: '#151316ff',
    color: '#fff',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '20px',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: '250px',
    marginBottom: 12,
  },
  addButton: {
    background: '#2b2b2b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '15px 20px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '900px',
  },
  card: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
  },
  status: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 12,
  },
  statusOk: { background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71' },
  statusError: { background: 'rgba(231, 76, 60, 0.12)', color: '#e74c3c' },
  statusRunning: { background: 'rgba(241, 196, 15, 0.12)', color: '#f1c40f' },
  cardBody: { fontSize: 13, opacity: 0.9, marginBottom: 8 },
  cardFooter: { fontSize: 12, opacity: 0.7 },
};

export default Dashboard;
