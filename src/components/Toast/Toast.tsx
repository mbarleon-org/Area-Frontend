import React from 'react';
import { isWeb } from '../../utils/IsWeb';

type TransitionSide = 'left' | 'right' | 'top' | 'bottom';

type Props = {
    message: string;
    visible: boolean;
    onClose?: () => void;
    duration?: number;
    backgroundColor?: string;
    textColor?: string;
    position?: 'top' | 'bottom';
    offset?: number;
    transitionSide?: TransitionSide;
};

const DEFAULT_DURATION = 5000;

const Toast: React.FC<Props> = ({
    message,
    visible,
    onClose,
    duration = DEFAULT_DURATION,
    backgroundColor = '#222',
    textColor = '#fff',
    position = 'top',
    offset = 20,
    transitionSide = 'left',
}) => {
    if (isWeb) {
        const [mounted, setMounted] = React.useState<boolean>(false);
        const [show, setShow] = React.useState<boolean>(false);
        const [progressStarted, setProgressStarted] = React.useState<boolean>(false);

        React.useEffect(() => {
            let hideTimer: ReturnType<typeof setTimeout> | null = null;
            if (visible) {
                setMounted(true);
                requestAnimationFrame(() => {
                    setShow(true);
                    requestAnimationFrame(() => setProgressStarted(true));
                });
                hideTimer = setTimeout(() => {
                    setShow(false);
                    setTimeout(() => {
                        setProgressStarted(false);
                        setMounted(false);
                        if (onClose) onClose();
                    }, 300);
                }, duration);
            } else {
                setShow(false);
                hideTimer = setTimeout(() => {
                    setProgressStarted(false);
                    setMounted(false);
                }, 300);
            }
            return () => { if (hideTimer) clearTimeout(hideTimer); };
        }, [visible]);

        if (!mounted) return null;

        const base: React.CSSProperties = {
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3000,
            pointerEvents: 'auto',
            transition: 'transform 300ms ease, opacity 300ms ease',
            opacity: show ? 1 : 0,
            backgroundColor,
            color: textColor,
            padding: '12px 16px',
            minHeight: 64,
            borderRadius: 8,
            minWidth: 220,
            boxSizing: 'border-box',
        };

        if (position === 'top') base.top = offset;
        else base.bottom = offset;

        if (!show) {
            if (transitionSide === 'left') base.transform = 'translateX(-140%)';
            else if (transitionSide === 'right') base.transform = 'translateX(40%) translateX(0)';
            else if (transitionSide === 'top') base.transform = `translateY(-40%)`;
            else if (transitionSide === 'bottom') base.transform = `translateY(40%)`;
        } else {
            base.transform = 'translateX(-50%)';
        }

        return (
            <div style={base} onClick={() => onClose && onClose()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>{message}</div>
                    <button style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer' }} aria-label="close">✕</button>
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: '#333', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ height: '100%', background: '#4CAF50', width: progressStarted ? '0%' : '100%', transition: `width ${duration}ms linear` }} />
                </div>
            </div>
        );
    }

    try {
        const RN = require('react-native');
        const { Animated, View, Text, TouchableOpacity } = RN;
        const translate = React.useRef(new Animated.Value(transitionSide === 'left' || transitionSide === 'right' ? (transitionSide === 'left' ? -400 : 400) : (transitionSide === 'top' ? -200 : 200))).current;
        const progress = React.useRef(new Animated.Value(1)).current; // 1 -> 0
        const [mounted, setMounted] = React.useState<boolean>(false);

        React.useEffect(() => {
            let hideTimer: ReturnType<typeof setTimeout> | null = null;
            if (visible) {
                setMounted(true);
                Animated.timing(translate, { toValue: 0, duration: 300, useNativeDriver: true }).start();
                progress.setValue(1);
                Animated.timing(progress, { toValue: 0, duration, useNativeDriver: false }).start();
                hideTimer = setTimeout(() => {
                    Animated.timing(translate, { toValue: (transitionSide === 'left' ? -400 : (transitionSide === 'right' ? 400 : (transitionSide === 'top' ? -200 : 200))), duration: 300, useNativeDriver: true }).start(() => {
                        setMounted(false);
                        if (onClose) onClose();
                    });
                }, duration);
            } else {
                Animated.timing(translate, { toValue: (transitionSide === 'left' ? -400 : (transitionSide === 'right' ? 400 : (transitionSide === 'top' ? -200 : 200))), duration: 300, useNativeDriver: true }).start(() => setMounted(false));
            }
            return () => { if (hideTimer) clearTimeout(hideTimer); };
        }, [visible]);

        if (!mounted) return null;

        const transformStyle = (transitionSide === 'left' || transitionSide === 'right')
            ? { transform: [{ translateX: translate }] }
            : { transform: [{ translateY: translate }] };

        const interpolatedWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

        const containerStyle: any = {
            position: 'absolute',
            left: 16,
            right: 16,
            borderRadius: 8,
            paddingVertical: 14,
            paddingHorizontal: 12,
            backgroundColor,
            zIndex: 4000,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 56,
            ...((position === 'top') ? { top: offset } : { bottom: offset }),
        };

        return (
            <Animated.View style={[containerStyle, transformStyle]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
                    <Text style={{ color: textColor, flex: 1 }}>{message}</Text>
                    <TouchableOpacity onPress={() => onClose && onClose()} style={{ padding: 8 }}>
                        <Text style={{ color: textColor }}>✕</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' }}>
                    <Animated.View style={{ height: '100%', backgroundColor: '#4CAF50', width: interpolatedWidth }} />
                </View>
            </Animated.View>
        );
    } catch (e) {
        return null;
    }
};

export default Toast;
