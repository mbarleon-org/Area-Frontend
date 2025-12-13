  import React from 'react';

  const BinButton: React.FC = () => {
    return (
      <button style={styles.button} aria-label="Move to trash">
        <span style={styles.icon}>🗑️</span>
      </button>
    );
  };

  const styles = {
    button: {
      position: 'fixed' as 'fixed',
      bottom: 50,
      left: 130,
      backgroundColor: '#141414',
      border: 'none',
      cursor: 'pointer',
      width: 64,
      height: 64,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s, transform 0.12s',
      outline: '2px solid #212121ff',
    },
    icon: {
      fontSize: 28,
      lineHeight: 10,
      opacity: 0.3,
    },
  };

  export default BinButton;
