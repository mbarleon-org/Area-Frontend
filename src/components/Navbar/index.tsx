import React, { useState} from "react";
import {  View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

let safeUseNavigation: any = () => ({ navigate: (_: any) => {} });
try {
  const rnNav = require('@react-navigation/native');
  if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {
}

const detectIsWeb = (): boolean => {
  try {
    return Platform && Platform.OS === 'web';
  } catch (e) {
    return typeof document !== 'undefined';
  }
};

const isWeb = detectIsWeb();

const Navbar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => {} };
  const NavLinkWrapper: React.FC<any> = ({ children, ...props }) => {
    if (isWeb) {
      const href = props.to || props.href || '#';
      const rawStyle = props.style;
      const onClick = props.onClick;
      const resolvedStyle = typeof rawStyle === 'function' ? rawStyle({ isActive: false }) : (rawStyle || {});
      return (
        <a href={href} onClick={onClick} style={resolvedStyle}>
          {children}
        </a>
      );
    }
    try {
      const onPress = props.onClick || (() => {});
      return (
        <TouchableOpacity onPress={onPress} style={props.style || { padding: 10 }}>
          <Text style={{ color: '#fff', fontSize: 7, fontWeight: '700' }}>{children}</Text>
        </TouchableOpacity>
      );
    } catch {
      return <>{children}</>;
    }
  };

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    try {
      const goTo = (to: string) => {
        if (!to) return;
        const nameRaw = to.startsWith('/') ? to.slice(1) : to;
        const screen = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
        try { navigationMobile.navigate(screen as any); } catch {}
      };

      return (
        <View style={mobileStyles.navbar}>
          <Text style={mobileStyles.logo}>GT</Text>
          <View style={mobileStyles.itemsContainer}>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {(() => {
                try {
                  return (
                    <View style={{ alignItems: 'center' }}>
                      <Feather name="grid" size={24} color="#fff" />
                    </View>
                  );
                } catch {
                  return null;
                }
              })()}
              <TouchableOpacity onPress={() => goTo('/dashboard')} style={{ padding: 6 }}>
                <Text style={mobileStyles.item}>Dashboard</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => goTo('/apps')} style={{ padding: 6 }}>
              <Text style={mobileStyles.item}>Apps</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => goTo('/explore')} style={{ padding: 6 }}>
              <Text style={mobileStyles.item}>Explore</Text>
            </TouchableOpacity>
          </View>

          <View style={mobileStyles.loginContainer}>
            <TouchableOpacity
              style={mobileStyles.iconCircle}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
               <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff', marginBottom: 2 }} />
               <View style={{ width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 2, borderColor: '#fff' }} />
            </TouchableOpacity>
            {isMenuOpen && (
              <View style={mobileStyles.dropdownMenu}>
                <TouchableOpacity onPress={() => { goTo('/login'); setIsMenuOpen(false); }}>
                  <Text style={mobileStyles.dropdownItem}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { goTo('/register'); setIsMenuOpen(false); }}>
                  <Text style={mobileStyles.dropdownItem}>Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    } catch {
      return (
        <View style={mobileStyles.navbar}>
          <Text style={mobileStyles.logo}>GT</Text>
        </View>
      );
    }
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <div style={webStyles.navbar}>
      <div style={webStyles.logo}>GT</div>

      <nav style={webStyles.itemsContainer} aria-label="Main navigation">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 -0.5 25 25" fill="none" style={{width:"44px",height:"44px"}} xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M9.918 10.0005H7.082C6.66587 9.99708 6.26541 10.1591 5.96873 10.4509C5.67204 10.7427 5.50343 11.1404 5.5 11.5565V17.4455C5.5077 18.3117 6.21584 19.0078 7.082 19.0005H9.918C10.3341 19.004 10.7346 18.842 11.0313 18.5502C11.328 18.2584 11.4966 17.8607 11.5 17.4445V11.5565C11.4966 11.1404 11.328 10.7427 11.0313 10.4509C10.7346 10.1591 10.3341 9.99708 9.918 10.0005Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M9.918 4.0006H7.082C6.23326 3.97706 5.52559 4.64492 5.5 5.4936V6.5076C5.52559 7.35629 6.23326 8.02415 7.082 8.0006H9.918C10.7667 8.02415 11.4744 7.35629 11.5 6.5076V5.4936C11.4744 4.64492 10.7667 3.97706 9.918 4.0006Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M15.082 13.0007H17.917C18.3333 13.0044 18.734 12.8425 19.0309 12.5507C19.3278 12.2588 19.4966 11.861 19.5 11.4447V5.55666C19.4966 5.14054 19.328 4.74282 19.0313 4.45101C18.7346 4.1592 18.3341 3.9972 17.918 4.00066H15.082C14.6659 3.9972 14.2654 4.1592 13.9687 4.45101C13.672 4.74282 13.5034 5.14054 13.5 5.55666V11.4447C13.5034 11.8608 13.672 12.2585 13.9687 12.5503C14.2654 12.8421 14.6659 13.0041 15.082 13.0007Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M15.082 19.0006H17.917C18.7661 19.0247 19.4744 18.3567 19.5 17.5076V16.4936C19.4744 15.6449 18.7667 14.9771 17.918 15.0006H15.082C14.2333 14.9771 13.5256 15.6449 13.5 16.4936V17.5066C13.525 18.3557 14.2329 19.0241 15.082 19.0006Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
          <NavLinkWrapper to="/dashboard" style={({ isActive }: any) => ({ ...webStyles.item, opacity: isActive ? 1 : 0.85 })}>
            Dashboard
          </NavLinkWrapper>
        </div>
        <NavLinkWrapper to="/apps" style={({ isActive }: any) => ({ ...webStyles.item, opacity: isActive ? 1 : 0.85 })}>
          Apps
        </NavLinkWrapper>
        <NavLinkWrapper to="/explore" style={({ isActive }: any) => ({ ...webStyles.item, opacity: isActive ? 1 : 0.85 })}>
          Explore
        </NavLinkWrapper>
      </nav>
      <nav style={webStyles.loginContainer} aria-label="Login container">
        <div style={webStyles.loginWrapper}>
          <div
            style={{
              ...webStyles.iconCircle,
              background: isHovered ? "#666666ff" : "#0000003d",
              transition: "background 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{width:"30px",height:"30px"}} xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
          </div>
          {isMenuOpen && (
            <div style={webStyles.dropdownMenu}>
              <NavLinkWrapper
                to="/login"
                style={({ isActive }: any) => ({ ...webStyles.dropdownItem, opacity: isActive ? 1 : 0.85 })}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLinkWrapper>
              <NavLinkWrapper
                to="/register"
                style={({ isActive }: any) => ({ ...webStyles.dropdownItem, opacity: isActive ? 1 : 0.85 })}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </NavLinkWrapper>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

const webStyles: any = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100px",
    height: "100vh",
    backgroundColor: "#141414",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "20px",
    paddingBottom: "20px",
    zIndex: 10000,
    boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
  },
  logo: {
    color: "#fff",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: "32px",
    letterSpacing: "0.06em",
    textAlign: "center",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "40px",
    marginTop: "40px",
    flex: 1,
  },
  item: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "12px",
    fontFamily: "'Montserrat', sans-serif",
    writingMode: "horizontal-tb",
  },
  loginContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "50px",
    position: "relative",
  },
  loginWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMenu: {
    position: "absolute",
    left: "100px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: "8px 0",
    minWidth: "120px",
    display: "flex",
    flexDirection: "column",
    zIndex: 10001,
  },
  dropdownItem: {
    color: "#fff",
    textDecoration: "none",
    padding: "12px 20px",
    fontSize: "14px",
    fontFamily: "'Montserrat', sans-serif",
    transition: "background 0.2s ease",
  },
};

const mobileStyles: any = {
  navbar: {
    backgroundColor: "#141414",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 86,
    zIndex: 1000,
  },
  itemsContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  dropdownMenu: {
    position: "absolute",
    left: 80,
    bottom: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    display: "flex",
    flexDirection: "column",
    zIndex: 10001,
  },
  dropdownItem: {
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 14,
  },
  loginContainer: {
    marginTop: 'auto',
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    zIndex: 2000,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  logo: {
    color: "#fff",
    fontWeight: '700',
    fontSize: 32,
    textAlign: "center",
    fontFamily: "'Montserrat', sans-serif",
  },
  item: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "12px",
    fontFamily: "'Montserrat', sans-serif",
    writingMode: "horizontal-tb",
  },
};

export default Navbar;
