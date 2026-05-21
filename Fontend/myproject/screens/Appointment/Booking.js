import { View, StyleSheet, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import BookingHeader from "../../components/Appointment/Bookingheader";
import Step1Schedule from "../Appointment/Step1Schedule"
import Step2Profile from "./Step2Profile";
import Step3Confirm from "./Step3Comfir";
import COLORS from "../../styles/Colors";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { createWithAuth, fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppSnackbar from "../../components/AppSnackbar";
import BookingProvider, { useBooking } from "../../utils/contexts/BookingContext";
import { RefreshControl } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AppButton from "../../components/AppButton";
import { useAlert } from "../../utils/contexts/AlertContext";


const Booking = () => {
    const { user } = useContext(MyUserContext);

    return (
        <BookingProvider user={user}>
            <BookingContent />
        </BookingProvider>
    );
};

const BookingContent = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState(0);
    const { user } = useContext(MyUserContext);
    const [loadingForm, setLoadingForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({});
    const { showAlert, showAlertAuth ,showAlertAuth403} = useAlert();
    const { bookingData, resetAll, updateBooking } = useBooking();
    const route = useRoute();

    useEffect(() => {
        if (user) updateBooking("patient", user);
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                showAlertAuth({ lable: "Đặt lịch làm việc" })
                setLoading(false)
                return
            }
        }, [user])
    );

    const canGoNext = () => {
        if (step === 0) return bookingData.doctor && bookingData.serviceNormal && Object.keys(bookingData.slots).length > 0;
        if (step === 1) return bookingData.patient?.last_name && bookingData.patient?.first_name;
        if (step === 2) return true;
        return false;
    };

    const renderStep = () => {
        switch (step) {
            case 0: return <Step1Schedule doctor={route.params?.doctor} specialty={route.params?.specialty} />;
            case 1: return <Step2Profile />;
            case 2: return <Step3Confirm />;
        }
    };

    const formatBooking = (data) => {
        return {
            customer: data.patient.id,
            doctor: data.doctor.id,
            time_slot: data.slots.id,
            reason: data.patient.reason,
            symptoms: data.patient.symptoms,
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
                return;
            }

            await createWithAuth(
                endpoints.appointments,
                formatBooking(bookingData),
                (data) => {
                    setSnackbar({ visible: true, message: "Đặt lịch thành công!", type: 'success' });
                    resetAll();
                    updateBooking("patient", user);
                    setStep(0);
                },
                (type, msg) => {
                    setSnackbar({ visible: true, message: msg, type: 'error' });
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (

        <View style={styles.screen}>
            <View style={{ flex: 1 }}>
                <BookingHeader step={step} onBack={() => {
                    navigation.goBack();
                }} />

                <View style={{ flex: 1 }}>
                    {renderStep()}
                </View>
            </View>

            {step < 3 && (
                <View>
                    {step === 2 ?
                        (
                            <AppButton
                                type="confirm"
                                label="Xác nhận đặt lịch"
                                disabled={!canGoNext() || loading}
                                loading={loading}
                                onPress={() => appointment()}
                            />
                        ) : (
                        <AppButton
                            type="next"
                            disabled={!canGoNext()}
                            onPress={() => {
                                setStep(prev => prev + 1);
                            }}
                        />
                    )}
                    {step > 0 && (
                        <AppButton
                            type="back"
                            disabled={step === 0}
                            onPress={() => {
                                console.log(bookingData)
                                setStep(prev => prev - 1)}}
                        />
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