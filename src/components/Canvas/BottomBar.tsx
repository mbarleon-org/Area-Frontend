import React from 'react';

const BottomBar: React.FC = () => {
  return (
    <div style={styles.container} aria-hidden={false}>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed' as 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    background: '#141414',
    zIndex: 1600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto' as 'auto',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.2)',
    outline: '1px solid #222',
  },
};

export default BottomBar;
