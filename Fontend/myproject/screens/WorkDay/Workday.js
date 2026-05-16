import { Alert, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { endpoints } from "../../configs/Apis";
import { deleteWithAuth, fetchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { useCallback, useContext, useEffect, useState } from "react";
import AppList from "../../components/AppList";
import WorkdayCard from "../../components/Schedule/WorkDayCard";
import AppHeader from "../../components/AppHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { all } from "axios";
import AppButton from "../../components/AppButton";
import CustomAlert from "../../components/AppAlert";
import { useAlert } from "../../utils/contexts/AlertContext";
import LoadingScreen from "../../components/LoadingScreen";
import COLORS from "../../styles/Colors";
import { SectionLabel } from "../Appointment/Step1Schedule";
import MyCalender from "../../components/Schedule/MyCalendar";
import { MyUserContext } from "../../utils/contexts/MyUserContext";

const Workday = () => {
    const [workdays, setWorkdays] = useState([]);
    const { showSnackbar } = useSnackbar();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const { showAlert, showAlertAuth } = useAlert();
    const { user } = useContext(MyUserContext);

    const deleteWorkday = async (id) => {
        await deleteWithAuth(
            endpoints.workdayDetail(id),
            () => {
                showSnackbar("Xóa thành công", "success");
                loadWorkdays();
            },
            (errType, errMsg) => {
                if (errType === "server") {
                    showSnackbar("Không thể xóa ngày làm việc đã có lịch hẹn!", "warning");
                } else
                    showSnackbar("Xóa thất bại vui lòng thử lại", "error");
            }, setLoading
        );
    };

    const loadWorkdays = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        }
        await fetchWithAuth(
            endpoints.workday,
            (data) => {
                setWorkdays(data);
                console.log("Workdays loaded:", data);
            },
            (errType, errMsg) => {
                showSnackbar("Lỗi vui lòng thử lại sau", "error");
            }
        );
        setRefreshing(false);
        setLoading(false);
    };

    useEffect(() => {
        if (!user) {
            showAlertAuth({ lable: "QL lịch làm việc" })
            setLoading(false)
            return
        }
        loadWorkdays();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                showAlertAuth({ lable: "QL lịch làm việc" })
                setLoading(false)
                return
            }
            loadWorkdays();
        }, [])
    );

    const markedDates = workdays.map(d => d.date).reduce((acc, date) => {
        acc[date] = {
            selected: true,
            dotColor: '#E24B4A',
        };
        return acc;
    }, {});

    if (loading) return <LoadingScreen text="Đang xử lý..." />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg, }}>
            <AppHeader titles="Lịch làm việc" onBack={() => {
                navigation.goBack();
            }} />
            <View style={{ flex: 1, paddingVertical: 16 }}>
                <Card.Content style={{ paddingVertical: 16, gap: 12 }}>
                    <SectionLabel text="Chọn ngày trong tuần" />
                    <Calendar
                        style={{ borderRadius: 20, elevation: 2, shadowColor: '#0f766e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 }}
                        onDayPress={(day) => {
                            if (workdays.map(d => d.date).includes(day.dateString))
                                navigation.navigate("User", {
                                    screen: "Schedule",
                                    params: { id: workdays.find(d => d.date === day.dateString)?.id }
                                });
                            else return;
                        }}
                        disableAllTouchEventsForDisabledDays
                        markedDates={markedDates}
                    // minDate={minDate}
                    // maxDate={maxDate}
                    />

                </Card.Content>

                <AppList
                    data={workdays}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <WorkdayCard
                            item={item}
                            selected={selectedId === item.id}
                            onLongPress={() => setSelectedId(item.id)}
                            onPress={() =>
                                console.log("Pressed workday:", item.id)
                            }
                            onDelete={(id) => {
                                console.log("Delete requested for workday id:", id);
                                showAlert({
                                    type: 'warning',
                                    title: 'Xác nhận',
                                    message: 'Bạn có chắc muốn xóa ngày làm việc này không?',
                                    actions: [
                                        {
                                            text: 'Hủy',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Xóa',
                                            onPress: () => {
                                                console.log("onPress fired, id:", id);
                                                deleteWorkday(id);
                                                setSelectedId(null);
                                            },
                                        },
                                    ],
                                })
                            }}
                        />

                    )}
                    refreshing={refreshing}
                    onRefresh={() => {
                        loadWorkdays(true);
                    }}
                    emptyIcon="calendar-blank-outline"
                    emptyTitle="Không có lịch hẹn"

                />
            </View>
            <AppButton label="Thêm ngày làm việc" mode="contained" onPress={() => {
                navigation.navigate("User", { screen: "Schedule" });
            }} />
        </View>
    );
}

export default Workday;