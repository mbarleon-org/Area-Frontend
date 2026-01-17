import React, { useState, useRef, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { isWeb } from "../../utils/IsWeb";
import ApiConfigInput from '../../components/ApiConfigInput';
import Svg, { Defs, Pattern, Rect, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const CARDS_DATA = [
  {
    id: '01',
    title: 'Architecture',
    body: 'Connect credentials, browse workflows in the Dashboard, and edit them directly in the canvas editor. Validation and export to JSON are built-in.'
  },
  {
    id: '02',
    title: 'Ecosystem',
    body: 'Manage public and personal workflows with a single tap. Access the Automation builder and Admin tools for complete user & team management.'
  },
  {
    id: '03',
    title: 'Canvas Engine',
    body: 'Experience a fluid drag-and-drop interface with snap-to-grid, pan, & zoom. Securely connect inputs/outputs with visual validation and dynamic credential loading.'
  }
];

const Home: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const webGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWeb || !webGridRef.current) return;

    const onScroll = () => {
      if (webGridRef.current) {
        const posY = -(window.scrollY * 0.5);
        webGridRef.current.style.backgroundPosition = `0px ${posY}px`;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ------------------------ Mobile view ------------------------
  if (!isWeb) {
    // Create an infinite looping grid animation
    const infiniteGridStyle = {
      transform: [{
        translateY: Animated.modulo(scrollY, 80).interpolate({
            inputRange: [0, 80],
            outputRange: [0, -40]
        })
      }]
    };

    return (
      <View style={mobileStyles.mainContainer}>
        {/* Background Layer with Parallax Grid and Gradient */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[StyleSheet.absoluteFill, infiniteGridStyle]}>
            <Svg height="120%" width="100%">
              <Defs>
                <Pattern
                  id="grid"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <Path
                    d="M 40 0 L 0 0 L 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeOpacity="0.15"
                  />
                </Pattern>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
            </Svg>
          </Animated.View>

          <LinearGradient
            colors={['transparent', '#050505']}
            locations={[0.2, 1.0]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Navbar />

        <Animated.ScrollView
          contentContainerStyle={mobileStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={mobileStyles.heroSection}>
            <View style={mobileStyles.pillContainer}>
              <Text style={mobileStyles.pillText}>BETA v1.0</Text>
            </View>
            <Text style={mobileStyles.heroTitle}>gOOnTech <Text style={{color: '#666'}}>.</Text></Text>
            <Text style={mobileStyles.heroSubtitle}>
              The minimal automation platform designed for builders.
              Design, run, and monitor your services, map data, and deploy workflows with confidence.
            </Text>
          </View>

          <View style={mobileStyles.configWrapper}>
            <View style={mobileStyles.configHeader}>
              <Text style={mobileStyles.configTitle}>Mobile Configuration</Text>
              <Text style={mobileStyles.configDesc}>
                Enter your server address below to connect the app. Save it to access your services securely.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowConfig(!showConfig)}
              style={[
                mobileStyles.configButton,
                showConfig && mobileStyles.configButtonActive
              ]}
            >
              <Text style={mobileStyles.configButtonText}>
                {showConfig ? 'Close Configuration' : 'Configure Server'}
              </Text>
            </TouchableOpacity>

            {showConfig && (
              <View style={mobileStyles.configInputContainer}>
                <ApiConfigInput showReset={true} />
              </View>
            )}
          </View>

          <View style={mobileStyles.grid}>
            {CARDS_DATA.map((card) => (
              <View key={card.id} style={mobileStyles.card}>
                <View style={mobileStyles.cardHeaderMobile}>
                  <Text style={mobileStyles.cardIconMobile}>{card.id}</Text>
                  <Text style={mobileStyles.cardTitle}>{card.title}</Text>
                </View>
                <Text style={mobileStyles.cardBody}>
                  {card.body}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </View>
    );
  }

  // ------------------------ Web view ---------------------------
  return (
    <>
      <Navbar />

      <style>
        {`
          ::selection {
            background-color: #ffffff;
            color: #000000;
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .delay-1 { animation-delay: 0.1s; }
          .delay-2 { animation-delay: 0.2s; }
          .delay-3 { animation-delay: 0.3s; }

          .hover-card {
            transition: all 0.3s ease;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            border-color: rgba(255,255,255,0.2) !important;
            background: rgba(255,255,255,0.03) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
        `}
      </style>

      <div style={webStyles.pageShell}>
        <div ref={webGridRef} style={webStyles.gridBackground} />

        <div style={webStyles.container}>
          <div style={webStyles.heroSection} className="animate-fade-up">
            <div style={webStyles.pill}>Beta v1.0</div>
            <h1 style={webStyles.heroTitle}>
              gOOnTech <span style={{color: '#666'}}>.</span>
            </h1>
            <p style={webStyles.heroSubtitle}>
              The minimal automation platform designed for builders.<br />
              Design, run, and monitor your services, map data, and deploy workflows with confidence.
            </p>
          </div>

          <div style={webStyles.grid} className="animate-fade-up delay-2">
            {CARDS_DATA.map((card, index) => (
              <div
                key={card.id}
                style={index === 2 ? webStyles.cardWide : webStyles.card}
                className="hover-card"
              >
                <div style={webStyles.cardHeader}>
                  <span style={webStyles.cardIcon}>{card.id}</span>
                  <h3 style={webStyles.cardTitle}>{card.title}</h3>
                </div>
                <p style={webStyles.cardBody}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const mobileStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContainer: {
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  heroSection: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  pillContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSubtitle: {
    color: '#888',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '95%',
  },
  configWrapper: {
    marginBottom: 40,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    padding: 20,
    overflow: 'hidden',
  },
  configHeader: {
    marginBottom: 16,
  },
  configTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  configDesc: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  configButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  configButtonActive: {
    backgroundColor: '#bbbbbb',
  },
  configButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  configInputContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
  },
  cardHeaderMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconMobile: {
    color: '#444',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: '#999',
    fontSize: 14,
    lineHeight: 22,
  },
});

const webStyles: any = {
  pageShell: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#050505',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  gridBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    zIndex: 1,
    width: '100%',
    maxWidth: '1024px',
    padding: '120px 24px 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '80px',
    maxWidth: '700px',
    opacity: 0,
  },
  pill: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: 'clamp(40px, 8vw, 80px)',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 24px',
    letterSpacing: '-0.04em',
    background: 'linear-gradient(to bottom, #fff, #999)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    lineHeight: 1.6,
    color: '#888',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
    opacity: 0,
  },
  card: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'default',
  },
  cardWide: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    gridColumn: '1 / -1',
    cursor: 'default',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px',
  },
  cardIcon: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#444',
    border: '1px solid #333',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  cardBody: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#888',
    margin: 0,
  },
};

export default Home;
