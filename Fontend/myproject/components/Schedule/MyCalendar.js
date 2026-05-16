import { View, TouchableOpacity, FlatList } from "react-native";
import { Card, Text } from "react-native-paper";
import { useState } from "react";
import { Calendar } from "react-native-calendars";
import COLORS from "../../styles/Colors";

const MyCalender = ({ workDays = [], onSelectDay, selectedDay}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    console.log(selectedDay)
    const previewDays = workDays.slice(0, 3);

    const dayLabel = (dateStr) => {
        const date = new Date(dateStr);
        const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        return { label: `(${d}/${m})`, day: days[date.getDay()] };
    };

    const isSelected = (dateStr) => selectedDay === dateStr;
    // chỉnh lại ko cho xóa lịch hẹn đã có trong appoitnment
    return (
        <Card style={{ borderRadius: 16, backgroundColor: "#fff", elevation: 2, marginBottom: 16 }}>
            <Card.Content>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    {previewDays.map((wd) => {
                        const { label, day } = dayLabel(wd.date);
                        const selected = isSelected(wd.date);
                        return (
                            <TouchableOpacity
                                key={wd.date}
                                onPress={() => {
                                    setShowCalendar(false);
                                    onSelectDay?.(wd);
                                }}
                                style={{
                                    flex: 1,
                                    borderWidth: 1.5,
                                    borderColor: isSelected(wd.date) ? "#3b82f6" : "#e0e0e0",
                                    borderRadius: 12,
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    alignItems: "center",
                                    backgroundColor: isSelected(wd.date) ? "#EAF2FF" : '#f8fafc',
                                }}
                            >
                                <Text style={{ color: selected ? COLORS.primary : "#333", fontWeight: "600", fontSize: 13 }}>
                                    {label}
                                </Text>
                                <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        onPress={() => setShowCalendar(!showCalendar)}
                        style={{
                            flex: 1,
                            borderWidth: 1.5,
                            borderColor: (showCalendar || (selectedDay && !previewDays.some(wd => wd.date === selectedDay))) ? "#3b82f6" : "#e0e0e0",
                            borderRadius: 12,
                            paddingVertical: 10,
                            paddingHorizontal: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: (showCalendar || (selectedDay && !previewDays.some(wd => wd.date === selectedDay))) ? "#EAF2FF" : '#f8fafc',
                        }}
                    >
                        {selectedDay && !previewDays.some(wd => wd.date === selectedDay) ? (
                            <>
                                <Text style={{ color: "#1d4ed8", fontWeight: "600", fontSize: 13 }}>
                                    {dayLabel(selectedDay).label}
                                </Text>
                                <Text style={{ color: "#1d4ed8", fontSize: 12, marginTop: 2 }}>
                                    {dayLabel(selectedDay).day}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={{ fontSize: 20 }}>📅</Text>
                                <Text style={{ color: "#333", fontWeight: "600", fontSize: 8, marginTop: 2 }}>
                                    Ngày khác
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {showCalendar && (
                    <Calendar
                        style={{
                            color: showCalendar ? "#1d4ed8" : "#333",
                            fontWeight: "600",
                            fontSize: 13,
                            marginTop: 2
                        }}
                        onDayPress={(day) => {
                            const match = workDays.find(w => w.date === day.dateString);
                            if (match) {
                                onSelectDay?.(match);
                                setShowCalendar(false);
                            }
                        }}
                        markedDates={workDays.reduce((acc, w) => {
                            acc[w.date] = {
                                marked: true,
                                dotColor: COLORS.primary,
                                selected: isSelected(w.date),
                                selectedColor: COLORS.primary,
                            };
                            return acc;
                        }, {})}
                    />
                )}
            </Card.Content>
        </Card>
    );
};

export default MyCalender;