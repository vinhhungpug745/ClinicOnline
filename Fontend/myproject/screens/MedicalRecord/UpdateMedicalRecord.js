import { useEffect, useState } from "react";
import {
    View, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator
} from "react-native";
import { Text, Divider } from "react-native-paper";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import styles from "../../styles/Mystyles";
import { fetchWithAuth, createWithAuth , updatePatchWithAuth} from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TextInput } from "react-native-paper";
import SectionTitle from "../../components/Appointment/SectionTilte";
import Field from "../../components/MedicalRecord/Field";

const UpdateMedicalRecord = ({ navigation, route }) => {
    const { id, record } = route.params;
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const [diagnosis, setDiagnosis] = useState(record?.diagnosis ?? "");
    const [symptoms, setSymptoms] = useState(record?.symptoms ?? "");
    const [medicalNotes, setMedicalNotes] = useState(record?.medical_notes ?? "");
    const [followUpDate, setFollowUpDate] = useState(record?.follow_up_date ?? "");

    const handleSubmit = async () => {
        if (!diagnosis.trim()) {
            showSnackbar("Vui lòng nhập chẩn đoán", "error");
            return;
        }

        await updatePatchWithAuth(
            endpoints.medicalRecordDetail(id),
            {
                diagnosis: diagnosis.trim(),
                symptoms: symptoms.trim(),
                medical_notes: medicalNotes.trim(),
                follow_up_date: followUpDate.trim() || null,
            },
            () => {
                showSnackbar("Cập nhật thành công", "success");
                navigation.goBack();
            },
            (type, msg, errData) => {
                console.log("errData:", JSON.stringify(errData, null, 2));
                // Parse lỗi validation từ Django
                if (errData && typeof errData === "object") {
                    const messages = Object.entries(errData).map(([field, errors]) =>Array.isArray(errors)? errors.join(", "): errors).join("\n");
                    showSnackbar(messages || "Lưu hồ sơ thất bại", "error");
                } else {
                    showSnackbar(msg || "Lưu hồ sơ thất bại", "error");
                }
            },
            setLoading
        );
    };


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Cập nhật hồ sơ bệnh án" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
                <View style={styles.card}>
                    <Field label="Chẩn đoán *" value={diagnosis} onChangeText={setDiagnosis}  multiline/>
                    <Field label="Triệu chứng" value={symptoms} onChangeText={setSymptoms} multiline/>
                    <Field label="Ghi chú" value={medicalNotes} onChangeText={setMedicalNotes} multiline/>
                    <Field label="Ngày tái khám (YYYY-MM-DD)" value={followUpDate} onChangeText={setFollowUpDate} placeholder="2026-06-01"/>
                </View>
                <AppButton
                    type="create"
                    label="Lưu cập nhật"
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>
        </View>
    );
}

export default UpdateMedicalRecord;