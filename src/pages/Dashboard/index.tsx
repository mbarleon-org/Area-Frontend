import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { NavLink, useNavigate } from '../../utils/router';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import { useToken } from '../../hooks/useToken';
import ApiConfigInput from '../../components/ApiConfigInput';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';

if (isWeb) import('../../index.css');

const FILTERS = [
  { id: 'public_workflows', label: 'Public Workflows', endpoint: '/workflows/public' },
  { id: 'my_workflows', label: 'My Workflows', endpoint: '/workflows' },
  { id: 'public_credentials', label: 'Public Credentials', endpoint: '/credentials/public' },
  { id: 'my_credentials', label: 'My Credentials', endpoint: '/credentials' },
];

const NavLinkWrapper: React.FC<any> = ({ children, ...props }) => {
  if (typeof document !== 'undefined') {
    return <NavLink {...props}>{children}</NavLink>;
  }
  try {
    const { TouchableOpacity: TO, Text: T } = require('react-native');
    return (
      <TO onPress={() => {}}>
        <T>{children}</T>
      </TO>
    );
  } catch {
    return <>{children}</>;
  }
};

const Dashboard: React.FC = () => {
  const { token } = useToken();
  const { get, post, del } = useApi();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState(FILTERS[0].id);
  const [data, setData] = useState<any[] | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredToggleId, setHoveredToggleId] = useState<string | null>(null);
  const [hoveredMoreId, setHoveredMoreId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; title: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const fetchData = useCallback(() => {
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
        const isWorkflow = currentFilter.id.includes('workflow');
        const parseTimestamp = (value: any) => {
          if (typeof value === 'number')
            return value;
          if (typeof value === 'string') {
            const parsed = Date.parse(value);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
        };
        const getUpdatedAt = (item: any) => parseTimestamp(
          item?.updated_at ?? item?.updatedAt ?? item?.data?.updated_at ?? item?.datas?.updated_at ?? item?.canvas?.updated_at
        );

        const sortedList = Array.isArray(list)
          ? (isWorkflow ? [...list].sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a)) : list)
          : [];

        const normalizedData = Array.isArray(sortedList) ? sortedList.map((item: any) => ({
          id: item.id || Math.random(),
          title: item.pretty_name || item.name || 'Unnamed',
          subtitle: item.version ? `v${item.version}` : (item.provider || ''),
          description: item.description || 'No description available',
          enabled: item.enabled !== undefined ? item.enabled : true,
          raw: item,
          type: isWorkflow ? 'workflow' : 'credential',
        })) : [];
        setData(normalizedData);
      })
      .catch(() => {
        if (mounted) setData([]);
      });
    return () => { mounted = false; };
  }, [activeFilter, get, token]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const isWorkflowFilter = activeFilter.includes('workflow');
  const isMyWorkflows = activeFilter === 'my_workflows';

  const handleEdit = (item: any) => {
    if (!isWorkflowFilter)
      return;
    navigate('/automations', { state: { workflow: item.raw || item } });
  };

  const handleDelete = async (item: any) => {
    if (!isMyWorkflows)
      return;
    setConfirmTarget({ id: item.id, title: item.title || item.name || 'this workflow' });
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget)
      return;
    try {
      await del(`/workflows/${confirmTarget.id}`);
      setConfirmTarget(null);
      setMenuOpenId(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete workflow', err);
    }
  };

  const handleToggleEnable = async (item: any) => {
    if (!isWorkflowFilter)
      return;
    const action = item.enabled ? 'disable' : 'enable';
    try {
      await post(`/workflows/${item.id}/${action}`, {});
      setData((prev) => prev ? prev.map((d) => d.id === item.id ? { ...d, enabled: !d.enabled } : d) : prev);
    } catch (err) {
      console.error('Failed to toggle workflow', err);
    }
  };

  if (!token) {
    if (!isWeb) {
      return (
        <View style={mobileStyles.mainContainer}>
          <Navbar />
          <View style={mobileStyles.centerContainer}>
            <Text style={mobileStyles.title}>Welcome to the AREA Dashboard</Text>
            <Text style={mobileStyles.subtitle}>Please log in to access your workflows and credentials.</Text>
            <TouchableOpacity
              onPress={() => setShowConfig(!showConfig)}
              style={mobileStyles.configToggle}
            >
              <Text style={mobileStyles.configToggleText}>
                {showConfig ? '▲ Hide Server Config' : '▼ Server Config'}
              </Text>
            </TouchableOpacity>
            {showConfig && (
              <View style={mobileStyles.configContainer}>
                <ApiConfigInput showReset={true} />
              </View>
            )}
          </View>
        </View>
      );
    }
    return (
      <>
        <Navbar />
        <div style={webStyles.pageContainer}>
          <h2 style={webStyles.title}>Welcome to the AREA Dashboard</h2>
        </div>
      </>
    );
  }

  if (!isWeb) {
    const { useNavigation } = require('@react-navigation/native');
    const navigation = useNavigation();
    return (
      <View style={mobileStyles.mainContainer}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.scrollContainer}>
          <TouchableOpacity
            style={{ backgroundColor: '#2b2b2b', padding: 12, borderRadius: 6, marginBottom: 16, marginTop: 10 }}
            onPress={() => navigation.navigate('Automations')}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>+ New automation</Text>
          </TouchableOpacity>
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
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={mobileStyles.cardTitle}>{item.title}</Text>
                    {item.subtitle ? <Text style={mobileStyles.version}>{item.subtitle}</Text> : null}
                </View>

                {isMyWorkflows && (
                  <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                        onPress={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                        style={mobileStyles.moreBtn}
                    >
                        <Text style={mobileStyles.moreBtnText}>⋮</Text>
                    </TouchableOpacity>

                    {menuOpenId === item.id && (
                        <View style={mobileStyles.mobileDropdown}>
                            <TouchableOpacity
                                style={mobileStyles.mobileDropdownItem}
                                onPress={() => {
                                    setMenuOpenId(null);
                                    navigation.navigate('Automations', { workflow: item.raw || item });
                                }}
                            >
                                <Text style={mobileStyles.mobileDropdownText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={mobileStyles.mobileDropdownItem}
                                onPress={() => {
                                    handleDelete(item);
                                }}
                            >
                                <Text style={[mobileStyles.mobileDropdownText, { color: '#e74c3c' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                  </View>
                )}
              </View>

              <Text style={mobileStyles.cardBody}>{item.description}</Text>

              <View style={mobileStyles.footerRow}>
                <View style={[mobileStyles.statusBadge, item.enabled ? mobileStyles.statusEnabled : mobileStyles.statusDisabled]}>
                  <Text style={[mobileStyles.statusText, item.enabled ? mobileStyles.textEnabled : mobileStyles.textDisabled]}>
                    {item.enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                {isWorkflowFilter && (
                  <TouchableOpacity
                    style={mobileStyles.toggleBtn}
                    onPress={() => handleToggleEnable(item)}
                  >
                    <Text style={mobileStyles.toggleBtnText}>
                      {item.enabled ? 'Disable' : 'Enable'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Mobile Confirmation Modal */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={!!confirmTarget}
            onRequestClose={() => setConfirmTarget(null)}
        >
            <View style={mobileStyles.modalOverlay}>
                <View style={mobileStyles.modalContent}>
                    <Text style={mobileStyles.modalTitle}>Delete workflow?</Text>
                    <Text style={mobileStyles.modalText}>
                        You are about to delete "{confirmTarget?.title}". This action cannot be undone.
                    </Text>
                    <View style={mobileStyles.modalActions}>
                        <TouchableOpacity
                            style={mobileStyles.modalBtnCancel}
                            onPress={() => setConfirmTarget(null)}
                        >
                            <Text style={mobileStyles.modalBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={mobileStyles.modalBtnDelete}
                            onPress={handleConfirmDelete}
                        >
                            <Text style={mobileStyles.modalBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
      </View>
    );
  }

  return (
    <>
      <Navbar />
      <div style={webStyles.mainLayout}>
        <div style={webStyles.topBar}>
          <NavLinkWrapper to="/automations" style={{ textDecoration: 'none' }}>
            <button style={webStyles.addButton}>+ New automation</button>
          </NavLinkWrapper>
        </div>

        <div style={webStyles.centerContent}>
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

          <div style={{ width: '100%', maxWidth: 900 }}>
            {data && data.length === 0 && (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>No items found.</div>
            )}

            {data && data.map((item: any) => (
              <div key={item.id} style={webStyles.column}>
                <div style={webStyles.itemWrapper}>
                  <div
                    style={{
                      ...webStyles.card,
                      ...(hoveredCardId === item.id ? webStyles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCardId(item.id)}
                    onMouseLeave={() => setHoveredCardId((prev) => (prev === item.id ? null : prev))}
                  >
                    <div style={webStyles.cardHeader}>
                      <div style={webStyles.cardTitle}>{item.title}</div>
                      <div style={webStyles.headerRight}>
                        {item.subtitle && <div style={{ ...webStyles.status, ...(item.enabled ? webStyles.statusEnabled : webStyles.statusDisabled) }}>{item.enabled ? 'Enabled' : 'Disabled'}</div>}
                        {isMyWorkflows && (
                          <div style={webStyles.moreWrapper}>
                            <button
                              style={{
                                ...webStyles.moreBtn,
                                ...(hoveredMoreId === item.id ? webStyles.moreBtnHover : {}),
                              }}
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}
                              onMouseEnter={() => setHoveredMoreId(item.id)}
                              onMouseLeave={() => setHoveredMoreId((prev) => (prev === item.id ? null : prev))}
                            >
                              ⋯
                            </button>
                            {menuOpenId === item.id && (
                              <div style={webStyles.dropdown}>
                                <button style={webStyles.dropdownItem} onClick={() => { handleEdit(item); setMenuOpenId(null); }}>Edit</button>
                                <button style={webStyles.dropdownItem} onClick={() => { handleDelete(item); }}>Delete</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={webStyles.cardBody}>{item.description}</div>
                    <div style={webStyles.cardFooterRow}>
                      {isWorkflowFilter && (
                        <button
                          style={{
                            ...webStyles.toggleBtn,
                            ...(item.enabled ? webStyles.toggleDisable : webStyles.toggleEnable),
                            ...(hoveredToggleId === item.id ? (item.enabled ? webStyles.toggleHoverEnabled : webStyles.toggleHoverDisabled) : {}),
                          }}
                          onMouseEnter={() => setHoveredToggleId(item.id)}
                          onMouseLeave={() => setHoveredToggleId((prev) => (prev === item.id ? null : prev))}
                          onClick={() => handleToggleEnable(item)}
                        >
                          {item.enabled ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirmTarget && (
        <div style={webStyles.confirmOverlay} onClick={() => setConfirmTarget(null)}>
          <div style={webStyles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={webStyles.confirmTitle}>Delete workflow?</div>
            <div style={webStyles.confirmText}>You are about to delete "{confirmTarget.title}". This action cannot be undone.</div>
            <div style={webStyles.confirmActions}>
              <button style={webStyles.confirmCancel} onClick={() => setConfirmTarget(null)}>Cancel</button>
              <button style={webStyles.confirmDelete} onClick={handleConfirmDelete}>Delete</button>
            </div>
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
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  configToggle: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  configToggleText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  configContainer: {
    width: '90%',
    maxWidth: 400,
    marginTop: 15,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    zIndex: 10,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 10,
  },
  version: {
    color: '#bbb',
    fontSize: 12,
  },
  moreBtn: {
    padding: 4,
  },
  moreBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mobileDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 999,
  },
  mobileDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  mobileDropdownText: {
    color: '#fff',
    fontSize: 14,
  },
  cardBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    zIndex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
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
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#2c3e50',
  },
  toggleBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalBtnDelete: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(231,76,60,0.8)',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
  }
});

const webStyles: any = {
  mainLayout: {
    marginLeft: '100px',
    width: 'calc(100% - 100px)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#151316',
    color: '#fff',
  },
  topBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },
  centerContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '40px',
  },
  addButton: {
    background: '#2b2b2b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '15px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: '600',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
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
    position: 'relative',
    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
  },
  cardHover: {
    transform: 'scale(1.01)',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  version: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.08)',
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
  cardFooterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
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
  moreWrapper: {
    position: 'relative',
  },
  moreBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 6,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
  moreBtnHover: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  dropdown: {
    position: 'absolute',
    top: 32,
    right: 0,
    background: '#1f1f24',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    minWidth: 140,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownItem: {
    padding: '10px 12px',
    background: 'transparent',
    color: '#fff',
    border: 'none',
    textAlign: 'left' as any,
    cursor: 'pointer',
  },
  toggleBtn: {
    padding: '6px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  toggleEnable: {
    border: '1px solid rgba(46, 204, 113, 0.5)',
  },
  toggleDisable: {
    border: '1px solid rgba(231, 76, 60, 0.5)',
  },
  toggleHoverEnabled: {
    background: 'rgba(231, 76, 60, 0.5)',
    color: '#fff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
  },
  toggleHoverDisabled: {
    background: 'rgba(46, 204, 113, 0.5)',
    color: '#fff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
  },
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  },
  confirmModal: {
    background: '#1f1f24',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 420,
    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
    color: '#fff',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmCancel: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },
  confirmDelete: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid rgba(231,76,60,0.45)',
    background: 'rgba(231,76,60,0.7)',
    color: '#fff',
    cursor: 'pointer',
  },
  status: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 12,
  },
};

export default Dashboard;
