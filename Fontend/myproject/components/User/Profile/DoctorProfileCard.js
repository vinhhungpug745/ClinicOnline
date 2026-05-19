import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { Card, Chip } from "react-native-paper";
import { Field, StyledInput, SectionLabel } from "./FormComponents";
import COLORS from "../../../styles/Colors";
import { ScrollView } from "react-native";

const DoctorProfileCard = ({ data }) => {
    const profile = data.profile ?? {};

    return (
        <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <SectionLabel icon="doctor" text="Thông tin chuyên môn" />
                <Text style={{ fontSize: 11, color: COLORS.textLight, fontStyle: "italic" }}>
                    * Không thể chỉnh sửa
                </Text>
            </View>

            <View pointerEvents="none">

                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>

                        <Field label="Bằng cấp">
                            <StyledInput
                                placeholder="BS, CKI, CKII, ThS, PGS.TS..."
                                value={profile.degree}
                            />
                        </Field>

                        <Field label="Số năm kinh nghiệm">
                            <StyledInput
                                placeholder="VD: 10"
                                keyboardType="numeric"
                                value={profile.experience !== null && profile.experience !== undefined
                                    ? String(profile.experience)
                                    : ""}
                            />
                        </Field>

                        <Field label="Giới thiệu bản thân">
                            <ScrollView
                                style={{ maxHeight: 120 }}
                                nestedScrollEnabled
                                showsVerticalScrollIndicator={true}
                            >
                                <Text style={styles.bioText}>{profile.bio}</Text>
                            </ScrollView>
                        </Field>

                        {profile.specialties?.length > 0 && (
                            <Field label="Chuyên khoa">
                                <View style={styles.chipRow}>
                                    {profile.specialties.map((s) => (
                                        <Chip
                                            key={s.id}
                                            style={styles.chip}
                                            textStyle={styles.chipText}
                                        >
                                            {s.name}
                                        </Chip>
                                    ))}
                                </View>
                            </Field>
                        )}

                        {profile.workday_set?.length > 0 && (
                            <Field label="Ca làm việc">
                                <FlatList
                                    data={profile.workday_set}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    contentContainerStyle={{ gap: 8 }}
                                    renderItem={({ item }) => (
                                        <Chip style={styles.chip} textStyle={styles.chipText}>
                                            {item.date}
                                        </Chip>
                                    )}
                                />
                            </Field>
                        )}

                    </Card.Content>
                </Card>
            </View>

        </View>
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
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { backgroundColor: COLORS.primary + "20" },
    chipText: { color: COLORS.primary, fontSize: 12 },
    bioText: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 20,
    }
});

export default DoctorProfileCard;