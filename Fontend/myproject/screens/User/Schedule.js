import { View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import {
    Button,
    SegmentedButtons,
    Text,
    Card
} from "react-native-paper";
import Mystyles from "../../styles/Mystyles";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import TimeSlot from "../../components/Schedule/TimeSlot";
import { createWithAuth, fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { Calendar } from 'react-native-calendars';
import AppButton from "../../components/AppButton";
import AppSnackbar from "../../components/AppSnackbar";

const Schedule = () => {

    const [shift, setShift] = useState('morning');
    const [selectedDay, setSelectedDay] = useState(0);

    const generateSlots = (fromHour, toHour, duration = 60, step = 15) => {
        const slots = [];
        let startMinutes = fromHour * 60;
        const limitMinutes = toHour * 60;

        const fmt = (m) => {
            const h = Math.floor(m / 60).toString().padStart(2, '0');
            const min = (m % 60).toString().padStart(2, '0');
            return `${h}:${min}:00`;
        };

        while (startMinutes + duration <= limitMinutes) {
            const endMinutes = startMinutes + duration;
            slots.push({
                start_time: fmt(startMinutes),
                end_time: fmt(endMinutes),
                label: `${fmt(startMinutes)} - ${fmt(endMinutes)}`,
            });
            startMinutes += step;
        }
        return slots;
    };

    const DAY_KEYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [loading, setLoading] = useState(false);

    const DAYS = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return {
            key: DAY_KEYS[date.getDay()],
            value: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        };
    });

    const [schedule, setSchedule] = useState({
        "date": DAYS[0].value,
        "time_slots": []
    })


    const SLOTS = {
        morning: generateSlots(6, 12),
        afternoon: generateSlots(12, 18),
        evening: generateSlots(18, 22),
    };

    const today = new Date();

    const minDate = DAYS[0].value;

    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [selectDay, setSelectDay] = useState([])
    const [snackbar, setSnackbar] = useState({});
    const loadWorkDay = async () => {
        await fetchWithAuth(
            endpoints.workday,
            (data) => {
                setSelectDay(data)
            }
        )
    }

    const markedDates = selectDay.map(d => d.date).reduce((acc, date) => {
        acc[date] = {
            marked: true,
            dotColor: '#E24B4A',
        };
        return acc;
    }, {});

    if (schedule.date) {
        markedDates[schedule.date] = {
            ...markedDates[schedule.date],
            selected: true,
            selectedColor: '#185FA5',
        };
    }


    const createWorkday = async () => {
        console.log(schedule)
        await createWithAuth(
            endpoints.workday,
            schedule,
            (data) => {
                setSnackbar({ visible: true, message: "Tạo lịch trình thành công!", type: 'success' });
                loadWorkDay()
                setSchedule({
                    date: DAYS[0].value,
                    time_slots: []
                });
            },
            (type, msg, errData) => {
                const detail = errData ? JSON.stringify(errData) : msg;
                setSnackbar({ visible: true, message: detail, type: 'error' });
            },
            setLoading
        )
    }

    useEffect(() => {
        loadWorkDay()
    }, [])

    return (
        <View>

            <ScrollView
                style={{
                    marginTop: 100, paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* TITLE */}
                <Text
                    variant="titleLarge"
                    style={{
                        marginBottom: 16,
                        fontWeight: '700',
                        color: '#0f172a'
                    }}
                >
                    Tạo lịch làm việc
                </Text>
                {/* DAYS */}

                <Card style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    backgroundColor: '#fff',
                    elevation: 2
                }}>
                    <Card.Content>

                        <Text style={{
                            marginBottom: 10,
                            fontWeight: '600',
                            color: '#0f766e'
                        }}>
                            Chọn ngày trong tuần
                        </Text>

                        <Calendar
                            onDayPress={(day) => {
                                if (selectDay.map(d => d.date).includes(day.dateString)) return;
                                setSchedule(prev => ({ ...prev, date: day.dateString }));
                            }}
                            markedDates={markedDates}
                            minDate={minDate}
                            maxDate={maxDate}
                        />

                    </Card.Content>
                </Card>



                {/* SHIFT */}
                <Card style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    backgroundColor: '#fff',
                    elevation: 2
                }}>
                    <Card.Content>

                        <Text style={{
                            marginBottom: 10,
                            fontWeight: '600',
                            color: '#0f766e'
                        }}>
                            Chọn ca làm việc
                        </Text>

                        <SegmentedButtons
                            value={shift}
                            onValueChange={(value) => {
                                setShift(value);
                            }}
                            style={{
                                marginTop: 4,
                                borderRadius: 14,
                                backgroundColor: '#f1f5f9',
                                padding: 4,
                            }}
                            theme={{
                                colors: {
                                    secondaryContainer: '#2196F3',
                                    onSecondaryContainer: '#ffffff',
                                    outline: '#e2e8f0',
                                },
                            }}
                            buttons={[
                                {
                                    value: 'morning',
                                    label: 'Sáng',
                                    style: {
                                        borderRadius: 10,
                                    },
                                },
                                {
                                    value: 'afternoon',
                                    label: 'Chiều',
                                    style: {
                                        borderRadius: 10,
                                    },
                                },
                                {
                                    value: 'evening',
                                    label: 'Tối',
                                    style: {
                                        borderRadius: 10,
                                    },
                                },
                            ]}
                        />

                    </Card.Content>
                </Card>

                {/* TIME SLOT */}
                <Card style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    backgroundColor: '#fff',
                    elevation: 2
                }}>
                    <Card.Content>

                        <TimeSlot
                            shift={shift}
                            selectedSlots={schedule.time_slots}
                            SLOTS={SLOTS}
                            onSlotsChange={(slots) => setSchedule(prev => ({ ...prev, time_slots: slots }))}
                        />

                    </Card.Content>
                </Card>

                {/* PREVIEW */}
                {schedule.time_slots.length > 0 && (
                    <Card style={{
                        marginBottom: 16,
                        borderRadius: 16,
                        backgroundColor: '#ecfeff',
                        borderWidth: 1,
                        borderColor: '#a5f3fc'
                    }}>
                        <Card.Content>

                            <Text style={{
                                marginBottom: 6,
                                fontWeight: '600',
                                color: '#155e75'
                            }}>
                                Đã chọn ({schedule.time_slots.length})
                            </Text>

                            {schedule.time_slots.map((s, i) => (
                                <Text key={i} style={{ color: '#0f172a' }}>
                                    • {s.start_time} - {s.end_time}
                                </Text>
                            ))}

                        </Card.Content>
                    </Card>
                )}

                {/* BUTTON */}
                <AppButton
                    type="save"
                    label="Lưu lịch trình"
                    loading={loading}
                    onPress={createWorkday}
                />

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

export default Schedule;