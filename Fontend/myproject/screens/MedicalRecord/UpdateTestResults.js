import { useState } from "react";
import { View, ScrollView, TouchableOpacity ,StyleSheet,ActivityIndicator} from "react-native";
import { Text, Divider } from "react-native-paper";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import { updatePatchWithAuth, createWithAuth ,fetchWithAuth,deleteWithAuth} from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SectionTitle from "../../components/Appointment/SectionTilte";
import Field from "../../components/MedicalRecord/Field";
import styles from "../../styles/Mystyles";
import { TextInput } from "react-native-paper";
import AppSnackbar from "../../components/AppSnackbar";
import confirmDelete from "../../components/MedicalRecord/ConfirmDelete";

const UpdateTestResults = ({ navigation, route }) => {
    const { medicalRecordId, testResults: initialResults } = route.params;
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [availableTests, setAvailableTests] = useState([]);
    const [testsLoaded, setTestsLoaded] = useState(false);
    const [testSearch, setTestSearch] = useState("");
    const [snackbar, setSnackbar] = useState({});
    const [newItems, setNewItems] = useState([]);
    const [testResults, setTestResults] = useState(
        initialResults?.map(t => ({
            id: t.id,
            test_id: t.test?.id,
            name: t.test?.name,
            price: t.test?.price || 0,
            result: t.result || "",
            file: t.file || null,
        })) ?? []
    );
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

    const removeTestResult = async (index) => {
        const item = testResults[index];
        confirmDelete({
            message: `Bạn có chắc muốn xóa xét nghiệm "${item.name}" không?`,
            onConfirm: async () => {
                try {
                    if (item?.id) {
                        await deleteWithAuth(
                            endpoints.testResultDetail(item.id),
                            () => showSnackbar("Xóa thành công", "success"),
                            (type, msg) => { throw new Error(msg || "Xóa thất bại"); },
                            null
                        );
                    }
                    setTestResults(prev => prev.filter((_, i) => i !== index));
                } catch (err) {
                    showSnackbar(err.message || "Không thể xóa", "error");
                }
            }
        });
    };

    const updateTestResult = (index, field, value) => {
        setTestResults(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };
    

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const existingItems = testResults.filter(t => t.id);
            const newItems = testResults.filter(t => !t.id);

            // PATCH từng item đã có
            for (const t of existingItems) {
                await updatePatchWithAuth(
                    endpoints.testResultDetail(t.id),
                    { result: t.result, file: t.file ?? null },
                    (data) => {
                        showSnackbar("Cập nhật kết quả xét nghiệm thành công", "success");
                        navigation.goBack();
                    },
                    (type, msg, errData) => {
                        const messages = errData && typeof errData === "object"
                            ? Object.entries(errData).map(([, errors]) => Array.isArray(errors) ? errors.join(", ") : errors).join("\n")
                            : msg;
                        showSnackbar(messages || "Cập nhật thất bại", "error");
                    },
                    setLoading
                );
            }

            // POST bulk item mới
            if (newItems.length > 0) {
                await createWithAuth(
                    endpoints.testResults,
                    {
                        medical_record_id: medicalRecordId,
                        test_results: newItems.map(t => ({
                            test_id: t.test_id,
                            result: t.result,
                            file: t.file ?? null,
                        })),
                    },
                    (data) => {
                        showSnackbar("Tạo kết quả xét nghiệm thành công", "success");

                    },
                    (type, msg, errData) => {
                        const messages = errData && typeof errData === "object"
                            ? Object.entries(errData).map(([, errors]) => Array.isArray(errors) ? errors.join(", ") : errors).join("\n")
                            : msg;
                        showSnackbar(messages || "Tạo thất bại", "error");
                    },
                    setLoading
                );
            }
            showSnackbar("Lưu kết quả xét nghiệm thành công", "success");
            navigation.goBack();
        }
        catch (err) {showSnackbar(err.message || "Có lỗi xảy ra", "error");}
        finally {setLoading(false);}
    };
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader 
                titles={
                    initialResults?.length > 0
                        ? "Cập nhật KQ xét nghiệm"
                        : "Tạo xét nghiệm"
                }
                onBack={() => navigation.goBack()} 
                />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
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
                    <Divider style={{ margin: 10 }} />
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
                            key={`test-${test.test_id}-${index}`}
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
                    label={initialResults?.length > 0
                        ? "Lưu cập nhật"
                        : "Tạo xét nghiệm"}
                    onPress={handleSubmit}
                    loading={loading}
                />
                <AppSnackbar
                    visible={snackbar.visible}
                    message={snackbar.message}
                    type={snackbar.type}
                    onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
                />
            </ScrollView>
        </View>
    );
};

export default UpdateTestResults;

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