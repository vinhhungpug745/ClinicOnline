import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CONFIGS = {
    danger: {
        bg:           '#2A0E0E',
        iconBg:       '#EF4444',
        icon:         'trash-can-outline',
        confirmColor: '#F87171',
    },
    warning: {
        bg:           '#2A1F0E',
        iconBg:       '#F59E0B',
        icon:         'alert-outline',
        confirmColor: '#FBBF24',
    },
    info: {
        bg:           '#0E1A2A',
        iconBg:       '#3B82F6',
        icon:         'information-outline',
        confirmColor: '#60A5FA',
    },
    success: {
        bg:           '#0E1F17',
        iconBg:       '#22C55E',
        icon:         'check-circle-outline',
        confirmColor: '#4ADE80',
    },
};

const CustomAlert = ({ visible, type = 'info', title, message, actions, onClose, dismissable=false}) => {
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    damping: 14,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 140,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.88,
                    duration: 140,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const cfg = CONFIGS[type] ?? CONFIGS.info;

    return (
        <Modal transparent visible={visible} animationType="none">
            <TouchableWithoutFeedback onPress={dismissable ? () => {} : onClose}>
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.box,
                                { backgroundColor: cfg.bg, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                            ]}
                        >
                            <View style={styles.content}>
                                <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
                                    <MaterialCommunityIcons name={cfg.icon} size={22} color="#fff" />
                                </View>

                                <View style={styles.textBlock}>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.message}>{message}</Text>
                                </View>
                            </View>

                            <View style={styles.actions}>
                                {actions.map((action, i) => {
                                    const isCancel = action.style === 'cancel';
                                    const isLast = i === actions.length - 1;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.actionBtn,
                                                !isLast && styles.actionBtnBorder,
                                            ]}
                                            activeOpacity={0.65}
                                            onPress={() => {
                                                onClose();
                                                action.onPress?.();
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.actionText,
                                                    isCancel
                                                        ? styles.cancelText
                                                        : { color: cfg.confirmColor },
                                                ]}
                                            >
                                                {action.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        width: 300,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textBlock: {
        flex: 1,
        gap: 3,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    message: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 17,
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnBorder: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: 'rgba(255,255,255,0.1)',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    cancelText: {
        fontWeight: '400',
        color: 'rgba(255,255,255,0.45)',
    },
});

export default CustomAlert;