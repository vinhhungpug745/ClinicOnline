import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CONFIGS = {
    success: {
        bg:        '#1B2339',
        iconBg:    '#22C55E',
        icon:      'check',
        barColor:  '#4ADE80',
        actionColor: '#4ADE80',
        actionBg:  'rgba(74,222,128,0.12)',
    },
    warning: {
        bg:        '#2A1F0E',
        iconBg:    '#F59E0B',
        icon:      'alert',
        barColor:  '#FBBF24',
        actionColor: '#FBBF24',
        actionBg:  'rgba(251,191,36,0.12)',
    },
    error: {
        bg:        '#2A0E0E',
        iconBg:    '#EF4444',
        icon:      'close-circle',
        barColor:  '#F87171',
        actionColor: '#F87171',
        actionBg:  'rgba(248,113,113,0.12)',
    },
};

const AppSnackbar = ({
    visible,
    message,
    sub,
    type = 'success',
    onDismiss,
    duration = 3000,
}) => {
    const cfg = CONFIGS[type] ?? CONFIGS.success;

    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            duration={duration}
            style={[styles.snackbar, { backgroundColor: cfg.bg }]}
            wrapperStyle={styles.wrapper}
            action={{
                label: 'OK',
                textColor: cfg.actionColor,
                onPress: onDismiss,
            }}
        >
            <View style={styles.content}>
                {/* Icon circle */}
                <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
                    <MaterialCommunityIcons name={cfg.icon} size={18} color="#fff" />
                </View>

                {/* Text */}
                <View style={styles.textBlock}>
                    <Text style={styles.title}>{message}</Text>
                    {sub ? <Text style={styles.sub}>{sub}</Text> : null}
                </View>
            </View>
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
        paddingBottom: 16, 
    },
    snackbar: {
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textBlock: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    sub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    progTrack: {
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginTop: 8,
        overflow: 'hidden',
    },
    progBar: {
        width: '60%',
        height: '100%',
        borderRadius: 2,
    },
});

export default AppSnackbar;