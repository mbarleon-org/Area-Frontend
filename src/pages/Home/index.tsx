import React, { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { isWeb } from "../../utils/IsWeb";
import { useCookies } from 'react-cookie';
import { useApi } from '../../utils/UseApi';

if (isWeb) import('../../index.css');

const Home: React.FC = () => {
  const [cookies] = useCookies(['token']);
  const { get } = useApi();
  const [workflows, setWorkflows] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    get('/workflows/public')
      .then((res: any) => {
        if (!mounted) return;
        if (res && Array.isArray(res.workflows)) {
          setWorkflows(res.workflows);
          return;
        }
        setWorkflows([]);
      })
      .catch(() => {
        if (mounted) setWorkflows([]);
      });
    return () => { mounted = false; };
  }, [get]);

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.mainContainer}>
        <Navbar />

        {!cookies.token && (
          <View style={mobileStyles.centerContainer}>
            <Text style={mobileStyles.title}>Welcome to the AREA Home Page</Text>
          </View>
        )}

        {cookies.token && (
          <ScrollView contentContainerStyle={mobileStyles.scrollContainer}>
            <Text style={mobileStyles.sectionTitle}>Public workflows</Text>

            {Array.isArray(workflows) && workflows.length === 0 && (
              <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
                No public workflows available.
              </Text>
            )}

            {Array.isArray(workflows) && workflows.map((a: any) => (
              <View key={a.id || a.name} style={mobileStyles.card}>
                <View style={mobileStyles.cardHeader}>
                  <Text style={mobileStyles.cardTitle}>{a.name}</Text>
                  <Text style={mobileStyles.version}>v{a.version}</Text>
                </View>

                <Text style={mobileStyles.cardBody}>{a.description}</Text>

                <View style={[
                  mobileStyles.statusBadge,
                  a.enabled ? mobileStyles.statusEnabled : mobileStyles.statusDisabled
                ]}>
                  <Text style={[
                    mobileStyles.statusText,
                    a.enabled ? mobileStyles.textEnabled : mobileStyles.textDisabled
                  ]}>
                    {a.enabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <>
      <Navbar />
      {!cookies.token && (
        <div style={webStyles.pageContainer}>
          <h2 style={webStyles.title}>Welcome to the AREA Home Page</h2>
        </div>
      )}
      {cookies.token && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <h3 style={{ color: '#fff', margin: '0 0 12px 0' }}>Public workflows</h3>
            {Array.isArray(workflows) && workflows.length === 0 && (
              <div style={{ color: '#aaa' }}>No public workflows available.</div>
            )}
            {Array.isArray(workflows) && workflows.map((a: any) => (
              <div key={a.id || a.name} style={webStyles.column}>
                <div style={webStyles.itemWrapper}>
                  <div style={webStyles.card}>
                      <div style={webStyles.cardHeader}>
                        <div style={webStyles.cardTitle}>{a.name}</div>
                        <div style={webStyles.version}>v{a.version}</div>
                      </div>
                      <div style={webStyles.cardBody}>{a.description}</div>
                      <div style={{ ...webStyles.cardFooter, ...(a.enabled ? webStyles.statusEnabled : webStyles.statusDisabled) }}>{a.enabled ? "Enabled" : "Disabled"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const mobileStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#151316',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  version: {
    color: '#bbb',
    fontSize: 12,
  },
  cardBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusEnabled: {
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
  },
  statusDisabled: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textEnabled: {
    color: '#2ecc71',
  },
  textDisabled: {
    color: '#e74c3c',
  },
});

const webStyles: any = {
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '900px',
  },
  pageContainer: {
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
  itemWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    margin: 0,
    textAlign: 'center' as any,
    width: '100%'
  },
  card: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
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
  version: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 12,
  },
  statusEnabled: {
    background: 'rgba(46, 204, 113, 0.12)',
    color: '#2ecc71'
  },
  statusDisabled: {
    background: 'rgba(231, 76, 60, 0.12)',
    color: '#e74c3c'
  },
  cardBody: {
    fontSize: 13,
    opacity: 0.9,
    marginBottom: 8
  },
  cardFooter: {
    fontSize: 12,
    opacity: 0.9,
    padding: '4px 8px',
    borderRadius: 12,
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
};

export default Home;
