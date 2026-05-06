import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import React, { useContext, useEffect, useState } from "react";
import BookingHeader from "../../components/Appointment/Bookingheader";
import Step1Schedule from "../Appointment/Step1Schedule"
import Step2Profile from "./Step2Profile";
import Step3Confirm from "./Step3Comfir";
import COLORS from "../../styles/Colors";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { createWithAuth, fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppSnackbar from "../../components/AppSnackbar";


// {
//     "patient": {
//         "id": 22,
//         "name": "NguyenQuoc Huy",
//         "gender": "male",
//         "phone": "0999999999",
//         "email": "",
//         "profile": {
//             "blood_group": "A+",
//             "height": 170,
//             "weight": 36,
//             "allergy_history": "Dị ứng phấn hoa",
//             "insurance_number": "BHYT123456",
//             "insurance_expiry_date": "2026-09-08"
//         }
//     },
//     "doctor": {
//         "id": 21,
//         "name": "Nguyễn Văn T",
//         "email": "bsnguyenvant@gmail.com",
//         "phone": "0919111019"
//     },
//     "specialty": {
//         "id": 20,
//         "name": "Phục hồi chức năng"
//     },
//     "serviceNormal": {
//         "id": "1",
//         "name": "Khám thường"
//     },
//     "schedule": {
//         "id_schedule": 5,
//         "date": "2026-05-05",
//         "shift": "evening",
//         "slots": {
//             "id": 15,
//             "start": "19:00",
//             "end": "20:00"
//         }
//     }
// }


const Booking = () => {
    const [step, setStep] = useState(0);
    const { user } = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({});
    const [success, setSuccess] = useState(false);
    const [bookingData, setBookingData] = useState({
        shift: "morning",
        slots: [],
        patient: user
    });

    const updateBooking = (key, value) => {
        if (key === "bulk") {
            setBookingData(prev => ({ ...prev, ...value }));
        } else {
            setBookingData(prev => ({ ...prev, [key]: value }));
        }
    }

    const updatePatient = (key, value) => {
        setBookingData(prev => ({
            ...prev,
            patient: { ...prev.patient, [key]: value },
        }));
    };

    const updateProfile = (key, value) => {
        setBookingData(prev => ({
            ...prev,
            patient: {
                ...prev.patient,
                profile: { ...prev.patient.profile, [key]: value }
            }
        }));
    };

    const canGoNext = () => {
        if (step === 0) return bookingData.specialty && bookingData.doctor && bookingData.serviceNormal && bookingData.slots;
        if (step === 1) return bookingData.patient.last_name && bookingData.patient.first_name;
        if (step === 2) return true;
        return false;
    };

    const renderStep = () => {
        switch (step) {
            case 0: return <Step1Schedule data={bookingData} updateBooking={updateBooking} />;
            case 1: return <Step2Profile data={bookingData} updatePatient={updatePatient} updateProfile={updateProfile} />;
            case 2: return <Step3Confirm data={bookingData} />;
        }
    };

    const formatBooking = (data) => {
        return {
            customer: data.patient.id,
            doctor: data.doctor.id,
            time_slot: data.slots.id,
            reason: data.patient.reason,
            symptoms: data.patient.reason,
            serviceNormal: parseInt(data.serviceNormal.id),
        };
    };

    const validate = (data) => {
        const payload = formatBooking(data);
        return Object.values(payload).every(value => value !== null && value !== undefined);
    };

    const appointment = async () => {
        setLoading(true);
        try {
            if (!validate(bookingData)) {
                setSnackbar({ visible: true, message: "Vui lòng điền đầy đủ thông tin!", type: 'error' });
                return; // ← return trong finally vẫn chạy setLoading(false)
            }

            await createWithAuth(
                endpoints.appointments,
                formatBooking(bookingData),
                (data) => {
                    setSnackbar({ visible: true, message: "Đặt lịch thành công!", type: 'success' });
                    setSuccess(true);
                    setBookingData({ shift: "morning", slots: [], patient: user });
                },
                (type, msg) => {
                    setSnackbar({ visible: true, message: msg, type: 'error' });
                }
            );
        } finally {
            setLoading(false); // ← luôn chạy dù thành công, thất bại, hay validate fail
        }
    };

    useEffect(() => {
        setBookingData(prev => ({
            ...prev,
            patient: user,
        }));
    }, [user]);

    return (
        <View style={styles.screen}>
            <BookingHeader step={step} />

            <View style={{ flex: 1 }}>
                {renderStep()}
            </View>

            {step < 3 && (
                <View style={styles.footer}>
                    {step === 2 ? (
                        !success && (
                            <>
                                <Button
                                    mode="contained"
                                    disabled={!canGoNext() || loading}
                                    loading={loading}
                                    onPress={() => appointment()}
                                    style={styles.btnPrimary}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                >
                                    Xác nhận đặt lịch
                                </Button>
                            </>
                        )) : (
                        <>
                            <Button
                                mode="contained"
                                disabled={!canGoNext()}
                                onPress={() => {
                                    console.log(bookingData.slots)
                                    setStep(prev => prev + 1)
                                }}
                                style={styles.btnPrimary}
                                contentStyle={styles.btnContent}
                                labelStyle={styles.btnLabel}
                            >
                                Tiếp theo
                            </Button>
                        </>
                    )}
                    {step > 0 && (
                        <>
                            <Button
                                mode="outlined"
                                disabled={step === 0}
                                onPress={() => setStep(prev => prev - 1)}
                                style={styles.btnOutlined}
                                contentStyle={styles.btnContent}
                                labelStyle={styles.btnLabelOutlined}
                            >
                                Quay lại
                            </Button>
                        </>
                    )}

                    {user && step === 1 && (
                        <>
                            <Button
                                mode="outlined"
                                disabled={step === 0}
                                onPress={() => console.log("change profile")}
                                style={styles.btnOutlined}
                                contentStyle={styles.btnContent}
                                labelStyle={styles.btnLabelOutlined}
                            >
                                Cập nhật sơ yếu lí lịch
                            </Button>
                        </>
                    )}


                </View>
            )}

            <AppSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                sub={snackbar.sub}
                type={snackbar.type}
                onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 8,
    },
    btnPrimary: {
        borderRadius: 12,
        backgroundColor: COLORS.btnPrimary,
    },
    btnOutlined: {
        borderRadius: 12,
        borderColor: COLORS.primary,
    },
    btnContent: { height: 48 },
    btnLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    btnLabelOutlined: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default Booking;