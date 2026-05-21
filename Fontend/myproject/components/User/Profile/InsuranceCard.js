import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import { Field, StyledInput, SectionLabel } from "./FormComponents";
import COLORS from "../../../styles/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';


const InsuranceCard = ({ data, updateProfile, err = {} }) => {
    const p = data.patient ? data.patient : data;
    const [show, setShow] = useState(false);
    return (
        <>
            <SectionLabel icon="card-account-details-outline" text="Bảo hiểm y tế" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Số thẻ BHYT">
                        <StyledInput
                            placeholder="VD: HS4012345678901"
                            value={p.profile?.insurance_number}
                            onChangeText={(v) => updateProfile("insurance_number", v)}
                            autoCapitalize="characters"
                            error={!!err.insurance_number}
                            errorMessage={err.insurance_number}
                        />
                    </Field>

                    <Field label="Ngày hết hạn thẻ">
                        <Pressable onPress={() => setShow(true)}>
                            <StyledInput
                                placeholder="DD/MM/YYYY"
                                editable={false}
                                pointerEvents="none"
                                value={p && p.profile?.insurance_expiry_date ? new Date(p.profile?.insurance_expiry_date).toLocaleDateString('vi-VN') : ""}
                                error={!!err.insurance_expiry_date}
                                errorMessage={err.insurance_expiry_date}
                            />
                        </Pressable>

                        {show && (
                            <DateTimePicker 
                                value={data.patient && data.patient.dob ? new Date(data.patient.dob) : new Date()}
                                mode="date"
                                display="default"
                                minimumDate={new Date()}
                                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))}
                                onChange={(event, selectedDate) => {
                                    setShow(false);
                                    if (selectedDate) updateProfile("insurance_expiry_date", selectedDate.toISOString().split('T')[0]);
                                }}
                            />
                        )}
                    </Field>

                    <View style={styles.infoBadge}>
                        <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.infoBadgeText}>
                            Thẻ BHYT giúp giảm chi phí khám chữa bệnh theo quy định nhà nước
                        </Text>
                    </View>

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
});

export default InsuranceCard;