import React, { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useApi } from "../../utils/UseApi";
import { ADMIN_FILTERS } from "../../constants/AdminFilters";
import { normalizeAdminData } from "../../utils/adminDataNormalizer";
import type { AdminCardData, AdminUser, AdminTeam, AdminWorkflow, AdminCredential } from "../../types/AdminTypes";
import AdminCard from "../../components/AdminCard";
import AdminDetailModal from "../../components/AdminDetailModal";
import AdminSearchBar from "../../components/AdminSearchBar";
import AdminConfirmModal from "../../components/AdminConfirmModal";
import AdminCreateModal from "../../components/AdminCreateModal";
import { usersApi } from "../../services/admin/usersApi";
import { teamsApi } from "../../services/admin/teamsApi";
import { workflowsApi } from "../../services/admin/workflowsApi";
import { credentialsApi } from "../../services/admin/credentialsApi";
if (isWeb) import("../../index.css");

const AdminPanel: React.FC = () => {
  const { get, put, del, post } = useApi();
  const [activeFilter, setActiveFilter] = useState(ADMIN_FILTERS[0].id);
  const [data, setData] = useState<AdminCardData[] | null>(null);
  const [rawData, setRawData] = useState<(AdminUser | AdminTeam | AdminWorkflow | AdminCredential)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<AdminCardData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmItem, setConfirmItem] = useState<AdminCardData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [hoverCreateBtn, setHoverCreateBtn] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const fetchData = useCallback(() => {
    let mounted = true;
    const currentFilter = ADMIN_FILTERS.find((f) => f.id === activeFilter) || ADMIN_FILTERS[0];

    setData(null);
    get(currentFilter.endpoint)
      .then((res: any) => {
        if (!mounted) return;
        const rawList =
          res?.users ||
          res?.teams ||
          res?.workflows ||
          res?.credentials ||
          (Array.isArray(res) ? res : []);

        // Store raw data for search functionality
        setRawData(rawList);

        const normalized = normalizeAdminData(currentFilter.id, rawList);
        setData(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch admin data", err);
        if (mounted) setData([]);
      });

    return () => {
      mounted = false;
    };
  }, [activeFilter, get]);

  useEffect(() => {
    const cleanup = fetchData();
    setSearchQuery("");
    setPage(1);
    return cleanup;
  }, [fetchData]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!searchQuery.trim()) return data;

    const q = searchQuery.toLowerCase();

    // Filter based on active filter type
    const filteredRaw = rawData.filter((item: any) => {
      const id = (item.id ?? '').toString().toLowerCase();
      const name = (item.name ?? item.username ?? '').toString().toLowerCase();

      switch (activeFilter) {
        case 'users': {
          const email = (item.email ?? '').toString().toLowerCase();
          const username = (item.username ?? '').toString().toLowerCase();
          return id.includes(q) || email.includes(q) || username.includes(q);
        }
        case 'teams':
          return id.includes(q) || name.includes(q);
        case 'workflows': {
          const prettyName = (item.pretty_name ?? '').toString().toLowerCase();
          return id.includes(q) || name.includes(q) || prettyName.includes(q);
        }
        case 'credentials': {
          const type = (item.type ?? '').toString().toLowerCase();
          return id.includes(q) || name.includes(q) || type.includes(q);
        }
        default:
          return id.includes(q) || name.includes(q);
      }
    });

    return normalizeAdminData(activeFilter, filteredRaw);
  }, [data, activeFilter, searchQuery, rawData]);

  const totalItems = filteredData?.length ?? 0;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    if (!filteredData) return null;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const handleView = (item: AdminCardData) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (item: AdminCardData) => {
    setConfirmItem(item);
    setConfirmVisible(true);
  };

  const confirmDelete = async (item: AdminCardData) => {
    setDeleting(true);
    try {
      switch (item.type) {
        case 'user':
          await usersApi.delete(del, item.id);
          break;
        case 'team':
          await teamsApi.delete(del, item.id);
          break;
        case 'workflow':
          await workflowsApi.delete(del, item.id);
          break;
        case 'credential':
          await credentialsApi.delete(del, item.id);
          break;
        default:
          break;
      }
      fetchData();
    } catch (err) {
      console.error('Failed to delete item', err);
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
      setConfirmItem(null);
    }
  };

  const handleSave = async (id: string, type: string, changes: Record<string, any>): Promise<boolean> => {
    try {
      switch (type) {
        case 'user':
          await usersApi.update(put, id, changes);
          break;
        case 'team':
          await teamsApi.update(put, id, changes);
          break;
        case 'workflow': {
          // Preserve description and ensure pretty_name is explicit
          const current = selectedItem?.raw as any;
          const prettyName =
            (changes as any).pretty_name ?? current?.pretty_name ?? current?.name ?? '';
          const machineName = prettyName ? prettyName.replace(/\s+/g, '_').toLowerCase() : current?.name;
          const description = (changes as any).description ?? current?.description ?? '';
          const enabled = (changes as any).enabled ?? current?.enabled;

          await workflowsApi.update(put, id, {
            ...changes,
            pretty_name: prettyName,
            name: machineName,
            description,
            enabled,
          });
          break;
        }
        case 'credential': {
          const current = selectedItem?.raw as any;
          const name = (changes as any).name ?? current?.name ?? '';
          const description = (changes as any).description ?? current?.description ?? '';
          const credentialType = (changes as any).type ?? current?.type ?? '';
          const version = (changes as any).version ?? current?.version;
          const data = (changes as any).data ?? current?.data;

          if (!credentialType) {
            console.error('Missing credential type; aborting update to avoid 500');
            return false;
          }

          await credentialsApi.update(put, id, {
            id,
            name,
            description,
            type: credentialType,
            ...(version ? { version } : {}),
            ...(data ? { data } : {}),
          });
          break;
        }
        default:
          // fallback to generic put
          await put(`/${type}s/${id}`, changes);
          break;
      }

      fetchData(); // Refresh data after save
      return true;
    } catch (err) {
      console.error("Failed to save changes", err);
      return false;
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleCreateUser = async (userData: { username: string; email: string; password?: string }): Promise<boolean> => {
    try {
      await post('/users', userData);
      fetchData();
      return true;
    } catch (err) {
      console.error('Failed to create user', err);
      return false;
    }
  };

  const handleCreateTeam = async (teamData: { name: string }): Promise<boolean> => {
    try {
      await post('/teams', teamData);
      fetchData();
      return true;
    } catch (err) {
      console.error('Failed to create team', err);
      return false;
    }
  };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.container}>
        <Navbar />
        <ScrollView contentContainerStyle={mobileStyles.content}>
          <View style={mobileStyles.headerRow}>
            <View>
              <Text style={mobileStyles.title}>Admin Panel</Text>
              <Text style={{ color: '#888', marginBottom: 20, fontWeight: '400' }}>Have a wonderful day feeling divinely powerful.</Text>
            </View>
            <TouchableOpacity
              style={mobileStyles.createBtn}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={mobileStyles.createBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={mobileStyles.filterScroll}
          >
            {ADMIN_FILTERS.map((f) => {
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

          {/* Search Bar for all filters */}
          <AdminSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            filterType={activeFilter as any}
          />

          {/* Data Cards */}
          {paginatedData === null && (
            <Text style={mobileStyles.loadingText}>Loading...</Text>
          )}
          {paginatedData && paginatedData.length === 0 && (
            <Text style={mobileStyles.emptyText}>No items found.</Text>
          )}
          {paginatedData && paginatedData.map((item) => (
            <AdminCard
              key={item.id}
              data={item}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}

          {/* Pagination Controls */}
          {totalItems > pageSize && (
            <View style={mobileStyles.pagination}>
              <TouchableOpacity
                style={[mobileStyles.pageBtn, page === 1 && mobileStyles.pageBtnDisabled]}
                onPress={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                <Text style={mobileStyles.pageBtnText}>Prev</Text>
              </TouchableOpacity>
              <Text style={mobileStyles.pageInfo}>{page} / {totalPages}</Text>
              <TouchableOpacity
                style={[mobileStyles.pageBtn, page === totalPages && mobileStyles.pageBtnDisabled]}
                onPress={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                <Text style={mobileStyles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Detail Modal */}
        <AdminDetailModal
          visible={modalVisible}
          data={selectedItem}
          onClose={handleCloseModal}
          onSave={handleSave}
          get={get}
          post={post}
          del={del}
          onRefresh={fetchData}
        />

        <AdminConfirmModal
          visible={confirmVisible}
          item={confirmItem}
          onCancel={() => { setConfirmVisible(false); setConfirmItem(null); }}
          onConfirm={async (it) => confirmDelete(it)}
          loading={deleting}
        />

        <AdminCreateModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreateUser={handleCreateUser}
          onCreateTeam={handleCreateTeam}
        />
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <>
      <Navbar />
      <div style={webStyles.page}>
        <div style={webStyles.card}>
          <div style={webStyles.headerRow}>
            <div>
              <h1 style={webStyles.title}>Admin Panel</h1>
              <h3 style={{ color: '#888', marginTop: '-12px', marginBottom: '24px', fontWeight: '400' }}>Have a wonderful day feeling divinely powerful.</h3>
            </div>
            <button
              style={{
                ...webStyles.createBtn,
                ...(hoverCreateBtn ? webStyles.createBtnHover : {}),
              }}
              onClick={() => setCreateModalVisible(true)}
              onMouseEnter={() => setHoverCreateBtn(true)}
              onMouseLeave={() => setHoverCreateBtn(false)}
            >
              Create Mode
            </button>
          </div>

          {/* Filter Bar */}
          <div style={webStyles.filterBar}>
            {ADMIN_FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    ...webStyles.filterBtn,
                    ...(isActive ? webStyles.filterBtnActive : {}),
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar for all filters */}
          <AdminSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            filterType={activeFilter as any}
          />

          {/* Data Cards */}
          <div style={webStyles.cardList}>
            {paginatedData === null && (
              <div style={webStyles.loadingText}>Loading...</div>
            )}
            {paginatedData && paginatedData.length === 0 && (
              <div style={webStyles.emptyText}>No items found.</div>
            )}
            {paginatedData && paginatedData.map((item) => (
              <AdminCard
                key={item.id}
                data={item}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalItems > pageSize && (
            <div style={webStyles.pagination}>
              <button
                style={{
                  ...webStyles.pageBtn,
                  ...(page === 1 ? webStyles.pageBtnDisabled : {}),
                }}
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <span style={webStyles.pageInfo}>{page} / {totalPages}</span>
              <button
                style={{
                  ...webStyles.pageBtn,
                  ...(page === totalPages ? webStyles.pageBtnDisabled : {}),
                }}
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AdminDetailModal
        visible={modalVisible}
        data={selectedItem}
        onClose={handleCloseModal}
        onSave={handleSave}
        get={get}
        post={post}
        del={del}
        onRefresh={fetchData}
      />

      <AdminConfirmModal
        visible={confirmVisible}
        item={confirmItem}
        onCancel={() => { setConfirmVisible(false); setConfirmItem(null); }}
        onConfirm={async (it) => confirmDelete(it)}
        loading={deleting}
      />

      <AdminCreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateUser={handleCreateUser}
        onCreateTeam={handleCreateTeam}
      />
    </>
  );
};

const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151316",
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
    flex: 1,
  },
  createBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 80,
    marginRight: 8,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  filterText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#fff",
  },
  loadingText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  pagination: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageInfo: {
    color: '#fff',
    fontWeight: '700',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  page: {
    height: "100vh",
    overflowY: "auto",
    background: "#151316",
    color: "#fff",
    boxSizing: "border-box",
    marginLeft: "100px",
    width: "100%",
    padding: "30px",
  },
  card: {
    background: "rgba(26,26,28,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "32px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
    width: "100%",
    minHeight: "calc(100vh - 60px)",
    maxHeight: "none",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "28px",
    fontWeight: 800,
  },
  createBtn: {
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#007AFF',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  createBtnHover: {
    backgroundColor: '#0066DD',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    overflowX: "auto",
  },
  filterBtn: {
    background: "transparent",
    border: "none",
    color: "#888",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "4px",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    color: "#fff",
    background: "rgba(255,255,255,0.1)",
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    flex: 1,
  },
  loadingText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: "20px",
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: "20px",
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  pageBtn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    color: '#fff',
    fontWeight: 700,
  },
};

export default AdminPanel;
