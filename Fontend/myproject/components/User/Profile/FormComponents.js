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

export const StyledInput = ({ style, error, errorMessage, ...props }) => (
    <View>
        <TextInput
            style={[styles.input, style, error && styles.inputError]}
            placeholderTextColor={COLORS.textLight}
            {...props}
        />
        {error && errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
    </View>
);

const styles = StyleSheet.create({
    inputError: {
        borderColor: COLORS.error,
        borderWidth: 1,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
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