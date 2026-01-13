import React from "react";
import { isWeb } from "../../utils/IsWeb";
import { useApi } from "../../utils/UseApi";
import NotFound from "../../pages/NotFound";
import { View } from "react-native";
import Navbar from "../Navbar";

interface GuardProps {
  children: React.ReactNode;
}

const Guard: React.FC<GuardProps> = ({ children }) => {
  const { get } = useApi();
  const [state, setState] = React.useState<'loading' | 'allow' | 'deny'>('loading');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await get('/users/me');
        if (!mounted) return;
        setState(me?.isAdmin ? 'allow' : 'deny');
      } catch (e) {
        if (mounted) setState('deny');
      }
    })();
    return () => { mounted = false; };
  }, [get]);

  if (state === 'loading') {
    if (!isWeb) {
      return (
				<>
					<Navbar />
					<View style={{ flex: 1, backgroundColor: '#151316ff', alignItems: 'center', justifyContent: 'center' }}>
							{/* Avoid rendering content while checking access */}
					</View>
				</>
      );
    }
    return (
			<>
				<Navbar />
				<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#151316ff', color: '#fff' }}>
					{/* Avoid rendering content while checking access */}
				</div>
			</>
    );
  }

  if (state === 'deny') {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default Guard;
