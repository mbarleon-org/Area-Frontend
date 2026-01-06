import React, { useState, useRef, useEffect } from 'react';

const TopBar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isDropdownButtonHovered, setIsDropdownButtonHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen)
      return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div style={styles.container} aria-hidden={false}>
      <div style={styles.items}>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            style={{ ...styles.buttons, background: isButtonHovered ? '#333' : 'transparent' }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            Fichier
          </button>
          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <button
                style={{ ...styles.dropdownButton, background: isDropdownButtonHovered ? '#333' : 'transparent' }}
                onClick={() => { setIsDropdownOpen(false); }}
                onMouseEnter={() => setIsDropdownButtonHovered(true)}
                onMouseLeave={() => setIsDropdownButtonHovered(false)}
              >
                Save automation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed' as 'fixed',
    left: 100,
    right: 0,
    top: 0,
    height: 25,
    background: '#141414',
    zIndex: 1600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    pointerEvents: 'auto' as 'auto',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.2)',
    outline: '1px solid #222',
  },
  items: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  buttons: {
    padding: '4px 8px',
    fontSize: 12,
    background: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
  },
  dropdown: {
    position: 'absolute' as 'absolute',
    top: '100%',
    left: 0,
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: 8,
    zIndex: 1700,
    minWidth: '300px',
  },
  dropdownButton: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 12,
    background: 'transparent',
    color: '#ffffffff',
    border: 'none',
    textAlign: 'left' as 'left',
    cursor: 'pointer',
    opacity: 1,
  },
};

export default TopBar;
