
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchWithAuth, updatePatchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppointmentCard from "../../components/Appointment/AppointmentCard";
import COLORS from "../../styles/Colors";
import Mystyles from "../../styles/Mystyles";
import AppList from "../../components/AppList";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import LoadingScreen from "../../components/LoadingScreen";
import AppHeader from "../../components/AppHeader";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { useAlert } from "../../utils/contexts/AlertContext";

const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "Pending", label: "Chờ duyệt" },
    { key: "Confirmed", label: "Đã xác nhận" },
    { key: "Completed", label: "Hoàn thành" },
    { key: "Canceled", label: "Đã từ chối" },
];

const ListAppointments = ({ navigation }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingScrean, setLoadingScrean] = useState(true)
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [error, setError] = useState(null);
    const { user, dispatch } = React.useContext(MyUserContext);
    const { showSnackbar } = useSnackbar();
    const {showAlertAuth} = useAlert();
    const loadAppointments = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoadingScrean(true);
        setError(null);

        await fetchWithAuth(
            endpoints.appointments,
            (data) => { setAppointments(data); },
            (err) => { setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại."); },);

        if (isRefresh) setRefreshing(false);
        else setLoadingScrean(false);
    };

    useEffect(() => {
        if (!user) return;
        loadAppointments();
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                showAlertAuth({ lable: "Lịch hẹn" })
                setLoading(false)
                return
            }loadAppointments();
        }, [])
    );

    const changeStatusAppointment = async (id, stutus) => {
        await updatePatchWithAuth(
            endpoints.appointmentDetail(id),
            stutus,
            (data) => {
                showSnackbar("Duyệt phiếu thành công", "success")
            },
            (type, msg, errData) => {
                if (type === "client") {
                    showSnackbar("Duyệt phiếu thất bại!", "error", msg);
                } else if (type === "server") {
                    showSnackbar("Lỗi máy chủ!", msg, "error");
                } else {
                    showSnackbar("Mất kết nối!", msg, "error");
                }
            }, setLoading

        )
    }


    const filteredData = activeFilter === "all" ? appointments : appointments.filter((a) => a.status === activeFilter);

    if (loadingScrean) {
        return (
            <LoadingScreen text="Đang tải lịch hẹn của bạn..." />
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
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Lịch hẹn của tôi" onBack={() => {
                navigation.goBack();
            }}>
                <View style={styles.header}>
                    <Text style={styles.headerSub}>{appointments.length} lịch hẹn</Text>
                </View>

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
            </AppHeader>
            <View style={{ flex: 1, paddingTop: 16 }}>
                <AppList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <AppointmentCard
                            item={item}
                            onPress={() =>
                                navigation.navigate("AppointmentDetail", { id: item.id })
                            }
                            onConfirm={(id) => changeStatusAppointment(id, { "status": "Confirmed" })}
                            onReject={(id) => changeStatusAppointment(id, { "status": "Canceled" })}
                        />
                    )}
                    refreshing={refreshing}
                    onRefresh={() => loadAppointments(true)}
                    emptyIcon="calendar-blank-outline"
                    emptyTitle="Không có lịch hẹn"
                    emptyText={
                        activeFilter === "all"
                            ? "Bạn chưa có lịch hẹn nào."
                            : "Không có lịch hẹn ở trạng thái này."
                    }
                />
            </View>
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
        paddingVertical: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: COLORS.text,
    },
    headerSub: {
        fontSize: 13,
        color: COLORS.white,
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
        backgroundColor: COLORS.blue,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        borderWidth: 1.5,
    },
    filterChipActive: {
        backgroundColor: COLORS.border,
        borderColor: COLORS.white,
    },
    filterText: {
        fontSize: 13,
        color: COLORS.white,
        fontWeight: "500",
    },
    filterTextActive: {
        color: COLORS.text,
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