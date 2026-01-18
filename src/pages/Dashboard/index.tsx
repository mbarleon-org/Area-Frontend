import React, { useCallback, useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { NavLink, useNavigate } from '../../utils/router';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import { useToken } from '../../hooks/useToken';
import ApiConfigInput from '../../components/ApiConfigInput';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import Svg, { Defs, Rect, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { webStyles, mobileStyles } from './Dashboard.styles';
import AddCredentialModal from '../../components/Dashboard/AddCredentialModal';
import { TeamSelector, AddMemberModal } from '../../components/UserTeamManager';
import type { Team } from '../../components/UserTeamManager';

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
    return <TO onPress={() => {}}><T>{children}</T></TO>;
  } catch {
    return <>{children}</>;
  }
};

const Dashboard: React.FC = () => {
  const { token } = useToken();
  const { get, post, del } = useApi();
  const navigate = useNavigate();

  // Mobile navigation
  let navigationMobile: any = { navigate: (_: any) => {} };
  if (!isWeb) {
    try {
      const rnNav = require('@react-navigation/native');
      if (rnNav && rnNav.useNavigation) {
        navigationMobile = rnNav.useNavigation();
      }
    } catch (e) {
      // Fallback
    }
  }

  const [activeFilter, setActiveFilter] = useState(FILTERS[0].id);
  const [data, setData] = useState<any[] | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [_hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{ id: string; title: string; type: 'workflow'|'credential' } | null>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [showAddCredential, setShowAddCredential] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username?: string } | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(() => {
    if (!token) return;
    let mounted = true;
    const currentFilter = FILTERS.find(f => f.id === activeFilter) || FILTERS[0];

    setData(null);
    get(currentFilter.endpoint)
      .then((res: any) => {
        if (!mounted) return;
        const list = res?.workflows || res?.credentials || [];
        const isWorkflow = currentFilter.id.includes('workflow');

        // Helper to normalize timestamp for sorting
        const parseTimestamp = (value: any) => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            const parsed = Date.parse(value);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
        };

        const getUpdatedAt = (item: any) => parseTimestamp(
          item?.updated_at ?? item?.updatedAt ?? item?.data?.updated_at ?? item?.datas?.updated_at ?? item?.canvas?.updated_at
        );

        // Sort items by date descending
        const sortedList = Array.isArray(list)
          ? (isWorkflow ? [...list].sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a)) : list)
          : [];

        // Normalize data structure
        const normalizedData = Array.isArray(sortedList) ? sortedList.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.pretty_name || item.name || 'Unnamed',
          subtitle: item.version ? `v${item.version}` : (item.provider || ''),
          description: item.description || 'No description available',
          enabled: item.enabled !== undefined ? item.enabled : true,
          raw: item,
          type: isWorkflow ? 'workflow' : 'credential',
        })) : [];

        setData(normalizedData);
      })
      .catch(() => { if (mounted) setData([]); });
    return () => { mounted = false; };
  }, [activeFilter, get, token]);

  useEffect(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }
    let mounted = true;
    get('/users/me')
      .then((res: any) => {
        if (!mounted) return;
        const user = res?.user || res;
        setCurrentUser(user && user.id ? user : null);
      })
      .catch(() => {
        if (mounted) setCurrentUser(null);
      });
    return () => {
      mounted = false;
    };
  }, [get, token]);

  useEffect(() => {
    setMenuOpenId(null);
  }, [activeFilter]);

  const isWorkflowFilter = activeFilter.includes('workflow');
  const isMyWorkflows = activeFilter === 'my_workflows';
  const isMyCredentials = activeFilter === 'my_credentials';

  const handleEdit = (item: any) => {
    if (item.type !== 'workflow') return;
    if (isWeb) {
      navigate('/automations', { state: { workflow: item.raw || item } });
    } else {
      navigationMobile.navigate('Automations', { workflow: item.raw || item });
    }
  };

  const handleDelete = async (item: any) => {
    const type = item.type;
    setConfirmTarget({ id: item.id, title: item.title || item.name, type });
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      // Determine endpoint based on item type
      const endpoint = confirmTarget.type === 'workflow'
        ? `/workflows/${confirmTarget.id}`
        : `/credentials/${confirmTarget.id}`;

      await del(endpoint);

      setConfirmTarget(null);
      setMenuOpenId(null);

      // Optimistic update
      setData(prev => prev ? prev.filter(i => i.id !== confirmTarget.id) : []);
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleToggleEnable = async (item: any) => {
    if (item.type !== 'workflow') return;
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
          <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
              <Defs>
                <SvgRadialGradient id="grad" cx="50%" cy="-10%" rx="80%" ry="60%" fx="50%" fy="-10%" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#333" stopOpacity="1" />
                  <Stop offset="1" stopColor="#050505" stopOpacity="1" />
                </SvgRadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
            </Svg>
          </View>
          <Navbar />
          <ScrollView contentContainerStyle={mobileStyles.centerScroll} showsVerticalScrollIndicator={false}>
            <Text style={mobileStyles.heroTitle}>Dashboard</Text>
            <Text style={mobileStyles.heroSubtitle}>Please log in to access your workflows.</Text>
            <TouchableOpacity onPress={() => setShowConfig(!showConfig)} style={mobileStyles.configToggle}>
              <Text style={mobileStyles.configToggleText}>{showConfig ? 'Close Configuration' : 'Configure Server'}</Text>
            </TouchableOpacity>
            {showConfig && (
              <View style={mobileStyles.configContainer}>
                <ApiConfigInput showReset={true} />
              </View>
            )}
          </ScrollView>
        </View>
      );
    }
    return (
      <>
        <Navbar />
        <div style={webStyles.pageShell}>
          <div style={webStyles.spotlight} />
          <div style={webStyles.containerCenter}>
            <h2 style={webStyles.heroTitle}>Welcome to Dashboard</h2>
            <p style={webStyles.heroSubtitle}>Please log in to continue.</p>
          </div>
        </div>
      </>
    );
  }

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.mainContainer}>
        <View style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <SvgRadialGradient id="grad" cx="50%" cy="0%" rx="90%" ry="50%" fx="50%" fy="0%" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#252525" stopOpacity="1" />
                <Stop offset="1" stopColor="#050505" stopOpacity="1" />
              </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
          </Svg>
        </View>

        <Navbar />
        <Animated.ScrollView
          contentContainerStyle={mobileStyles.scrollContainer}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={mobileStyles.actionButton} onPress={() => navigationMobile.navigate('Automations')}>
            <Text style={mobileStyles.actionButtonText}>+ New Automation</Text>
          </TouchableOpacity>

          {/* Team Selector */}
          <TeamSelector
            selectedTeam={selectedTeam}
            onTeamSelect={setSelectedTeam}
            onAddMemberPress={(team) => { setSelectedTeam(team); setShowAddMember(true); }}
            currentUserId={currentUser?.id}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={mobileStyles.filterScroll}>
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => { setActiveFilter(f.id); setMenuOpenId(null); }}
                    style={[mobileStyles.filterBtn, isActive && mobileStyles.filterBtnActive]}
                  >
                    <Text style={[mobileStyles.filterText, isActive && mobileStyles.filterTextActive]}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {isMyCredentials && (
              <TouchableOpacity
                onPress={() => setShowAddCredential(true)}
                style={{
                  marginLeft: 8,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  marginTop: -25
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          {data && data.length === 0 && <Text style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>No items found.</Text>}

          {data && data.map((item: any) => (
            <View key={item.id} style={mobileStyles.card}>
              <View style={mobileStyles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={mobileStyles.cardTitle}>{item.title}</Text>
                    {item.subtitle ? <Text style={mobileStyles.version}>{item.subtitle}</Text> : null}
                </View>
                {(isMyWorkflows || isMyCredentials) && (
                  <View style={{ position: 'relative' }}>
                    <TouchableOpacity onPress={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)} style={mobileStyles.moreBtn}>
                        <Text style={mobileStyles.moreBtnText}>⋮</Text>
                    </TouchableOpacity>
                    {menuOpenId === item.id && (
                        <View style={mobileStyles.mobileDropdown}>
                            {item.type === 'workflow' && (
                              <TouchableOpacity style={mobileStyles.mobileDropdownItem} onPress={() => { setMenuOpenId(null); handleEdit(item); }}>
                                  <Text style={mobileStyles.mobileDropdownText}>Edit</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity style={mobileStyles.mobileDropdownItem} onPress={() => handleDelete(item)}>
                                <Text style={[mobileStyles.mobileDropdownText, { color: '#e74c3c' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                  </View>
                )}
              </View>
              <Text style={mobileStyles.cardBody}>{item.description}</Text>

              {/* Footer only shows for workflows */}
              {item.type === 'workflow' && (
                <View style={mobileStyles.footerRow}>
                  <View style={[mobileStyles.statusBadge, item.enabled ? mobileStyles.statusEnabled : mobileStyles.statusDisabled]}>
                    <Text style={[mobileStyles.statusText, item.enabled ? mobileStyles.textEnabled : mobileStyles.textDisabled]}>
                      {item.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  {isWorkflowFilter && (
                    <TouchableOpacity style={mobileStyles.toggleBtn} onPress={() => handleToggleEnable(item)}>
                      <Text style={mobileStyles.toggleBtnText}>{item.enabled ? 'Disable' : 'Enable'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </Animated.ScrollView>

        {showAddCredential && (
          <AddCredentialModal
            onClose={() => setShowAddCredential(false)}
            onSuccess={() => { setShowAddCredential(false); fetchData(); }}
          />
        )}

        {/* Add Team Member Modal */}
        {showAddMember && (
          <AddMemberModal
            team={selectedTeam}
            onClose={() => setShowAddMember(false)}
            onSuccess={() => setShowAddMember(false)}
            currentUserId={currentUser?.id ?? null}
            onTeamCreated={(newTeam) => setSelectedTeam(newTeam)}
            onTeamDeleted={(teamId) => {
              if (selectedTeam?.id === teamId) setSelectedTeam(null);
              setShowAddMember(false);
            }}
          />
        )}

        <Modal animationType="fade" transparent={true} visible={!!confirmTarget} onRequestClose={() => setConfirmTarget(null)}>
            <View style={mobileStyles.modalOverlay}>
                <View style={mobileStyles.modalContent}>
                    <Text style={mobileStyles.modalTitle}>Delete {confirmTarget?.type}?</Text>
                    <Text style={mobileStyles.modalText}>This will permanently delete "{confirmTarget?.title}". This action cannot be undone.</Text>
                    <View style={mobileStyles.modalActions}>
                        <TouchableOpacity style={mobileStyles.modalBtnCancel} onPress={() => setConfirmTarget(null)}>
                            <Text style={mobileStyles.modalBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={mobileStyles.modalBtnDelete} onPress={handleConfirmDelete}>
                            <Text style={mobileStyles.modalBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
      </View>
    );
  }

  // ------------------------ Web view ------------------------
  return (
    <>
      <Navbar />
      <style>
        {`
          ::selection { background-color: #ffffff; color: #000000; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .hover-card { transition: all 0.3s ease; }
          .hover-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.05) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .btn-hover { transition: all 0.2s ease; opacity: 0.9; }
          .btn-hover:hover { opacity: 1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,255,255,0.1); }
          .btn-icon-hover:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
          .dropdown-item-hover {
            transition: background 0.15s ease, color 0.15s ease;
          }
          .dropdown-item-hover:hover {
            background-color: rgba(255,255,255,0.08) !important;
            color: #ffffff !important;
          }
          .dropdown-item-delete:hover {
            background-color: rgba(231, 76, 60, 0.15) !important;
            color: #e74c3c !important;
          }
        `}
      </style>
      <div style={webStyles.pageShell}>
        <div style={webStyles.spotlight} />
        <div style={webStyles.mainLayout}>
          <div style={webStyles.topBar}>
            <NavLinkWrapper to="/automations" style={{ textDecoration: 'none' }}>
              <button style={webStyles.addButton} className="btn-hover">+ New Automation</button>
            </NavLinkWrapper>

            {/* Team Selector */}
            <div style={{ marginLeft: 'auto' }}>
              <TeamSelector
                selectedTeam={selectedTeam}
                onTeamSelect={setSelectedTeam}
                onAddMemberPress={(team) => { setSelectedTeam(team); setShowAddMember(true); }}
                currentUserId={currentUser?.id}
              />
            </div>
          </div>
          <div style={webStyles.centerContent}>
            <div style={webStyles.filterBar}>
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { setActiveFilter(f.id); setMenuOpenId(null); }}
                    style={{ ...webStyles.filterBtn, ...(isActive ? webStyles.filterBtnActive : {}) }}
                    className="btn-hover"
                  >
                    {f.label}
                  </button>
                );
              })}

              {isMyCredentials && (
                <button
                  style={webStyles.plusButton}
                  className="btn-icon-hover"
                  onClick={() => setShowAddCredential(true)}
                  title="Add new credential"
                >
                  +
                </button>
              )}
            </div>

            <div style={{ width: '100%', maxWidth: 900 }}>
              {data && data.length === 0 && <div style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No items found.</div>}
              {data && data.map((item: any, index: number) => (
                <div key={item.id} style={{...webStyles.itemWrapper, animationDelay: `${index * 0.05}s`}} className="animate-fade-up">
                  <div style={webStyles.card} className="hover-card" onMouseEnter={() => setHoveredCardId(item.id)} onMouseLeave={() => setHoveredCardId(null)}>
                    <div style={webStyles.cardHeader}>
                      <div style={webStyles.cardTitle}>{item.title}</div>
                      <div style={webStyles.headerRight}>
                        {item.subtitle && <span style={webStyles.versionPill}>{item.subtitle}</span>}
                        {(isMyWorkflows || isMyCredentials) && (
                          <div style={webStyles.moreWrapper}>
                            <button style={webStyles.moreBtn} className="btn-icon-hover" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}>⋮</button>
                            {menuOpenId === item.id && (
                              <div style={webStyles.dropdown}>
                                {item.type === 'workflow' && (
                                  <button style={webStyles.dropdownItem} className="dropdown-item-hover" onClick={() => { handleEdit(item); setMenuOpenId(null); }}>Edit</button>
                                )}
                                <button style={{...webStyles.dropdownItem, color: '#e74c3c'}} className="dropdown-item-delete" onClick={() => handleDelete(item)}>Delete</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={webStyles.cardBody}>{item.description}</div>

                    {/* Only show status footer for Workflows */}
                    {item.type === 'workflow' && (
                      <div style={webStyles.cardFooterRow}>
                        <div style={item.enabled ? webStyles.statusEnabled : webStyles.statusDisabled}>{item.enabled ? 'Active' : 'Inactive'}</div>
                        {isWorkflowFilter && (
                          <button style={webStyles.toggleBtn} className="btn-hover" onClick={() => handleToggleEnable(item)}>{item.enabled ? 'Disable' : 'Enable'}</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmTarget && (
        <div style={webStyles.confirmOverlay} onClick={() => setConfirmTarget(null)}>
          <div style={webStyles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={webStyles.confirmTitle}>Delete {confirmTarget.type}?</div>
            <div style={webStyles.confirmText}>This will permanently delete "{confirmTarget.title}". This action cannot be undone.</div>
            <div style={webStyles.confirmActions}>
              <button style={webStyles.confirmCancel} className="btn-hover" onClick={() => setConfirmTarget(null)}>Cancel</button>
              <button style={webStyles.confirmDelete} className="btn-hover" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddCredential && (
        <AddCredentialModal
          onClose={() => setShowAddCredential(false)}
          onSuccess={() => {
            setShowAddCredential(false);
            fetchData();
          }}
        />
      )}

      {/* Add Team Member Modal */}
      {showAddMember && (
        <AddMemberModal
          team={selectedTeam}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => setShowAddMember(false)}
          currentUserId={currentUser?.id ?? null}
          onTeamCreated={(newTeam) => setSelectedTeam(newTeam)}
          onTeamDeleted={(teamId) => {
            if (selectedTeam?.id === teamId) setSelectedTeam(null);
            setShowAddMember(false);
          }}
        />
      )}
    </>
  );
};

export default Dashboard;
