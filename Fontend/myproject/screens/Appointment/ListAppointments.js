
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppointmentCard from "../../components/Appointment/AppointmentCard";
import COLORS from "../../styles/Colors";
import Mystyles from "../../styles/Mystyles";
import AppList from "../../components/AppList";
import { MyUserContext } from "../../utils/contexts/MyUserContext";



const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "Pending", label: "Chờ khám" },
    { key: "Confirmed", label: "Đã xác nhận" },
    { key: "Done", label: "Hoàn thành" },
    { key: "Cancelled", label: "Đã huỷ" },
];

const ListAppointments = ({ navigation }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [error, setError] = useState(null);
    const { user, dispatch } = React.useContext(MyUserContext);
    const loadAppointments = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        
        try {
            await fetchWithAuth(endpoints.appointments, (data) => {
                setAppointments(data);
            });
        } catch (err) {
            setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user) return; 
        loadAppointments();
    }, [user]);

    const onRefresh = useCallback(() => loadAppointments(true), []);

    const filteredData = activeFilter === "all" ? appointments : appointments.filter((a) => a.status === activeFilter);


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.stateText}>Đang tải lịch hẹn...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="wifi-off" size={48} color={COLORS.textMuted} />
                <Text style={styles.stateTitle}>Có lỗi xảy ra</Text>
                <Text style={styles.stateText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => loadAppointments()}>
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={Mystyles.container}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
                <Text style={styles.headerSub}>{appointments.length} lịch hẹn</Text>
            </View>

            {/* ── Filter chips (scroll ngang) ── */}
            <View style={{ paddingVertical: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {FILTERS.map((f) => {
                        const isActive = activeFilter === f.key;
                        return (
                            <TouchableOpacity
                                key={f.key}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setActiveFilter(f.key)}
                                activeOpacity={0.5}
                            >
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            {/* ── List ── */}
            <AppList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <AppointmentCard
                        item={item}
                        onPress={() =>
                            navigation.navigate("AppointmentDetail", { id: item.id })
                        }
                    />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                emptyIcon="calendar-blank-outline"
                emptyTitle="Không có lịch hẹn"
                emptyText={
                    activeFilter === "all"
                        ? "Bạn chưa có lịch hẹn nào."
                        : "Không có lịch hẹn ở trạng thái này."
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        paddingTop: 50
    },

    // Header
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: COLORS.text,
    },
    headerSub: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // Filter
    filterRow: {
        paddingHorizontal: 16,
        // paddingBottom: 12,
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 0.5,
        borderColor: "#D1D5DB",
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    filterTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    // Empty / center states
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 32,
    },
    stateTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        textAlign: "center",
    },
    stateText: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
    },

    // Retry
    retryBtn: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});

export default ListAppointments;