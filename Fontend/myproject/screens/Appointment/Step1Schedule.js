import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { ActivityIndicator, Card, SegmentedButtons } from "react-native-paper";
import React, { useContext, useEffect, useState } from "react";
import ListDropDown from "../../components/Appointment/ListDropDown";
import TimeSlot from "../../components/Schedule/TimeSlot";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import COLORS from "../../styles/Colors";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPublic, fetchWithAuth } from "../../utils/apiHelper";
import AppSnackbar from "../../components/AppSnackbar";
import { formatDoctors, formatSlots } from "../../utils/format";
import { useBooking } from "../../utils/contexts/BookingContext";
import LoadingScreen from "../../components/LoadingScreen";
import TimeShift from "../../components/Schedule/TimeShift";
import { Calendar } from "react-native-calendars";
import MyCalender from "../../components/Schedule/MyCalendar";
import { MyUserContext } from "../../utils/contexts/MyUserContext";

const SERVICES = [
    { id: "1", name: "Khám thường", description: "Khám lâm sàng và tư vấn điều trị" },
    { id: "2", name: "Khám chuyên sâu", description: "Khám kỹ lưỡng với các xét nghiệm cần thiết" },
    { id: "3", name: "Khám định kỳ", description: "Gói khám định kỳ cho người cao tuổi" },
    { id: "4", name: "Khám sức khỏe tổng quát", description: "Gói khám tổng quát cho mọi lứa tuổi" },
];


export const SectionLabel = ({ text }) => (
    <View style={styles.sectionLabelRow}>
        <View style={styles.sectionLabelDot} />
        <Text style={styles.sectionLabel}>{text}</Text>
    </View>
);

[
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428624/smiling-young-pretty-caucasian-girl-doctor-uniform-with-stethoscope-looking-side_141793-124530_t2fztp", "email": "bsnguyenvanr@gmail.com", "first_name": "R", "gender": "other", "id": 19, "last_name": "Nguyễn Văn", "phone": "0917111017" },
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428597/smiling-young-female-doctor-wearing-medical-robe-stethoscope-with-glasses-isolated_141793-68741_xsg6ev", "email": "bsnguyenvans@gmail.com", "first_name": "S", "gender": "male", "id": 20, "last_name": "Nguyễn Văn", "phone": "0918111018" },
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428575/male-doctor-with-face-mask-portrait_53876-105124_exqkyo", "email": "bsnguyenvant@gmail.com", "first_name": "T", "gender": "female", "id": 21, "last_name": "Nguyễn Văn", "phone": "0919111019" }]

const Step1Schedule = ({ doctor, specialty }) => {
    const [specialies, setSpecialies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [workDay, setWorkDay] = useState([])
    const [snackbar, setSnackbar] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { updateBooking, updateBulk, bookingData, resetAll } = useBooking();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(MyUserContext);
    const loadSpecialty = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        await fetchWithAuth(
            endpoints.specialty,
            (data) => {
                if (data.next == null) {
                    setPage(null);
                    setHasMore(false);
                }
                setSpecialies(prev => [...prev, ...data.results]);
            },
            (type, msg) => setSnackbar({ visible: true, message: msg, type: 'error' }),
            { page },
        );
        if (isRefresh) setRefreshing(false);
        setLoading(false);
    };

    const LoadWorkDayDoctor = async (id) => {
        await fetchWithAuth(
            endpoints.doctorWorkDay(id),
            (data) => {
                setWorkDay(formatSlots(data))
            },
            (type, msg) => setSnackbar({ visible: true, message: msg, type: 'error' }),
        )
    };

    const loadDoctorsBySpecialty = async (specialtyId) => {
        await fetchWithAuth(
            endpoints.doctorspecialty(specialtyId),
            (data) => {
                console.log(data)
                setDoctors(formatDoctors(data))
            },
            (type, msg) => setSnackbar({ visible: true, message: msg, type: 'error' }),
        )
    };

    useEffect(() => {
        if (user) {
            if (page == null) return;
            if (doctor && specialty) {
                updateBulk({
                    doctor: formatDoctors([doctor])[0],
                    specialty: specialty
                });
                LoadWorkDayDoctor(doctor?.id);
            } else loadSpecialty();
        }
    }, [page, doctor, specialty]);

    useEffect(() => {
        if(user){
            if (!doctor && specialty)
                if (bookingData.specialty) LoadWorkDayDoctor(bookingData.doctor?.id);
        }
    }, [doctor, specialty]);

    if (loading) return <LoadingScreen text="Đang tải thông tin bác sĩ và lịch làm việc..." />;

    const specialiesWithSelected = bookingData.specialty
        ? [bookingData.specialty, ...specialies.filter(s => s.id !== bookingData.specialty.id)]
        : specialies;

    const doctorsWithSelected = bookingData.doctor
        ? [bookingData.doctor, ...doctors.filter(d => d.id !== bookingData.doctor.id)]
        : doctors;

    console.log(bookingData);

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            loadSpecialty(true);
                            resetAll();
                        }}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <SectionLabel text="Chọn chuyên khoa" />
                <ListDropDown
                    title="Chọn chuyên khoa"
                    value={bookingData.specialty}
                    icon="stethoscope"
                    data={specialiesWithSelected}
                    onSelect={(item) => {
                        updateBulk({ specialty: item, doctor: null })
                        loadDoctorsBySpecialty(item.id);
                    }}
                    setPage={hasMore ? setPage : null}
                />

                <SectionLabel text="Chọn bác sĩ" />
                <ListDropDown
                    title="Chọn bác sĩ"
                    value={bookingData.doctor}
                    icon="account-tie"
                    data={doctorsWithSelected}
                    onSelect={(item) => {
                        updateBooking("doctor", item);
                        LoadWorkDayDoctor(item.id);
                    }}
                />

                <SectionLabel text="Chọn dịch vụ" />
                <ListDropDown
                    title="Chọn dịch vụ"
                    value={bookingData.serviceNormal}
                    icon="medical-bag"
                    data={SERVICES}
                    onSelect={(item) => updateBooking("serviceNormal", item)}
                />

                {bookingData.doctor && (
                    workDay.length > 0 ? (
                        <>
                            <SectionLabel text="Chọn ngày trong tuần" />
                            <MyCalender
                                workDays={workDay}
                                selectedDay={bookingData.date}
                                onSelectDay={(wd) => {
                                    updateBulk({
                                        day: wd.day_of_week,
                                        shift: "morning",
                                        id_schedule: wd?.id,
                                        date: wd.date,
                                        slots: []
                                    });
                                }} />
                            <SectionLabel text="Chọn ca làm việc" />
                            <TimeShift shift={bookingData.shift} updateBulk={updateBulk} />



                            <SectionLabel text="Chọn giờ làm việc" />
                            <Card style={[styles.card, { marginBottom: 8 }]}>
                                <Card.Content>
                                    <TimeSlot
                                        shift={bookingData.shift}
                                        selectedSlots={bookingData.slots}
                                        onSlotsChange={(slots) => updateBooking("slots", slots)}
                                        SLOTS={workDay.find(d => d.id === bookingData.id_schedule)?.slots ?? { morning: [], afternoon: [], evening: [] }}
                                        multiple={false}
                                    />
                                </Card.Content>
                            </Card>
                        </>
                    ) : (
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingVertical: 36,
                        }}>
                            <Text style={{
                                textAlign: "center",
                                color: "#888",
                                fontSize: 15,
                                lineHeight: 22
                            }}>
                                Bác sĩ hiện tại chưa có lịch khám, vui lòng quay lại sau hoặc chọn bác sĩ khác cùng khoa!
                            </Text>
                        </View>
                    )
                )}

            </ScrollView>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
    },

    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
        gap: 8,
    },

    sectionLabelDot: {
        width: 4,
        height: 16,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.2,
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

    segmented: {
        borderRadius: 12,
        backgroundColor: COLORS.bg,
    },

    segBtn: {
        borderRadius: 10,
    },
});

export default Step1Schedule;