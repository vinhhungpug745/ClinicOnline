import { useContext, useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppSnackbar from "../../components/AppSnackbar";
import SectionTitle from "../../components/Appointment/SectionTilte";
import InfoCard, { InfoCard2Col } from "../../components/Appointment/InfoCard";
import COLORS from "../../styles/Colors";
import { genderMap } from "../../utils/mapping";
import Mystyles from "../../styles/Mystyles";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { Button } from "react-native-paper";
import AppButton from "../../components/AppButton";

const AppointmentDetail = ({ route }) => {
    const id = route.params?.id;
    const [appointmentDetail, setAppointmentDetail] = useState(null);
    const [snackbar, setSnackbar] = useState({});
    const { user } = useContext(MyUserContext);
    const loadAppointmentDetail = async () => {
        await fetchWithAuth(
            endpoints.appointmentDetail(id),
            (data) => setAppointmentDetail(data),
            (type, msg) => setSnackbar({ visible: true, message: msg, type })
        );
    };

    useEffect(() => {
        loadAppointmentDetail();
    }, [id]);

    if (!appointmentDetail) return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    const p = appointmentDetail.customer;
    const slot = appointmentDetail.time_slot;
    const workDay = slot?.work_day;
    const doctor = appointmentDetail.doctor;

    return (
        <View style={Mystyles.container}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>

                {/* ── PHIẾU ĐẶT ── */}
                <SectionTitle icon="calendar-clock" text="Thông tin phiếu đặt" />
                <InfoCard2Col
                    rows={[
                        { icon: "pound", label: "Mã phiếu", value: `#${appointmentDetail.id}` },
                        { icon: "medical-bag", label: "Dịch vụ", value: appointmentDetail.serviceNormal?.name },
                        { icon: "calendar", label: "Ngày khám", value: workDay?.date },
                        { icon: "calendar-week", label: "Thứ", value: workDay?.day_of_week },
                        { icon: "clock-outline", label: "Giờ khám", value: `${slot?.start_time?.slice(0, 5)} - ${slot?.end_time?.slice(0, 5)}` },
                        { icon: "text-box-outline", label: "Lý do", value: appointmentDetail.reason },
                        { icon: "alert-circle-outline", label: "Triệu chứng", value: appointmentDetail.symptoms },
                        { icon: "check-circle-outline", label: "Trạng thái", value: appointmentDetail.status },
                    ]}
                />

                {/* ── BÁC SĨ ── */}
                <SectionTitle icon="account-tie" text="Thông tin bác sĩ" />
                <InfoCard
                    rows={[
                        { icon: "account-outline", label: "Họ và tên", value: `${doctor?.last_name} ${doctor?.first_name}` },
                        { icon: "phone-outline", label: "Điện thoại", value: doctor?.phone },
                        { icon: "email-outline", label: "Email", value: doctor?.email },
                        { icon: "gender-male-female", label: "Giới tính", value: genderMap[doctor?.gender] },
                    ]}
                />

                {/* ── BỆNH NHÂN ── */}
                <SectionTitle icon="account" text="Thông tin bệnh nhân" />
                <InfoCard2Col
                    rows={[
                        { icon: "account-outline", label: "Họ và tên", value: `${p?.last_name} ${p?.first_name}` },
                        { icon: "phone-outline", label: "Điện thoại", value: p?.phone },
                        { icon: "email-outline", label: "Email", value: p?.email },
                        { icon: "gender-male-female", label: "Giới tính", value: genderMap[p?.gender] },
                        { icon: "card-account-details-outline", label: "Số thẻ BHYT", value: p?.profile?.insurance_number },
                        { icon: "calendar-end", label: "Hết hạn BHYT", value: p?.profile?.insurance_expiry_date },
                        { icon: "water", label: "Nhóm máu", value: p?.profile?.blood_group },
                        { icon: "needle", label: "Tiền sử dị ứng", value: p?.profile?.allergy_history },
                        { icon: "human", label: "Chiều cao", value: p?.profile?.height ? `${p.profile.height} cm` : null },
                        { icon: "weight", label: "Cân nặng", value: p?.profile?.weight ? `${p.profile.weight} kg` : null },
                    ]}
                />

            </ScrollView>
            {user?.role === "doctor" ? (
                <>
                    <Button
                        mode="contained"
                        style={[Mystyles.primaryButton, { marginVertical: 16, marginHorizontal: 16 }]}
                        onPress={() =>
                            navigation.navigate("CreateMedicalRecord", {
                                appointmentId: appointmentDetail.id,
                            })
                        }
                    >
                        Tạo hồ sơ bệnh án
                    </Button>
                </>

            ) : (
                <>
                    <AppButton type= "delete" onPress={console.log("anh yeu em") }/>
                    <AppButton type="edit" onPress={console.log("anh yêu em")} />
                </>
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

export default AppointmentDetail;