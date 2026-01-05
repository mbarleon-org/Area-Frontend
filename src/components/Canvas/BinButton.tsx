  import React, { forwardRef } from 'react';

  const BinButton = forwardRef<HTMLButtonElement>((_, ref) => {
    return (
      <button ref={ref} style={styles.button} aria-label="Move to trash" className="bin-button">
        <span style={styles.icon} className="bin-button-icon">🗑️</span>
      </button>
    );
  });

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


  if (typeof document !== 'undefined') {
    const styleId = 'bin-button-hover-styles';
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = `
      .bin-button:hover .bin-button-icon {
        opacity: 1 !important;
      }
      `;
      document.head.appendChild(styleTag);
    }
  }
