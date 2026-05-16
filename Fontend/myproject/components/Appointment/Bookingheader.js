import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Avatar, List, Surface, Text } from "react-native-paper";
import { Fragment } from "react";
import COLORS from "../../styles/Colors";
import AppHeader from "../AppHeader";

const TITLES = ["Chọn dịch vụ", "Thông tin bệnh nhân", "Xác nhận đặt khám"];

const STEPS = [
    { label: "Dịch vụ", icon: "medical-bag" },
    { label: "Bệnh nhân", icon: "account" },
    { label: "Hoàn thành", icon: "check-circle" },
];

const BookingHeader = ({ step, onBack }) => {
    const progress = (step + 1) / STEPS.length;

    return (
        <View>
            <AppHeader titles={TITLES} step={step} onBack={onBack}>
                <View style={styles.stepsRow}>
                    {STEPS.map((s, idx) => {
                        const isActive = idx === step;
                        const isComplete = idx < step;

                        return (
                            <Fragment key={idx}>
                                <View style={styles.stepItem}>
                                    <Avatar.Icon
                                        size={isActive ? 40 : 32}
                                        icon={isComplete ? "check" : s.icon}
                                        style={[
                                            styles.icon,
                                            isActive && styles.iconActive,
                                            isComplete && styles.iconDone,
                                            !isActive && !isComplete && styles.iconInactive,
                                        ]}
                                        color={isActive ? COLORS.blueDark : COLORS.white}
                                    />
                                    <Text style={[styles.label, isActive && styles.labelActive]}>
                                        {s.label}
                                    </Text>
                                </View>

                                {idx < STEPS.length - 1 && (
                                    <View style={[styles.connector, isComplete && styles.connectorDone]} />
                                )}
                            </Fragment>
                        );
                    })}
                </View>
            </AppHeader>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.blue,
        paddingBottom: 12,
    },
    appbar: {
        backgroundColor: "transparent",
        elevation: 0,
    },
    title: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 17,
    },
    stepsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginBottom: 10,
    },
    stepItem: {
        alignItems: "center",
        flexShrink: 0,
    },
    icon: {
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    iconActive: {
        backgroundColor: COLORS.white,
    },
    iconDone: {
        backgroundColor: "rgba(255,255,255,0.85)",
    },
    iconInactive: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    label: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 10,
        marginTop: 3,
    },
    labelActive: {
        color: COLORS.white,
        fontWeight: "700",
    },
    connector: {
        flex: 1,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginHorizontal: 6,
        marginBottom: 18,
        borderRadius: 2,
    },
    connectorDone: {
        backgroundColor: "rgba(255,255,255,0.85)",
    },
    progressBar: {
        marginHorizontal: 20,
        borderRadius: 4,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.25)",
    },
});

export default BookingHeader;