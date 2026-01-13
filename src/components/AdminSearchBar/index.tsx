import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { isWeb } from '../../utils/IsWeb';

type FilterType = 'users' | 'teams' | 'workflows' | 'credentials';

interface AdminSearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  filterType?: FilterType;
}

const getPlaceholderForFilter = (filterType?: FilterType): string => {
  switch (filterType) {
    case 'users':
      return 'Search by ID, email or username...';
    case 'teams':
      return 'Search by ID or name...';
    case 'workflows':
      return 'Search by ID or name...';
    case 'credentials':
      return 'Search by ID, name or type...';
    default:
      return 'Search by ID or name...';
  }
};

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
  filterType,
}) => {
  const resolvedPlaceholder = placeholder || getPlaceholderForFilter(filterType);
  const [focused, setFocused] = useState(false);

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.container}>
        <TextInput
          style={[mobileStyles.input, focused && mobileStyles.inputFocused]}
          placeholder={resolvedPlaceholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <div style={webStyles.container}>
      <input
        type="text"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...webStyles.input,
          ...(focused ? webStyles.inputFocused : {}),
        }}
      />
    </div>
  );
};

const mobileStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  inputFocused: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  container: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocused: {
    border: '1px solid rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
};

export default AdminSearchBar;
