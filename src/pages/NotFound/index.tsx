import React from "react";
import Navbar from "../../components/Navbar";
import { isWeb } from "../../utils/IsWeb";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useInRouterContext, useNavigate } from "../../utils/router";

if (isWeb) import("../../index.css");

let safeUseNavigation: any = () => ({
	navigate: (_: any) => {},
	reset: (_: any) => {},
});

try {
	const rnNav = require("@react-navigation/native");
	if (rnNav && rnNav.useNavigation) safeUseNavigation = rnNav.useNavigation;
} catch (e) {}

const NotFound: React.FC = () => {
	const [hover, setHover] = React.useState(false);
	const [pressedMobile, setPressedMobile] = React.useState(false);
	const inRouter = useInRouterContext();
	const navigateWeb = inRouter
		? useNavigate()
		: (to: string) => {
				if (typeof window !== "undefined") window.location.href = to;
			};

	const navigationMobile = !isWeb && typeof safeUseNavigation === "function"
		? safeUseNavigation()
		: { navigate: (_: any) => {} };

	const goHome = () => {
		if (!isWeb) {
			navigationMobile.navigate("Home");
			return;
		}
		navigateWeb("/");
	};

	if (!isWeb) {
		return (
			<View style={mobileStyles.container}>
				<Navbar />
				<View style={mobileStyles.hero}>
					<Text style={mobileStyles.code}>404</Text>
					<Text style={mobileStyles.title}>Page not found</Text>
					<Text style={mobileStyles.subtitle}>
						The page you are looking for does not exist. Let's head back home.
					</Text>
					<TouchableOpacity
						style={[mobileStyles.button, pressedMobile ? mobileStyles.buttonPressed : null]}
						onPress={goHome}
						onPressIn={() => setPressedMobile(true)}
						onPressOut={() => setPressedMobile(false)}
					>
						<Text style={mobileStyles.buttonText}>Back to Home</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<>
			<Navbar />
			<div style={webStyles.container}>
				<div style={webStyles.card}>
					<div style={webStyles.badge}>404</div>
					<h1 style={webStyles.title}>Page not found</h1>
					<p style={webStyles.subtitle}>
						The page you're looking for doesn't exist. Let's get you back on track.
					</p>
					<button
						style={{
							...webStyles.button,
							...(hover ? webStyles.buttonHover : {}),
						}}
						onMouseEnter={() => setHover(true)}
						onMouseLeave={() => setHover(false)}
						onClick={goHome}
					>
						Back to Home
					</button>
				</div>
			</div>
		</>
	);
};

const mobileStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#151316ff",
		justifyContent: 'center',
		alignItems: 'stretch',
		paddingVertical: 24,
	},
	hero: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	code: {
		color: "#4CAF50",
		fontSize: 64,
		fontWeight: "800",
		letterSpacing: 4,
		marginBottom: 12,
	},
	title: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "700",
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		color: "#bdbdbd",
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 24,
	},
	button: {
		backgroundColor: "#196d1cff",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
	},
	buttonPressed: {
		backgroundColor: '#2ecc71',
		shadowOpacity: 0.28,
		shadowRadius: 12,
		transform: [{ scale: 0.995 }],
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
});

const webStyles: any = {
	container: {
		boxSizing: 'border-box',
		minHeight: "100vh",
		width: '100%',
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#151316ff",
		color: "#fff",
		overflow: "hidden",
		padding: "40px 24px",
		paddingLeft: "120px",
	},
	page: {
		position: "relative",
		minHeight: "100vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
		color: "#fff",
		overflow: "hidden",
		padding: "40px 16px",
	},
	card: {
		position: "relative",
		zIndex: 2,
		maxWidth: 560,
		width: "100%",
		background: "rgba(26,26,28,0.8)",
		border: "1px solid #2a2a2e",
		borderRadius: 16,
		padding: "40px 32px",
		boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
		backdropFilter: "blur(6px)",
		textAlign: "center",
	},
	badge: {
		display: "inline-flex",
		padding: "10px 16px",
		borderRadius: 999,
		background: "rgba(76,175,80,0.12)",
		color: "#4CAF50",
		fontWeight: 700,
		letterSpacing: 1,
		marginBottom: 12,
	},
	title: {
		margin: "0 0 12px 0",
		fontSize: "32px",
		fontWeight: 800,
		letterSpacing: 0.5,
	},
	subtitle: {
		margin: "0 0 24px 0",
		color: "#bdbdbd",
		fontSize: "18px",
		lineHeight: 1.6,
	},
	button: {
		width: "100%",
		padding: "14px 20px",
		borderRadius: 10,
		color: "#fff",
		fontWeight: 700,
		letterSpacing: 0.5,
		cursor: "pointer",
		boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
		transition: "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
		background: "linear-gradient(90deg, #196d1cff 0%, #4CAF50 100%)",
		border: '1px solid rgba(46, 204, 113, 0.18)',

	},
	buttonHover: {
		background: "linear-gradient(90deg, #4CAF50 0%, #196d1cff 100%)",
		color: '#fff',
		boxShadow: '0 12px 34px rgba(0,0,0,0.38)',
		transform: 'translateY(-1px)',
	},
};

export default NotFound;
