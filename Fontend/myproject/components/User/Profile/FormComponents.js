import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../../styles/Colors";

export const SectionLabel = ({ icon, text }) => (
    <View style={styles.sectionRow}>
        <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
        <Text style={styles.sectionText}>{text}</Text>
    </View>
);

export const Field = ({ label, required, children }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>
            {label}
            {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
        {children}
    </View>
);

export const StyledInput = ({ style, ...props }) => (
    <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textLight}
        {...props}
    />
);

const styles = StyleSheet.create({
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
    },
    sectionText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    fieldWrap: { gap: 6, flex: 1 },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    input: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: COLORS.bg,
    },
});