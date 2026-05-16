import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";
import { formatDate } from "../../utils/format";
import { DAY_VI_FULL } from "../../utils/mapping";

const WorkdayCard = ({ item, onPress, onDelete, onLongPress, selected }) => {
    const { date, day_of_week } = item;

    // ── Animation values ──
    const shake = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const deleteWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (selected) {
            // Rung nhẹ khi được chọn
            Animated.sequence([
                Animated.timing(scale, { toValue: 0.97, duration: 100, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(shake, { toValue: 4, duration: 60, useNativeDriver: true }),
                Animated.timing(shake, { toValue: -4, duration: 60, useNativeDriver: true }),
                Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();

            // Nút xóa slide in
            Animated.spring(deleteWidth, {
                toValue: 80,
                useNativeDriver: false,
                bounciness: 10,
            }).start();
        } else {
            // Nút xóa slide out
            Animated.timing(deleteWidth, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    }, [selected]);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Animated.View style={[
                styles.card,
                selected && styles.cardSelected,
                {
                    transform: [
                        { translateX: shake },
                        { scale: scale },
                    ]
                }
            ]}>
                {/* Icon */}
                <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                    <MaterialCommunityIcons
                        name={selected ? "trash-can-outline" : "calendar-week"}
                        size={24}
                        color={selected ? COLORS.error : COLORS.primary}
                    />
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.dayOfWeek}>{DAY_VI_FULL[day_of_week] ?? day_of_week}</Text>
                    <Text style={styles.date}>{formatDate(date)}</Text>
                </View>

                {/* Nút xóa slide in/out */}
                <Animated.View style={{ width: deleteWidth, overflow: 'hidden' }}>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => onDelete(item.id)}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
                        <Text style={styles.deleteBtnText}>Xóa</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Arrow - ẩn khi selected */}
                {!selected && (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 16,
        backgroundColor: "#FFF",
        marginBottom: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    cardSelected: {
        borderLeftColor: COLORS.error,
        backgroundColor: COLORS.errorLight,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBoxSelected: {
        backgroundColor: COLORS.errorLight,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    dayOfWeek: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
    },
    date: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 80,
    },
    deleteBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
});

export default WorkdayCard;