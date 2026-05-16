import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { Field, StyledInput, SectionLabel } from "./FormComponents";
import COLORS from "../../../styles/Colors";

const BLOOD_TYPES = ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"];

const MedicalInfoCard = ({ data, updateProfile}) => {
    const p = data.patient ? data.patient : data;

    return (
        <>
            <SectionLabel icon="heart-pulse" text="Thông tin y tế" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Nhóm máu">
                        <View style={styles.bloodGroup}>
                            {BLOOD_TYPES.map(bt => (
                                <Pressable
                                    key={bt}
                                    onPress={() => updateProfile("blood_group", bt)}
                                    style={[
                                        styles.bloodChip,
                                        p.profile.blood_group === bt && styles.bloodChipActive,
                                    ]}
                                >
                                    <Text style={[
                                        styles.bloodChipText,
                                        p.profile.blood_group === bt && styles.bloodChipTextActive,
                                    ]}>
                                        {bt}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Field>

                    <Field label="Dị ứng">
                        <View>
                            <StyledInput
                                placeholder="VD: Penicillin, hải sản..."
                                value={p.profile.allergy_history ?? ""}
                                onChangeText={(v) => updateProfile("allergy_history", v)}
                                returnKeyType="done"
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Field>

                </Card.Content>
            </Card>
        </>
    );
};

const styles = StyleSheet.create({
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
});

export default MedicalInfoCard;