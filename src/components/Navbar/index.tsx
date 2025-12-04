import React, { useState } from "react";
// react-native components are required dynamically in the mobile branch
import { Feather } from '@expo/vector-icons';
import { isWeb } from "../../utils/IsWeb";

let safeUseNavigation: any = () => ({
  navigate: (_: any) => { },
  reset: (_: any) => { }
});

try {
  const rnNav = require('@react-navigation/native');
  if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {
}

const Navbar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationMobile = (!isWeb && typeof safeUseNavigation === 'function')
    ? safeUseNavigation()
    : { navigate: (_: any) => { } };

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
    return <>{children}</>;
  };

  // ------------------------ Mobile view (Burger Menu) ------------------------
  if (!isWeb) {
    const RN = require('react-native');
    const { View, Text, TouchableOpacity, ScrollView } = RN;
    const goTo = (to: string) => {
      if (!to) return;
      setIsMenuOpen(false);
      const nameRaw = to.startsWith('/') ? to.slice(1) : to;
      const screen = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
      try {
        if (navigationMobile.reset) {
          navigationMobile.reset({
            index: 0,
            routes: [{ name: screen }],
          });
        } else {
          navigationMobile.navigate(screen as any);
        }
      } catch (e) {
        console.warn("Navigation error:", e);
      }
    };

    return (
      <View style={mobileStyles.headerContainer}>
        <View style={mobileStyles.topBar}>
          <Text style={mobileStyles.logo}>GT</Text>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            style={mobileStyles.burgerButton}
          >
            <Feather name={isMenuOpen ? "x" : "menu"} size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {isMenuOpen && (
          <View style={mobileStyles.menuOverlay}>
            <ScrollView contentContainerStyle={mobileStyles.menuContent}>
              <View style={mobileStyles.section}>
                <TouchableOpacity onPress={() => goTo('/dashboard')} style={mobileStyles.menuItem}>
                  <Feather name="grid" size={20} color="#fff" style={mobileStyles.icon} />
                  <Text style={mobileStyles.menuText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo('/apps')} style={mobileStyles.menuItem}>
                  <Feather name="box" size={20} color="#fff" style={mobileStyles.icon} />
                  <Text style={mobileStyles.menuText}>Apps</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo('/explore')} style={mobileStyles.menuItem}>
                  <Feather name="compass" size={20} color="#fff" style={mobileStyles.icon} />
                  <Text style={mobileStyles.menuText}>Explore</Text>
                </TouchableOpacity>
              </View>

              <View style={mobileStyles.divider} />

              <View style={mobileStyles.section}>
                <TouchableOpacity onPress={() => goTo('/login')} style={mobileStyles.menuItem}>
                  <Feather name="log-in" size={20} color="#ccc" style={mobileStyles.icon} />
                  <Text style={[mobileStyles.menuText, { color: '#ccc' }]}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo('/register')} style={mobileStyles.menuItem}>
                  <Feather name="user-plus" size={20} color="#ccc" style={mobileStyles.icon} />
                  <Text style={[mobileStyles.menuText, { color: '#ccc' }]}>Register</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // ------------------------ Web / desktop view ------------------------
  return (
    <div style={webStyles.navbar}>
      <div style={webStyles.logo}>GT</div>

      <nav style={webStyles.itemsContainer} aria-label="Main navigation">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 -0.5 25 25" fill="none" style={{ width: "44px", height: "44px" }} xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <path fillRule="evenodd" clipRule="evenodd" d="M9.918 10.0005H7.082C6.66587 9.99708 6.26541 10.1591 5.96873 10.4509C5.67204 10.7427 5.50343 11.1404 5.5 11.5565V17.4455C5.5077 18.3117 6.21584 19.0078 7.082 19.0005H9.918C10.3341 19.004 10.7346 18.842 11.0313 18.5502C11.328 18.2584 11.4966 17.8607 11.5 17.4445V11.5565C11.4966 11.1404 11.328 10.7427 11.0313 10.4509C10.7346 10.1591 10.3341 9.99708 9.918 10.0005Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M9.918 4.0006H7.082C6.23326 3.97706 5.52559 4.64492 5.5 5.4936V6.5076C5.52559 7.35629 6.23326 8.02415 7.082 8.0006H9.918C10.7667 8.02415 11.4744 7.35629 11.5 6.5076V5.4936C11.4744 4.64492 10.7667 3.97706 9.918 4.0006Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M15.082 13.0007H17.917C18.3333 13.0044 18.734 12.8425 19.0309 12.5507C19.3278 12.2588 19.4966 11.861 19.5 11.4447V5.55666C19.4966 5.14054 19.328 4.74282 19.0313 4.45101C18.7346 4.1592 18.3341 3.9972 17.918 4.00066H15.082C14.6659 3.9972 14.2654 4.1592 13.9687 4.45101C13.672 4.74282 13.5034 5.14054 13.5 5.55666V11.4447C13.5034 11.8608 13.672 12.2585 13.9687 12.5503C14.2654 12.8421 14.6659 13.0041 15.082 13.0007Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path fillRule="evenodd" clipRule="evenodd" d="M15.082 19.0006H17.917C18.7661 19.0247 19.4744 18.3567 19.5 17.5076V16.4936C19.4744 15.6449 18.7667 14.9771 17.918 15.0006H15.082C14.2333 14.9771 13.5256 15.6449 13.5 16.4936V17.5066C13.525 18.3557 14.2329 19.0241 15.082 19.0006Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
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
            <svg viewBox="0 0 24 24" fill="none" style={{ width: "30px", height: "30px" }} xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#141414",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    elevation: 5,
  },
  logo: {
    color: "#fff",
    fontWeight: '700',
    fontSize: 24,
    fontFamily: "System",
  },
  burgerButton: {
    padding: 5,
  },
  menuOverlay: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: '#1f1f1f',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    elevation: 10,
  },
  menuContent: {
    gap: 10,
  },
  section: {
    gap: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: {
    marginRight: 15,
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
};

export default Navbar;
