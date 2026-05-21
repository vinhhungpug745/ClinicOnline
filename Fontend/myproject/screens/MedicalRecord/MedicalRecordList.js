// screens/MedicalRecord/MedicalRecordList.js
import { useCallback, useContext, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import COLORS from "../../styles/Colors";
import AppHeader from "../../components/AppHeader";
import AppList from "../../components/AppList";
import LoadingScreen from "../../components/LoadingScreen";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { useAlert } from "../../utils/contexts/AlertContext";
import MedicalRecordCard from "../../components/MedicalRecord/MedicalRecordCard";

const FILTERS_DOCTOR = [
    { key: "all",              label: "Tất cả" },
    { key: "mine",             label: "Của tôi" },
    { key: "no_prescription",  label: "Chưa có đơn" },
    { key: "has_prescription", label: "Có đơn thuốc" },
];

const FILTERS_CUSTOMER = [
    { key: "all",              label: "Tất cả" },
    // { key: "no_prescription",  label: "Chưa có đơn" },
    // { key: "has_prescription", label: "Có đơn thuốc" },
];

const MedicalRecordList = ({ navigation }) => {
    const { user } = useContext(MyUserContext);
    const { showSnackbar } = useSnackbar();
    const { showAlertAuth } = useAlert();

    const [records, setRecords] = useState([]);
    const [loadingScreen, setLoadingScreen] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(false);

    const FILTERS = user?.role === "doctor" ? FILTERS_DOCTOR : FILTERS_CUSTOMER;

    const loadRecords = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoadingScreen(true);
        setError(null);

        await fetchWithAuth(
            endpoints.medicalRecords,
            (data) => setRecords(data.results ?? data),
            (type, msg) => setError("Không thể tải hồ sơ bệnh án. Vui lòng thử lại."),
        );

        if (isRefresh) setRefreshing(false);
        else setLoadingScreen(false);
    };

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                showAlertAuth({ lable: "Hồ sơ bệnh án" });
                setLoadingScreen(false);
                return;
            }
            loadRecords();
        }, [])
    );

    const filteredData = records.filter((item) => {
        switch (activeFilter) {
            case "mine":             return item.doctor_id === user?.id;
            case "has_prescription": return item.has_prescription === true;
            case "no_prescription":  return item.has_prescription === false;
            default:                 return true;
        }
    });

    if (loadingScreen) {
        return <LoadingScreen text="Đang tải hồ sơ bệnh án..." />;
    }

    if (error) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="wifi-off" size={48} color={COLORS.textMuted} />
                <Text style={styles.stateTitle}>Có lỗi xảy ra</Text>
                <Text style={styles.stateText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => loadRecords()}>
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }
    if (loading) return <LoadingScreen text="Đang tải thông tin bác sĩ và lịch làm việc..." />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Hồ sơ bệnh án" onBack={() => navigation.goBack()}>
                <View style={styles.header}>
                    <Text style={styles.headerSub}>{filteredData.length} hồ sơ</Text>
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
                         <MedicalRecordCard
                            item={item}
                            onPress={() => navigation.navigate("MedicalRecordDetail", { id: item.id })}
                        />
                    )}
                    refreshing={refreshing}
                    onRefresh={() => loadRecords(true)}
                    emptyIcon="file-document-outline"
                    emptyTitle="Không có hồ sơ bệnh án"
                    emptyText={
                        activeFilter === "all"
                            ? "Chưa có hồ sơ bệnh án nào."
                            : "Không có hồ sơ ở trạng thái này."
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Header
    header: {
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    headerSub: {
        fontSize: 13,
        color: COLORS.white,
        marginTop: 2,
    },

    // Filter
    filterRow: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.blue,
        borderWidth: 1.5,
        borderColor: COLORS.border,
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

});

export default MedicalRecordList;