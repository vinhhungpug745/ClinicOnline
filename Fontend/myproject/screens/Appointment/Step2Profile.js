import React from "react";
import {
    View, Text, ScrollView, StyleSheet,
    TextInput, Pressable
} from "react-native";
import { Card, SegmentedButtons, Chip, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";
import InsuranceCard from "../../components/User/Profile/InsuranceCard";
import PersonalInfoCard from "../../components/User/Profile/PersonalInfoCard";
import MedicalInfoCard from "../../components/User/Profile/MedicalInfoCard";
import { useBooking } from "../../utils/contexts/BookingContext";
import AppButton from "../../components/AppButton";
import { useNavigation } from "@react-navigation/native";
const BLOOD_TYPES = ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"];

const SectionLabel = ({ icon, text }) => (
    <View style={styles.sectionRow}>
        <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
        <Text style={styles.sectionText}>{text}</Text>
    </View>
);

const Field = ({ label, required, children }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>
            {label}
            {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
        {children}
    </View>
);

const StyledInput = ({ style, ...props }) => (
    <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textLight}
        {...props}
    />
);

const Step2Profile = () => {//{ data, updatePatient, updateProfile }
    // const p = data.patient;

    const { updatePatient, updateProfile, bookingData } = useBooking();
    const navigation = useNavigation();
    const p = bookingData.patient;

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View>
                <AppButton
                    type="edit"
                    label="Cập nhật sơ yếu lí lịch"
                    onPress={() => navigation.navigate("UserTab", { screen: "ProfileDetail" })}
                />
            </View>
            <View pointerEvents={"none"}>
                <PersonalInfoCard data={bookingData} updatePatient={updatePatient} />
                <InsuranceCard data={bookingData} updateProfile={updateProfile} />
                <MedicalInfoCard data={bookingData} updateProfile={updateProfile} />
            </View>

            {/* ── LÝ DO KHÁM ── */}
            <SectionLabel icon="clipboard-text-outline" text="Lý do khám" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Lý do khám" required>
                        <StyledInput
                            placeholder="VD: Đau đầu, mệt mỏi, khám định kỳ..."
                            value={p.reason}
                            onChangeText={(v) => updatePatient("reason", v)}
                        />
                    </Field>

                    <Field label="Triệu chứng đang gặp phải">
                        <StyledInput
                            placeholder="VD: Sốt 3 ngày, ho khan, khó thở nhẹ..."
                            value={p.symptoms}
                            onChangeText={(v) => updatePatient("symptoms", v)}
                            multiline
                            numberOfLines={4}
                            style={{ textAlignVertical: 'top', minHeight: 100 }}
                        />
                    </Field>

                    <View style={styles.infoBadge}>
                        <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.infoBadgeText}>
                            Mô tả chi tiết giúp bác sĩ chuẩn bị tốt hơn trước buổi khám
                        </Text>
                    </View>

                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
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

    card: {
        borderRadius: 16,
        backgroundColor: COLORS.white,
        elevation: 2,
        marginBottom: 16,

        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },

    cardContent: { gap: 14 },

    row2: { flexDirection: 'row', gap: 12 },

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

    segmented: {
        borderRadius: 10,
        backgroundColor: COLORS.bg,
    },

    segBtn: { borderRadius: 8 },

    infoBadge: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: COLORS.successLight,
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },

    infoBadgeText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 18,
    },

    bloodGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },

    bloodChip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.bg,
        minWidth: 52,
        alignItems: 'center',
    },

    bloodChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    bloodChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textMuted,
    },

    bloodChipTextActive: {
        color: COLORS.white,
    },

    chipInputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },

    addBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chipList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },

    chip: {
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.primaryBorder,
        borderWidth: 1,
    },

    chipText: {
        fontSize: 13,
        color: COLORS.primary,
    },

    emptyHint: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },
});

export default Step2Profile;