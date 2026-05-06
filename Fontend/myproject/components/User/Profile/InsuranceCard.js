import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import { Field, StyledInput, SectionLabel } from "./FormComponents";
import COLORS from "../../../styles/Colors";

const InsuranceCard = ({ data, updateProfile }) => {
    const p = data.patient ? data.patient : data;

    return (
        <>
            <SectionLabel icon="card-account-details-outline" text="Bảo hiểm y tế" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Số thẻ BHYT">
                        <StyledInput
                            placeholder="VD: HS4012345678901"
                            value={p.profile.insurance_number}
                            onChangeText={(v) => updateProfile("insurance_number", v)}
                            autoCapitalize="characters"
                        />
                    </Field>

                    <Field label="Ngày hết hạn thẻ">
                        <StyledInput
                            placeholder="DD/MM/YYYY"
                            value={p.profile.insurance_expiry_date}
                            onChangeText={(v) => updateProfile("insurance_expiry_date", v)}
                        />
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