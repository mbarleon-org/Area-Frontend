import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { Team } from './TeamSelector';
import TeamDropdown from './TeamDropdown';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';

interface SearchResult {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AddMemberTabProps {
  teams: Team[];
  selectedTeam: Team | null;
  loadingTeams: boolean;
  teamDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onTeamSelect: (team: Team) => void;
  isOwner: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searching: boolean;
  searchResult: SearchResult | null;
  adding: boolean;
  onAddUser: () => void;
  error: string | null;
  successMessage: string | null;
}

const AddMemberTab: React.FC<AddMemberTabProps> = ({
  teams,
  selectedTeam,
  loadingTeams,
  teamDropdownOpen,
  onDropdownToggle,
  onTeamSelect,
  isOwner,
  searchQuery,
  onSearchChange,
  searching,
  searchResult,
  adding,
  onAddUser,
  error,
  successMessage,
}) => {
  const [showRestrictionHint, setShowRestrictionHint] = React.useState(false);
  const restrictionTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const restricted = !isOwner;
  const [inputFocused, setInputFocused] = React.useState(false);
  const [webShake, setWebShake] = React.useState(false);
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const triggerRestrictionHint = () => {
    if (!restricted) return;
    if (restrictionTimerRef.current) {
      clearTimeout(restrictionTimerRef.current);
    }
    setShowRestrictionHint(true);
    restrictionTimerRef.current = setTimeout(() => setShowRestrictionHint(false), 1800);
  };

  const runShake = () => {
    if (!restricted) return;
    if (isWeb) {
      setWebShake(true);
      setTimeout(() => setWebShake(false), 450);
      return;
    }

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 90, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const handleRestrictedHover = () => {
    if (!restricted) return;
    triggerRestrictionHint();
  };

  const handleRestrictedAttempt = () => {
    if (!restricted) return;
    triggerRestrictionHint();
    runShake();
  };

  React.useEffect(() => {
    return () => {
      if (restrictionTimerRef.current) {
        clearTimeout(restrictionTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isWeb) return;
    const styleId = 'add-member-shake-keyframes';
    if (document.getElementById(styleId)) return;
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.innerHTML = `
      @keyframes addMemberShake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-5px); }
        40% { transform: translateX(5px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(3px); }
        100% { transform: translateX(0); }
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      const existing = document.getElementById(styleId);
      existing?.remove();
    };
  }, []);

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <>
        {/* Team Selector */}
        <div style={webStyles.section}>
          <label style={webStyles.label}>Select Team</label>
          <TeamDropdown
            teams={teams}
            selectedTeam={selectedTeam}
            loading={loadingTeams}
            isOpen={teamDropdownOpen}
            onToggle={onDropdownToggle}
            onSelect={onTeamSelect}
          />
        </div>

        {/* Search Input */}
        <div style={webStyles.section}>
          <label style={webStyles.label}>Search by email or username</label>
          <div
            style={{
              ...webStyles.inputWrapper,
              ...(restricted ? webStyles.inputWrapperRestricted : {}),
              ...(isOwner && inputFocused ? webStyles.inputWrapperActive : {}),
              animation: webShake ? 'addMemberShake 0.45s ease' : undefined,
              cursor: restricted ? 'not-allowed' : 'text',
            }}
            onMouseEnter={handleRestrictedHover}
            onClick={restricted ? handleRestrictedAttempt : undefined}
          >
            {restricted && <div style={webStyles.hatchedOverlay} aria-hidden />}
            <span
              style={{
                ...webStyles.searchIcon,
                filter: restricted ? 'grayscale(1) saturate(0)' : 'none',
                opacity: restricted ? 0.65 : 0.9,
              }}
            >
              🔍
            </span>
            <input
              style={{
                ...webStyles.input,
                ...(restricted ? webStyles.inputRestricted : {}),
                ...(isOwner && inputFocused ? webStyles.inputActive : {}),
              }}
              type="text"
              placeholder="john@example.com or johndoe"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={!selectedTeam || !isOwner}
              aria-disabled={restricted}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            {searching && (
              <div style={webStyles.searchingIndicator}>
                <div style={webStyles.spinner} />
              </div>
            )}
            {restricted && showRestrictionHint && (
              <div style={webStyles.restrictionTooltip}>
                Administrator privileges required to invite members.
              </div>
            )}
          </div>
          <p style={webStyles.hint}>
            {isOwner
              ? 'Uses @ symbol to detect email vs username automatically.'
              : 'Only team owners can invite members.'}
          </p>
        </div>

        {/* Search Result */}
        {searchResult && !successMessage && (
          <div style={webStyles.resultCard}>
            <div style={webStyles.resultAvatar}>
              {searchResult.avatar ? (
                <img src={searchResult.avatar} alt="" style={webStyles.avatarImg} />
              ) : (
                <span style={webStyles.avatarPlaceholder}>
                  {searchResult.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={webStyles.resultInfo}>
              <div style={webStyles.resultName}>{searchResult.username}</div>
              <div style={webStyles.resultEmail}>{searchResult.email}</div>
            </div>
            <button
              style={{
                ...webStyles.addButton,
                opacity: adding || !isOwner ? 0.6 : 1,
              }}
              onClick={onAddUser}
              disabled={adding || !isOwner}
            >
              {adding ? 'Adding...' : isOwner ? 'Add' : 'Owners only'}
            </button>
          </div>
        )}

        {/* Error State */}
        {error && !successMessage && (
          <div style={webStyles.error}>
            <span style={webStyles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div style={webStyles.success}>
            <span style={webStyles.successIcon}>✓</span>
            {successMessage}
          </div>
        )}
      </>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <>
      {/* Team Selector */}
      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Select Team</Text>
        <TeamDropdown
          teams={teams}
          selectedTeam={selectedTeam}
          loading={loadingTeams}
          isOpen={teamDropdownOpen}
          onToggle={onDropdownToggle}
          onSelect={onTeamSelect}
        />
      </View>

      {/* Search Input */}
      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Search by email or username</Text>
        <Animated.View
          style={[
            mobileStyles.inputWrapper,
            restricted && mobileStyles.inputWrapperRestricted,
            { transform: [{ translateX: shakeAnim }] },
          ]}
          onTouchStart={restricted ? handleRestrictedAttempt : undefined}
        >
          <TextInput
            style={[
              mobileStyles.input,
              !selectedTeam && mobileStyles.inputDisabled,
              isOwner && inputFocused && mobileStyles.inputActive,
              restricted && mobileStyles.inputRestricted,
            ]}
            placeholder="john@example.com or johndoe"
            placeholderTextColor={restricted ? '#555' : '#888'}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!!selectedTeam && isOwner}
            aria-disabled={restricted}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          {searching && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={mobileStyles.searchingIndicator}
            />
          )}
          {restricted && showRestrictionHint && (
            <View style={mobileStyles.restrictionToast}>
              <Text style={mobileStyles.restrictionToastText}>
                Administrator privileges required to invite members.
              </Text>
            </View>
          )}
        </Animated.View>
        <Text style={mobileStyles.hint}>
          {isOwner ? 'Uses @ to detect email vs username' : 'Only owners can send invites'}
        </Text>
      </View>

      {/* Search Result */}
      {searchResult && !successMessage && (
        <View style={mobileStyles.resultCard}>
          <View style={mobileStyles.resultAvatar}>
            <Text style={mobileStyles.avatarText}>
              {searchResult.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={mobileStyles.resultInfo}>
            <Text style={mobileStyles.resultName}>{searchResult.username}</Text>
            <Text style={mobileStyles.resultEmail}>{searchResult.email}</Text>
          </View>
          <TouchableOpacity
            style={[mobileStyles.addButton, (adding || !isOwner) && mobileStyles.addButtonDisabled]}
            onPress={onAddUser}
            disabled={adding || !isOwner}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={mobileStyles.addButtonText}>{isOwner ? 'Add' : 'Owners only'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error State */}
      {error && !successMessage && (
        <View style={mobileStyles.error}>
          <Text style={mobileStyles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {/* Success State */}
      {successMessage && (
        <View style={mobileStyles.success}>
          <Text style={mobileStyles.successText}>✓ {successMessage}</Text>
        </View>
      )}
    </>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#888',
    fontWeight: 600,
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputWrapperRestricted: {
    filter: 'grayscale(0.75) saturate(0)',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(4px)',
  },
  inputWrapperActive: {
    boxShadow: '0 10px 30px rgba(109, 211, 255, 0.18)',
    borderRadius: '12px',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 38px',
    paddingRight: '44px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  inputRestricted: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    color: '#d0d4db',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  inputActive: {
    background: '#0f1116',
    borderColor: '#6dd3ff',
    boxShadow: '0 0 0 1px rgba(109,211,255,0.5), 0 14px 34px rgba(0, 173, 255, 0.18)',
  },
  searchingIndicator: {
    position: 'absolute',
    right: '14px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  restrictionTooltip: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 6px)',
    padding: '8px 12px',
    background: 'rgba(15,15,15,0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#f0f0f0',
    fontSize: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
    maxWidth: '220px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '14px',
    color: '#aaa',
    pointerEvents: 'none',
  },
  hatchedOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    backgroundImage:
      'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 12px, transparent 12px, transparent 20px)',
    pointerEvents: 'none',
    mixBlendMode: 'soft-light',
  },
  hint: {
    fontSize: '12px',
    color: '#555',
    marginTop: '8px',
    margin: 0,
  },
  resultCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  resultAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667 0%, #444 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '2px',
  },
  resultEmail: {
    fontSize: '13px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  addButton: {
    padding: '10px 20px',
    background: '#fff',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.2)',
    borderRadius: '8px',
    color: '#e74c3c',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  errorIcon: {
    fontSize: '14px',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(46, 204, 113, 0.1)',
    border: '1px solid rgba(46, 204, 113, 0.2)',
    borderRadius: '8px',
    color: '#2ecc71',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  successIcon: {
    fontSize: '14px',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperRestricted: {
    opacity: 0.75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    paddingRight: 44,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputRestricted: {
    color: '#d0d4db',
  },
  inputActive: {
    borderColor: '#6dd3ff',
    shadowColor: '#6dd3ff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchingIndicator: {
    position: 'absolute',
    right: 14,
  },
  hint: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    marginBottom: 16,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  resultEmail: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
  },
  success: {
    padding: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '500',
  },
  restrictionToast: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(15,15,15,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  restrictionToastText: {
    color: '#f0f0f0',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AddMemberTab;
