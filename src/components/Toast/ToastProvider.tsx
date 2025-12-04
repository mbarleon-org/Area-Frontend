import React from 'react';
import Toast from './Toast';
import { isWeb } from '../../utils/IsWeb';

type ToastOptions = {
    message: string;
    duration?: number;
    backgroundColor?: string;
    textColor?: string;
    barColor?: string;
    position?: 'top' | 'bottom';
    transitionSide?: 'left' | 'right' | 'top' | 'bottom';
};

type ToastRecord = ToastOptions & { id: string };

type ToastContextValue = {
    showToast: (opts: ToastOptions) => { id: string; dismiss: () => void };
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const c = React.useContext(ToastContext);
    if (!c) throw new Error('useToast must be used within ToastProvider');
    return c;
};

const DEFAULT_STEP = 80;
const BASE_OFFSET = 20;

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

    let insets = { top: 0, bottom: 0 };
    if (!isWeb) {
        try {
            const safe = require('react-native-safe-area-context');
            const useSafeAreaInsets = safe && safe.useSafeAreaInsets ? safe.useSafeAreaInsets : null;
            if (useSafeAreaInsets) {
                insets = useSafeAreaInsets() || insets;
            }
        } catch (e) { }
    }

    const showToast = React.useCallback((opts: ToastOptions) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const record: ToastRecord = { id, ...opts };
        setToasts(prev => [record, ...prev]);

        const dismiss = () => setToasts(prev => prev.filter(t => t.id !== id));

        return { id, dismiss };
    }, []);

    const value = React.useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            {isWeb ? (
                <div style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none', zIndex: 4000 }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, pointerEvents: 'none' }}>
                        {toasts.filter(t => (t.position || 'top') === 'top').map((t, idx) => (
                            <div key={t.id} style={{ pointerEvents: 'auto' }}>
                                <Toast
                                    message={t.message}
                                    visible={true}
                                    onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                    duration={t.duration}
                                    backgroundColor={t.backgroundColor}
                                    textColor={t.textColor}
                                    barColor={t.barColor}
                                    position={'top'}
                                    offset={BASE_OFFSET + idx * DEFAULT_STEP}
                                    transitionSide={t.transitionSide}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                        {toasts.filter(t => (t.position || 'top') === 'bottom').map((t, idx) => (
                            <div key={t.id} style={{ pointerEvents: 'auto' }}>
                                <Toast
                                    message={t.message}
                                    visible={true}
                                    onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                    duration={t.duration}
                                    backgroundColor={t.backgroundColor}
                                    textColor={t.textColor}
                                    barColor={t.barColor}
                                    position={'bottom'}
                                    offset={BASE_OFFSET + idx * DEFAULT_STEP}
                                    transitionSide={t.transitionSide}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                (() => {
                    try {
                        const RN = require('react-native');
                        const { View } = RN;
                        return (
                            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
                                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, pointerEvents: 'none' }}>
                                    {toasts.filter(t => (t.position || 'top') === 'top').map((t, idx) => (
                                        <View key={t.id} style={{ pointerEvents: 'auto' }}>
                                            <Toast
                                                message={t.message}
                                                visible={true}
                                                onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                                duration={t.duration}
                                                backgroundColor={t.backgroundColor}
                                                textColor={t.textColor}
                                                barColor={t.barColor}
                                                position={'top'}
                                                offset={BASE_OFFSET + (insets?.top || 0) + idx * DEFAULT_STEP}
                                                transitionSide={t.transitionSide}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                                    {toasts.filter(t => (t.position || 'top') === 'bottom').map((t, idx) => (
                                        <View key={t.id} style={{ pointerEvents: 'auto' }}>
                                            <Toast
                                                message={t.message}
                                                visible={true}
                                                onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                                duration={t.duration}
                                                backgroundColor={t.backgroundColor}
                                                textColor={t.textColor}
                                                barColor={t.barColor}
                                                position={'bottom'}
                                                offset={BASE_OFFSET + (insets?.bottom || 0) + idx * DEFAULT_STEP}
                                                transitionSide={t.transitionSide}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    } catch (e) {
                        return null;
                    }
                })()
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
