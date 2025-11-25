import React from 'react'

const Navbar: React.FC = () => {
    const styles: { [k: string]: React.CSSProperties } = {
        navbar: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100px',
            height: '100vh',
            backgroundColor: '#141414',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '20px',
            paddingBottom: '20px',
            zIndex: 10000,
            boxShadow: '2px 0 8px rgba(0,0,0,0.5)'
        },
        logo: {
            color: '#fff',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '0.06em',
            textAlign: 'center'
        },
        itemsContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '40px',
            marginTop: '40px',
            flex: 1
        },
        item: {
            color: '#fff',
            textDecoration: 'none',
            fontSize: '12px',
            fontFamily: "'Montserrat', sans-serif",
            writingMode: 'horizontal-tb'
        },
        loginContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '50px'
        },
        loginLink: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#fff',
            textDecoration: 'none'
        }
    }

    return (
        <div style={styles.navbar}>
            <div style={styles.logo}>GT</div>

            <nav style={styles.itemsContainer} aria-label="Main navigation">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <a href="/dashboard" style={styles.item}>Dashboard</a>
                </div>
                <a href="/apps" style={styles.item}>Apps</a>
                <a href="/explore" style={styles.item}>Explore</a>
            </nav>

            <nav style={styles.loginContainer} aria-label="Login container">
                <a href="/login" style={styles.loginLink}>
                    <span style={styles.item}>Login</span>
                </a>
            </nav>
        </div>
    )
}

export default Navbar
