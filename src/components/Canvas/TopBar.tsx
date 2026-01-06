import React, { useState, useRef, useEffect } from 'react';

const TopBar: React.FC = () => {
  const menus = [
    { key: 'file', label: 'File', items: [{ label: 'Save automation', action: () => console.log('Save automation') }] },
    { key: 'view', label: 'View', items: [{ label: 'View options', action: () => console.log('View options') }] },
  ];

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  const refs = {
    file: useRef<HTMLDivElement>(null),
    view: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const ref = refs[openMenu as keyof typeof refs];
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  return (
    <div style={styles.container} aria-hidden={false}>
      <div style={styles.items}>
        {menus.map(menu => (
          <div key={menu.key} ref={refs[menu.key as keyof typeof refs]} style={{ position: 'relative' }}>
            <button
              style={{ ...styles.buttons, background: hoverMenu === menu.key ? '#333' : 'transparent' }}
              onClick={() => setOpenMenu(openMenu === menu.key ? null : menu.key)}
              onMouseEnter={() => setHoverMenu(menu.key)}
              onMouseLeave={() => setHoverMenu(null)}
            >
              {menu.label}
            </button>
            {openMenu === menu.key && (
              <div style={styles.dropdown}>
                {menu.items.map(item => (
                  <button
                    key={item.label}
                    style={styles.dropdownButton}
                    onClick={() => { item.action(); setOpenMenu(null); }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
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
  },
  buttons: {
    padding: '4px 16px',
    fontSize: 14,
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
