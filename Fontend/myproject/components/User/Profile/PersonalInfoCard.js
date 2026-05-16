import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Card, SegmentedButtons } from "react-native-paper";
import { Field, StyledInput, SectionLabel } from "./FormComponents";
import COLORS from "../../../styles/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInfoCard = ({ data, updatePatient, err = {} }) => {
    const p = data.patient ? data.patient : data;
    const [show, setShow] = useState(false);
    return (
        <>
            <SectionLabel icon="account-edit-outline" text="Thông tin cá nhân" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>

                    <View style={styles.row2}>
                        <Field label="Họ" required>
                            <StyledInput
                                placeholder="Nguyễn"
                                value={p.last_name}
                                onChangeText={(v) => updatePatient("last_name", v)}
                                error={!!err.last_name}
                                errorMessage={err.last_name}
                            />
                        </Field>
                        <Field label="Tên" required>
                            <StyledInput
                                placeholder="Văn A"
                                value={p.first_name}
                                onChangeText={(v) => updatePatient("first_name", v)}
                                error={!!err.first_name}
                                errorMessage={err.first_name}
                            />
                        </Field>
                    </View>

                    <Field label="Số điện thoại" required>
                        <StyledInput
                            placeholder="0xxxxxxxxx"
                            keyboardType="phone-pad"
                            value={p.phone}
                            onChangeText={(v) => updatePatient("phone", v)}
                            error={!!err.phone}
                            errorMessage={err.phone}
                        />
                    </Field>

                    <Field label="Email">
                        <StyledInput
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={p.email}
                            onChangeText={(v) => updatePatient("email", v)}
                            error={!!err.email}
                            errorMessage={err.email}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <Pressable onPress={() => setShow(true)}>
                            <StyledInput
                                placeholder="DD/MM/YYYY"
                                editable={false}
                                pointerEvents="none"
                                value={p && p.dob ? new Date(p.dob).toLocaleDateString('vi-VN') : ""}
                                error={!!err.dob}
                                errorMessage={err.dob}
                            />
                        </Pressable>

                        {show && (
                            <DateTimePicker 
                                value={data.patient && data.patient.dob ? new Date(data.patient.dob) : new Date()}
                                mode="date"
                                display="default"
                                minimumDate={new Date(1900, 0, 1)}
                                maximumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    setShow(false);
                                    if (selectedDate) updatePatient("dob", selectedDate.toISOString().split('T')[0]);
                                }}
                            />
                        )}
                    </Field>

                    <Field label="Giới tính">
                        <SegmentedButtons
                            value={p.gender}
                            onValueChange={(v) => updatePatient("gender", v)}
                            style={styles.segmented}
                            theme={{
                                colors: {
                                    secondaryContainer: COLORS.primary,
                                    onSecondaryContainer: COLORS.white,
                                    outline: COLORS.border,
                                },
                            }}
                            buttons={[
                                { value: 'male', label: '👨 Nam', style: styles.segBtn },
                                { value: 'female', label: '👩 Nữ', style: styles.segBtn },
                                { value: 'other', label: 'Khác', style: styles.segBtn },
                            ]}
                        />
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
    row2: { flexDirection: 'row', gap: 12 },
    segmented: { borderRadius: 10, backgroundColor: COLORS.bg },
    segBtn: { borderRadius: 8 },
});

export default PersonalInfoCard;