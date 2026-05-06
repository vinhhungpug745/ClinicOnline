import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Card, SegmentedButtons } from "react-native-paper";
import React, { useEffect, useState } from "react";
import ListDropDown from "../../components/Appointment/ListDropDown";
import TimeSlot from "../../components/Schedule/TimeSlot";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import COLORS from "../../styles/Colors";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPublic, fetchWithAuth } from "../../utils/apiHelper";
import AppSnackbar from "../../components/AppSnackbar";
import { formatDoctors, formatSlots } from "../../utils/format";

const SERVICES = [
    { id: "1", name: "Khám thường", description: "Khám lâm sàng và tư vấn điều trị" },
    { id: "2", name: "Khám chuyên sâu", description: "Khám kỹ lưỡng với các xét nghiệm cần thiết" },
    { id: "3", name: "Khám định kỳ", description: "Gói khám định kỳ cho người cao tuổi" },
    { id: "4", name: "Khám sức khỏe tổng quát", description: "Gói khám tổng quát cho mọi lứa tuổi" },
];

// [
//     {
//         "date": "2026-04-28",
//         "day_of_week": "Tuesday",
//         "id": 1,
//         "time_slots": [
//             [Object],
//             [Object],
//             [Object]
//         ]
//     },
//     {
//         "date": "2026-04-29",
//         "day_of_week": "Wednesday",
//         "id": 3,
//         "time_slots": [
//             [Object],
//             [Object],
//             [Object]
//         ]
//     }
// ]

// [
//     {
//         "date": "2026-04-28", 
//         "day_of_week": "Tuesday", 
//         "id": 1, 
//         "slots": {
//             "afternoon": [Array], 
//             "evening": [Array], 
//             "morning": [Array]}
//         }, 
//     {
//         "date": "2026-04-29", 
//         "day_of_week": "Wednesday", 
//         "id": 3, 
//         "slots": {
//             "afternoon": [Array], 
//             "evening": [Array], 
//             "morning": [Array]
//         }
//     }
// ]

const SectionLabel = ({ text }) => (
    <View style={styles.sectionLabelRow}>
        <View style={styles.sectionLabelDot} />
        <Text style={styles.sectionLabel}>{text}</Text>
    </View>
);

[
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428624/smiling-young-pretty-caucasian-girl-doctor-uniform-with-stethoscope-looking-side_141793-124530_t2fztp", "email": "bsnguyenvanr@gmail.com", "first_name": "R", "gender": "other", "id": 19, "last_name": "Nguyễn Văn", "phone": "0917111017" },
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428597/smiling-young-female-doctor-wearing-medical-robe-stethoscope-with-glasses-isolated_141793-68741_xsg6ev", "email": "bsnguyenvans@gmail.com", "first_name": "S", "gender": "male", "id": 20, "last_name": "Nguyễn Văn", "phone": "0918111018" },
    { "avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428575/male-doctor-with-face-mask-portrait_53876-105124_exqkyo", "email": "bsnguyenvant@gmail.com", "first_name": "T", "gender": "female", "id": 21, "last_name": "Nguyễn Văn", "phone": "0919111019" }]

const Step1Schedule = ({ data, updateBooking }) => {
    const [specialies, setSpecialies] = useState([]);
    const [DOCTORS, setDOCTORS] = useState([]);
    const [workDay, setWorkDay] = useState([])
    const [snackbar, setSnackbar] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);



    const loadSpecialty = async () => {
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
            { page }
        );
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
                setDOCTORS(formatDoctors(data))
            },
            (type, msg) => setSnackbar({ visible: true, message: msg, type: 'error' }),
        )
    };

    useEffect(() => {
        if (page == null) return;
        loadSpecialty();
    }, [page]);

console.log("data.slots:", data.slots);
console.log("data.shift:", data.shift);
console.log("data.id_schedule:", data.id_schedule);
console.log("workDay found:", workDay.find(d => d.id === data.id_schedule));

    return (
        <View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SectionLabel text="Chọn chuyên khoa" />
                <ListDropDown
                    title="Chọn chuyên khoa"
                    value={data.specialty}
                    icon="stethoscope"
                    data={specialies}
                    onSelect={(item) => {
                        updateBooking(
                            "bulk", {
                            specialty: item,
                            doctor: null
                        }
                        )
                        loadDoctorsBySpecialty(item.id);
                    }}
                    setPage={hasMore ? setPage : null}
                />

                <SectionLabel text="Chọn bác sĩ" />
                <ListDropDown
                    title="Chọn bác sĩ"
                    value={data.doctor}
                    icon="account-tie"
                    data={DOCTORS}
                    onSelect={(item) => {
                        updateBooking("doctor", item)
                        LoadWorkDayDoctor(item.id)
                    }}
                />

                <SectionLabel text="Chọn dịch vụ" />
                <ListDropDown
                    title="Chọn dịch vụ"
                    value={data.serviceNormal}
                    icon="medical-bag"
                    data={SERVICES}
                    onSelect={(item) => updateBooking("serviceNormal", item)}
                />

                {data.doctor && (
                    <>
                        <SectionLabel text="Chọn ngày trong tuần" />
                        <Card style={styles.card}>
                            <Card.Content>
                                <DaychipGroup
                                    selected={data.day}
                                    onToggle={(day) => {
                                        updateBooking("bulk", {
                                            day: day,
                                            shift: "morning",
                                            id_schedule: workDay[day]?.id,
                                            date: workDay[day]?.date,
                                            slots: [],
                                        });
                                    }}
                                    DAYS={(workDay.map(day => day.day_of_week))}
                                    WORKDAYS={workDay.map(d => d.date)}
                                />
                            </Card.Content>
                        </Card>

                        <SectionLabel text="Chọn ca làm việc" />
                        <Card style={styles.card}>
                            <Card.Content>
                                <SegmentedButtons
                                    value={data.shift}
                                    onValueChange={(value) => {
                                        updateBooking("shift", value);
                                        updateBooking("slots", []);
                                    }}
                                    style={styles.segmented}
                                    theme={{
                                        colors: {
                                            secondaryContainer: COLORS.primary,
                                            onSecondaryContainer: '#ffffff',
                                            outline: '#e2e8f0',
                                        },
                                    }}
                                    buttons={[
                                        { value: 'morning', label: '🌤 Sáng', style: styles.segBtn },
                                        { value: 'afternoon', label: '☀️ Chiều', style: styles.segBtn },
                                        { value: 'evening', label: '🌙 Tối', style: styles.segBtn },
                                    ]}
                                />
                            </Card.Content>
                        </Card>

                        <SectionLabel text="Chọn giờ làm việc" />
                        <Card style={[styles.card, { marginBottom: 8 }]}>
                            <Card.Content>
                                <TimeSlot
                                    shift={data.shift}
                                    selectedSlots={data.slots}
                                    onSlotsChange={(slots) => updateBooking("slots", slots)}
                                    SLOTS={workDay.find(d => d.id === data.id_schedule)?.slots ?? { morning: [], afternoon: [], evening: [] }}
                                    multiple={false}
                                />
                            </Card.Content>
                        </Card>
                    </>
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