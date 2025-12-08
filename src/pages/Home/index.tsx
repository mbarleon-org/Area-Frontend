import React, { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { isWeb } from "../../utils/IsWeb";
import { useApi } from '../../utils/UseApi';
import { useToken } from '../../hooks/useToken';

if (isWeb) import('../../index.css');

const FILTERS = [
  { id: 'public_workflows', label: 'Public Workflows', endpoint: '/workflows/public' },
  { id: 'my_workflows', label: 'My Workflows', endpoint: '/workflows' },
  { id: 'public_credentials', label: 'Public Credentials', endpoint: '/credentials/public' },
  { id: 'my_credentials', label: 'My Credentials', endpoint: '/credentials' },
];

const Home: React.FC = () => {
  const { token } = useToken();
  const { get } = useApi();
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].id);
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    if (!token)
      return;
    let mounted = true;
    const currentFilter = FILTERS.find(f => f.id === activeFilter) || FILTERS[0];

    setData(null);
    get(currentFilter.endpoint)
      .then((res: any) => {
        if (!mounted)
          return;
        const list = res?.workflows || res?.credentials || [];
        const normalizedData = Array.isArray(list) ? list.map((item: any) => ({
          id: item.id || Math.random(),
          title: item.name || 'Unnamed',
          subtitle: item.version ? `v${item.version}` : (item.provider || ''),
          description: item.description || 'No description available',
          enabled: item.enabled !== undefined ? item.enabled : true,
        })) : [];
        setData(normalizedData);
      })
      .catch(() => {
        if (mounted) setData([]);
      });
    return () => { mounted = false; };
  }, [get, activeFilter, token]);

  // ------------------------ Not Logged In View ------------------------
  if (!token) {
    if (!isWeb) {
      return (
        <View style={mobileStyles.mainContainer}>
          <Navbar />
          <View style={mobileStyles.centerContainer}>
            <Text style={mobileStyles.title}>Welcome to the AREA Home Page</Text>
          </View>
        </View>
      );
    }
    return (
      <>
        <Navbar />
        <div style={webStyles.pageContainer}>
          <h2 style={webStyles.title}>Welcome to the AREA Home Page</h2>
        </div>
      </>
    );
  }

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.mainContainer}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.scrollContainer}>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={mobileStyles.filterScroll}>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setActiveFilter(f.id)}
                  style={[mobileStyles.filterBtn, isActive && mobileStyles.filterBtnActive]}
                >
                  <Text style={[mobileStyles.filterText, isActive && mobileStyles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {data && data.length === 0 && (
            <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
              No items found.
            </Text>
          )}

          {data && data.map((item: any) => (
            <View key={item.id} style={mobileStyles.card}>
              <View style={mobileStyles.cardHeader}>
                <Text style={mobileStyles.cardTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={mobileStyles.version}>{item.subtitle}</Text> : null}
              </View>

              <Text style={mobileStyles.cardBody}>{item.description}</Text>

              <View style={[
                mobileStyles.statusBadge,
                item.enabled ? mobileStyles.statusEnabled : mobileStyles.statusDisabled
              ]}>
                <Text style={[
                  mobileStyles.statusText,
                  item.enabled ? mobileStyles.textEnabled : mobileStyles.textDisabled
                ]}>
                  {item.enabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <>
      <Navbar />
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ width: '100%', maxWidth: 900 }}>

          <div style={webStyles.filterBar}>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    ...webStyles.filterBtn,
                    ...(isActive ? webStyles.filterBtnActive : {})
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {data && data.length === 0 && (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>No items found.</div>
          )}

          {data && data.map((item: any) => (
            <div key={item.id} style={webStyles.column}>
              <div style={webStyles.itemWrapper}>
                <div style={webStyles.card}>
                    <div style={webStyles.cardHeader}>
                      <div style={webStyles.cardTitle}>{item.title}</div>
                      {item.subtitle && <div style={webStyles.version}>{item.subtitle}</div>}
                    </div>
                    <div style={webStyles.cardBody}>{item.description}</div>
                    <div style={{ ...webStyles.cardFooter, ...(item.enabled ? webStyles.statusEnabled : webStyles.statusDisabled) }}>
                      {item.enabled ? "Enabled" : "Disabled"}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 20,
    height: 40,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
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
    backgroundColor: 'rgba(46, 204, 113, 0.12)'
  },
  statusDisabled: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  textEnabled: {
    color: '#2ecc71'
  },
  textDisabled: {
    color: '#e74c3c'
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
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    textAlign: 'center' as any,
    width: '100%',
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
    gap: '12px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '14px',
  },
  version: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: 12,
  },
  statusEnabled: {
    background: 'rgba(46, 204, 113, 0.12)',
    color: '#2ecc71',
  },
  statusDisabled: {
    background: 'rgba(231, 76, 60, 0.12)',
    color: '#e74c3c',
  },
  cardBody: {
    fontSize: '13px',
    opacity: 0.9,
    marginBottom: '8px',
  },
  cardFooter: {
    fontSize: '12px',
    opacity: 0.9,
    padding: '4px 8px',
    borderRadius: 12,
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    overflowX: 'auto',
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.1)',
  },
};

export default Home;
