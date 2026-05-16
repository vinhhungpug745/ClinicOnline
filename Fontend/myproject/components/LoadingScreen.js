// components/LoadingScreen.js
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import COLORS from "../styles/Colors";


const LoadingScreen = ({ text = "Đang tải..." }) => {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>{text}</Text>
        </View>
    );
};

export default LoadingScreen;

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 32,
    },
    stateText: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
    },
});