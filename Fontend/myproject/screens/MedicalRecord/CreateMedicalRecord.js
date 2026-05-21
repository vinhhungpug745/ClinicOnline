import { useEffect, useState } from "react";
import {
    View, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator
} from "react-native";
import { Text, Divider } from "react-native-paper";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import { fetchWithAuth, createWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TextInput } from "react-native-paper";
import SectionTitle from "../../components/Appointment/SectionTilte";
import Field from "../../components/MedicalRecord/Field";

const CreateMedicalRecord = ({ navigation, route }) => {
    const { appointmentId } = route.params;
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // ─── HỒ SƠ BỆNH ÁN ───
    const [diagnosis, setDiagnosis] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [medical_notes, setMedicalNotes] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    // ─── DANH SÁCH THUỐC (để load từ API) ───
    const [availableMedicines, setAvailableMedicines] = useState([]);
    const [medicinesLoaded, setMedicinesLoaded] = useState(false);

    // ─── ĐƠN THUỐC (các thuốc đã thêm vào) ───
    const [instructionNotes, setInstructionNotes] = useState("");
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [medicineSearch, setMedicineSearch] = useState("");

    // ─── DANH SÁCH XÉT NGHIỆM (để load từ API) ───
    const [availableTests, setAvailableTests] = useState([]);
    const [testsLoaded, setTestsLoaded] = useState(false);

    // ─── KẾT QUẢ XÉT NGHIỆM (các xét nghiệm đã thêm vào) ───
    const [testResults, setTestResults] = useState([]);
    const [testSearch, setTestSearch] = useState("");

    // ─── LOAD THUỐC ───
    const loadMedicines = async () => {
        if (medicinesLoaded) return;
        await fetchWithAuth(
            endpoints.medicines,
            (data) => {
                setAvailableMedicines(data.results ?? data ?? []);
                setMedicinesLoaded(true);
            },
            () => showSnackbar("Không tải được danh sách thuốc", "error"),
            {},
            setLoading
        );
    };

    // ─── LOAD XÉT NGHIỆM ───
    const loadTests = async () => {
        if (testsLoaded) return;
        await fetchWithAuth(
            endpoints.tests,
            (data) => {
                setAvailableTests(data.results ?? data ?? []);
                console.log(
                    "RAW tests response:",
                    JSON.stringify(data, null, 2)
                );
                setTestsLoaded(true);
            },
            () => showSnackbar("Không tải được danh sách xét nghiệm", "error"),
            {},
            setLoading
        );
    };

    // ─── QUẢN LÝ THUỐC ───
    const filteredMedicines = availableMedicines.filter(m =>
        m.name?.toLowerCase().includes(medicineSearch.toLowerCase()) &&
        !prescriptionDetails.find(d => d.medicine_id === m.id)
    );

    const addMedicine = (medicine) => {
        setPrescriptionDetails(prev => [
            ...prev,
            {
                medicine_id: medicine.id,
                name: medicine.name,
                quantity: "",
                dosage: ""
            }
        ]);
        setMedicineSearch(""); // Xóa search sau khi thêm
    };

    const removeMedicine = (index) => {
        setPrescriptionDetails(prev => prev.filter((_, i) => i !== index));
    };

    const updateMedicine = (index, field, value) => {
        setPrescriptionDetails(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };

    // ─── QUẢN LÝ XÉT NGHIỆM ───
    const filteredTests = availableTests.filter(t =>
        t.name?.toLowerCase().includes(testSearch.toLowerCase()) &&
        !testResults.find(r => r.test_id === t.id)
    );

    const addTestResult = (test) => {
        setTestResults(prev => [
            ...prev,
            {
                test_id: test.id,
                name: test.name,
                price: test.price,
                result: "",
                file: null,
            }
        ]);
        setTestSearch(""); // Xóa search sau khi thêm
    };

    const removeTestResult = (index) => {
        setTestResults(prev => prev.filter((_, i) => i !== index));
    };

    const updateTestResult = (index, field, value) => {
        setTestResults(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };

    // ─── SUBMIT ───
    const handleSubmit = async () => {
        if (!diagnosis.trim()) {
            showSnackbar("Vui lòng nhập chẩn đoán", "error");
            return;
        }

        const body = {
            appointment_id: appointmentId,
            diagnosis: diagnosis.trim(),
            symptoms: symptoms.trim(),
            medical_notes: medical_notes.trim(),
            follow_up_date: followUpDate.trim() || null,
        };

        if (prescriptionDetails.length > 0) {
            body.prescription = {
                instruction_notes: instructionNotes.trim(),
                details: prescriptionDetails.map(d => ({
                    medicine_id: d.medicine_id,
                    quantity: parseInt(d.quantity) || 0,
                    dosage: d.dosage,
                })),
            };
        }

        if (testResults.length > 0) {
            body.test_results = testResults.map(t => ({
                test_id: t.test_id,
                result: t.result,
            }));
        }

        await createWithAuth(
            endpoints.medicalRecords,
            body,
            () => {
                showSnackbar("Tạo hồ sơ bệnh án thành công", "success");
                navigation.goBack();
            },
            (type, msg, errData) => {
                console.log("errData:", JSON.stringify(errData, null, 2));
                if (errData && typeof errData === "object") {
                    const messages = Object.entries(errData)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
                        .join("\n");
                    showSnackbar(messages || "Tạo hồ sơ thất bại", "error");
                } else {
                    showSnackbar(msg || "Tạo hồ sơ thất bại", "error");
                }
            },
            setLoading
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Tạo hồ sơ" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scroll}>

                {/* ── HỒ SƠ BỆNH ÁN ── */}
                <SectionTitle icon="file-document-outline" text="Hồ sơ bệnh án" />
                <View style={styles.card}>
                    <Field label="Chẩn đoán *" value={diagnosis} onChangeText={setDiagnosis} multiline />
                    <Field label="Triệu chứng" value={symptoms} onChangeText={setSymptoms} multiline />
                    <Field label="Ghi chú" value={medical_notes} onChangeText={setMedicalNotes} multiline />
                    <Field
                        label="Ngày tái khám (YYYY-MM-DD)"
                        value={followUpDate}
                        onChangeText={setFollowUpDate}
                        placeholder="2026-06-01"
                    />
                </View>

                {/* ── ĐƠN THUỐC ── */}
                <SectionTitle icon="pill" text="Đơn thuốc" />
                <View style={styles.card}>
                    <Field
                        label="Hướng dẫn sử dụng"
                        value={instructionNotes}
                        onChangeText={setInstructionNotes}
                        multiline
                    />

                    {/* Thanh tìm kiếm thuốc */}
                    <TextInput
                        mode="outlined"
                        label="Tìm và thêm thuốc..."
                        value={medicineSearch}
                        onChangeText={(v) => {
                            setMedicineSearch(v);
                            if (v.trim().length > 0 && !medicinesLoaded) {
                                loadMedicines();
                            }
                        }}
                        left={<TextInput.Icon icon="magnify" />}
                        outlineColor={COLORS.border}
                        activeOutlineColor={COLORS.primary}
                        style={styles.input}
                    />

                    {/* Kết quả tìm kiếm thuốc */}
                    {medicineSearch.trim().length > 0 && (
                        <View style={localStyles.searchResults}>
                            {filteredMedicines.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={localStyles.searchResultItem}
                                    onPress={() => addMedicine(m)}
                                >
                                    <MaterialCommunityIcons name="pill" size={14} color={COLORS.primary} />
                                    <Text style={localStyles.searchResultText}>{m.name}</Text>
                                    <MaterialCommunityIcons name="plus-circle-outline" size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            ))}
                            {filteredMedicines.length === 0 && (
                                <Text style={localStyles.noResult}>Không tìm thấy thuốc</Text>
                            )}
                        </View>
                    )}

                
                    {/* Danh sách thuốc đã thêm */}
                    {prescriptionDetails.map((detail, index) => (
                        <View key={`medicine-${detail.medicine_id}`} style={localStyles.medicineItem}>
                            <View style={localStyles.medicineHeader}>
                                <View style={localStyles.selectedMedicine}>
                                    <MaterialCommunityIcons name="pill" size={14} color={COLORS.primary} />
                                    <Text style={localStyles.selectedMedicineName}>{detail.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeMedicine(index)}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>

                            <Field
                                label="Số lượng"
                                value={detail.quantity}
                                onChangeText={(v) => updateMedicine(index, "quantity", v)}
                                keyboardType="numeric"
                            />
                            <Field
                                label="Liều dùng"
                                value={detail.dosage}
                                onChangeText={(v) => updateMedicine(index, "dosage", v)}
                            />
                        </View>
                    ))}
                </View>

                {/* ── KẾT QUẢ XÉT NGHIỆM ── */}
                <SectionTitle icon="test-tube" text="Kết quả xét nghiệm" />
                <View style={styles.card}>
                    <TextInput
                        mode="outlined"
                        label="Tìm và thêm xét nghiệm..."
                        value={testSearch}
                        onChangeText={(v) => {
                            setTestSearch(v);
                            if (v.trim().length > 0 && !testsLoaded) {
                                loadTests();
                            }
                        }}
                        left={<TextInput.Icon icon="magnify" />}
                        outlineColor={COLORS.border}
                        activeOutlineColor={COLORS.primary}
                        style={styles.input}
                    />

                    {/* Kết quả tìm kiếm xét nghiệm */}
                    {testSearch.trim().length > 0 && (
                        <View style={localStyles.searchResults}>
                            {filteredTests.map(t => (
                                <TouchableOpacity  key={t.id} style={localStyles.searchResultItem}  onPress={() => addTestResult(t)} >
                                    <MaterialCommunityIcons name="test-tube" size={14}  color={COLORS.primary}/>
                                    <View style={{ flex: 1 }}>
                                        <Text style={localStyles.searchResultText}>
                                            {t.name}
                                        </Text>
                                    </View>

                                    <MaterialCommunityIcons name="plus-circle-outline" size={16}color={COLORS.primary}/>
                                </TouchableOpacity>
                            ))}

                            {filteredTests.length === 0 && (<Text style={localStyles.noResult}>  Không tìm thấy xét nghiệm </Text>)}
                        </View>
                    )}

                    {/* Danh sách xét nghiệm đã thêm */}
                    {testResults.map((test, index) => (
                        <View
                            key={`test-${test.test_id}`}
                            style={localStyles.medicineItem}
                        >
                            <View style={localStyles.medicineHeader}>
                                <View style={localStyles.selectedMedicine}>
                                    <MaterialCommunityIcons
                                        name="test-tube"
                                        size={14}
                                        color={COLORS.primary}
                                    />

                                    <View style={{ flex: 1 }}>
                                        <Text style={localStyles.selectedMedicineName}>
                                            {test.name}
                                        </Text>

                                        <Text style={{
                                            fontSize: 11,
                                            color: COLORS.textMuted
                                        }}>
                                            {test.price?.toLocaleString()} VNĐ
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => removeTestResult(index)}
                                >
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={20}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>
                            </View>

                            <Field
                                label="Kết quả"
                                value={test.result}
                                onChangeText={(v) =>
                                    updateTestResult(index, "result", v)
                                }
                                multiline
                            />
                            <Field
                                label="File"
                                value={test.file ? test.file.name : ""}
                                onChangeText={(v) =>
                                    updateTestResult(index, "file", v)
                                }
                                multiline
                            />
                        </View>
                    ))}
                </View>

                <AppButton
                    type="create"
                    label="Tạo hồ sơ bệnh án"
                    onPress={handleSubmit}
                    loading={loading}
                    style={{ marginTop: 8 }}
                />

            </ScrollView>
        </View>
    );
};

export default CreateMedicalRecord;

const styles = StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 40 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 1,
        gap: 10,
    },

    sectionTitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
    },
    sectionText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
    },

    input: {
        backgroundColor: "#fff",
        fontSize: 13,
    },

    medicineItem: { gap: 8 },
    medicineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    medicineIndex: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },

    selectLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    medicineScroll: { marginBottom: 4 },
    medicineChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    medicineChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    medicineChipText: {
        fontSize: 12,
        color: COLORS.text,
    },
    medicineChipTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
});

const localStyles = StyleSheet.create({
    searchResults: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        maxHeight: 200,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#F3F4F6",
    },
    searchResultText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text,
    },
    noResult: {
        padding: 14,
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
    },
    medicineItem: {
        gap: 8,
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 10,
    },
    medicineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedMedicine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    selectedMedicineName: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
});