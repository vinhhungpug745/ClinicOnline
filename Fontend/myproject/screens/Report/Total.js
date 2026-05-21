import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import AppHeader from "../../components/AppHeader";
import { Card } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import ListDropDown from "../../components/Appointment/ListDropDown";
import AppButton from "../../components/AppButton";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import LoadingScreen from '../../components/LoadingScreen';


const screenWidth = Dimensions.get("window").width - 64;

const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: () => "#94a3b8",
    style: { borderRadius: 12 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1976D2" },
};

const REPORT_TYPES = [
    { id: "patient", name: "Báo cáo số lượng bệnh nhân" },
    { id: "serviceNormal", name: "Báo cáo số lượng dịch vụ y tế" },
    { id: "disease", name: "Báo cáo tình hình bệnh phổ biến" },
    { id: "totalSales", name: "Báo cáo doanh thu tổng hợp" },
];

const PATIENT_FILTERS = [
    { id: "age", name: "Theo độ tuổi" },
    { id: "gender", name: "Theo giới tính" },
    { id: "specialty", name: "Theo chuyên khoa" },
];

const CHART_TYPES = [
    { key: "line", label: "Đường" },
    { key: "bar", label: "Cột" },
    { key: "pie", label: "Tròn" },
];

// const DATA_BY_REPORT = {
//     patient: {
//         age: {
//             line: { labels: ["0-18", "19-30", "31-45", "46-60", "60+"], datasets: [{ data: [20, 45, 38, 28, 15] }] },
//             bar: { labels: ["0-18", "19-30", "31-45", "46-60", "60+"], datasets: [{ data: [20, 45, 38, 28, 15] }] },
//             pie: [
//                 { name: "0-18", population: 20, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "19-30", population: 45, color: "#2E7D32", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "31-45", population: 38, color: "#E65100", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "46-60", population: 28, color: "#C62828", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "60+", population: 15, color: "#6A1B9A", legendFontColor: "#64748b", legendFontSize: 12 },
//             ],
//         },
//         gender: {
//             line: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [60, 55, 70, 65, 72, 68] }] },
//             bar: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [60, 55, 70, 65, 72, 68] }] },
//             pie: [
//                 { name: "Nam", population: 58, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Nữ", population: 65, color: "#D4537E", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Khác", population: 5, color: "#94a3b8", legendFontColor: "#64748b", legendFontSize: 12 },
//             ],
//         },
//         specialty: {
//             line: { labels: ["Nội", "Ngoại", "Tim", "Da", "Mắt"], datasets: [{ data: [40, 30, 25, 20, 13] }] },
//             bar: { labels: ["Nội", "Ngoại", "Tim", "Da", "Mắt"], datasets: [{ data: [40, 30, 25, 20, 13] }] },
//             pie: [
//                 { name: "Nội tổng quát", population: 40, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Ngoại tổng quát", population: 30, color: "#2E7D32", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Tim mạch", population: 25, color: "#E65100", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Da liễu", population: 20, color: "#C62828", legendFontColor: "#64748b", legendFontSize: 12 },
//                 { name: "Mắt", population: 13, color: "#6A1B9A", legendFontColor: "#64748b", legendFontSize: 12 },
//             ],
//         },
//     },
//     service: {
//         line: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [30, 42, 38, 50, 45, 55] }] },
//         bar: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [30, 42, 38, 50, 45, 55] }] },
//         pie: [
//             { name: "Khám thường", population: 60, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám chuyên sâu", population: 35, color: "#2E7D32", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám định kỳ", population: 20, color: "#E65100", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám tổng quát", population: 13, color: "#C62828", legendFontColor: "#64748b", legendFontSize: 12 },
//         ],
//     },
//     disease: {
//         line: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [15, 20, 18, 25, 22, 28] }] },
//         bar: { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], datasets: [{ data: [15, 20, 18, 25, 22, 28] }] },
//         pie: [
//             { name: "Cao huyết áp", population: 30, color: "#C62828", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Tiểu đường", population: 25, color: "#E65100", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Tim mạch", population: 20, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Hô hấp", population: 15, color: "#2E7D32", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khác", population: 10, color: "#94a3b8", legendFontColor: "#64748b", legendFontSize: 12 },
//         ],
//     },
//     revenue: {
//         line: { labels: ["T12", "T1", "T2", "T3", "T4", "T5"], datasets: [{ data: [38, 32, 41, 36, 44, 45] }] },
//         bar: { labels: ["T12", "T1", "T2", "T3", "T4", "T5"], datasets: [{ data: [38, 32, 41, 36, 44, 45] }] },
//         pie: [
//             { name: "Khám thường", population: 40, color: "#1976D2", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám chuyên sâu", population: 30, color: "#2E7D32", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám định kỳ", population: 20, color: "#E65100", legendFontColor: "#64748b", legendFontSize: 12 },
//             { name: "Khám tổng quát", population: 10, color: "#C62828", legendFontColor: "#64748b", legendFontSize: 12 },
//         ],
//     },
// };

const SectionTitle = ({ text }) => (
    <Text style={styles.sectionTitle}>{text}</Text>
);

const Total = ({ navigation }) => {
    const [chartType, setChartType] = useState("line");
    const [reportType, setReportType] = useState(null);
    const [patientFilter, setPatientFilter] = useState(PATIENT_FILTERS[0]);
    const [monthRange, setMonthRange] = useState({
        start: new Date(),
        end: new Date()
    });
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [dataChart, setDataChart] = useState(null)

    const converData = (stats) => {
        const labelKey = Object.keys(stats[0])[0];
        const dataKey = Object.keys(stats[0])[1];
        const labels = stats.map(item => item[labelKey]);
        const data = stats.map(item => item[dataKey]);

        const lineBar = {
            labels: labels,
            datasets: [{ data: data }]
        };

        return {
            line: lineBar,
            bar: lineBar,
            pie: stats.map((item, index) => ({
                name: item[labelKey],
                population: item[dataKey],
                color: ["#1976D2", "#2E7D32", "#E65100", "#C62828"][index % 4],
                legendFontColor: "#64748b",
                legendFontSize: 12
            }))
        };
    };

    const loadStats = async (type, isMonthRange = false)  => {
        await fetchWithAuth(
            endpoints.stats,
            (data) => {
                console.log(converData(data))
                setDataChart(converData(data));
            },
            (type, msg) => showSnackbar(msg, 'error', 'Không thể tải danh sách bác sĩ'),
            isMonthRange ? { type: type, start: monthRange?.start.toISOString().split('T')[0], end: monthRange?.end.toISOString().split('T')[0] } : { type: type },
            setLoading
        )
    }

    const renderChart = () => {
        if (!dataChart || !dataChart.line) return (
            <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>Chọn loại báo cáo để xem biểu đồ</Text>
            </View>
        );

        switch (chartType) {
            case "line":
                return (
                    <View style={{ overflow: 'hidden', borderRadius: 8 }}>
                        <LineChart
                            data={dataChart.line}
                            width={screenWidth}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                        />
                    </View>
                );
            case "bar":
                return (
                    <View style={{ overflow: 'hidden', borderRadius: 8 }}>
                        <BarChart
                            data={dataChart.bar}
                            width={screenWidth}
                            height={200}
                            chartConfig={chartConfig}
                            showValuesOnTopOfBars
                        />
                    </View>
                );
            case "pie":
                return (
                    <PieChart
                        data={dataChart.pie}
                        width={screenWidth}
                        height={200}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="8"
                    />
                );
        }
    };

    const exportPDF = async () => {
        const html = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; }
                h1 { color: #1976D2; font-size: 20px; }
                h2 { color: #334155; font-size: 15px; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background: #1976D2; color: #fff; padding: 8px; text-align: left; font-size: 13px; }
                td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
                .stat { display: inline-block; width: 45%; margin: 8px 2%; padding: 12px; background: #f8fafc; border-radius: 8px; }
                .stat-label { font-size: 12px; color: #94a3b8; }
                .stat-value { font-size: 20px; font-weight: bold; color: #1976D2; }
            </style>
        </head>
        <body>
            <h1>Báo cáo thống kê - Tháng 5/2026</h1>
            <p style="color:#94a3b8; font-size:13px;">Xuất lúc: ${new Date().toLocaleString('vi-VN')}</p>

            <h2>Tổng quan</h2>

            ${reportType ? `
                <h2>${reportType.name}</h2>
                <table>
                    <tr>
                        <th>Nhãn</th>
                        <th>Giá trị</th>
                    </tr>
                    ${dataChart?.bar?.labels?.map((label, i) => `
                        <tr>
                            <td>${label}</td>
                            <td>${dataChart.bar.datasets[0].data[i]}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
        </body>
        </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
            });
        } catch (err) {
            console.log('Lỗi xuất PDF:', err);
        }
    };

    useEffect(() => {
        if (!reportType) return;

        if (reportType.id === 'patient') {
            loadStats(patientFilter.id);
        } else if (reportType.id === 'serviceNormal') {
            loadStats('serviceNormal');
        } else if (reportType.id === 'totalSales') {
            loadStats('totalSales');
        }
    }, [reportType, patientFilter]);



    if (loading) return <LoadingScreen text="Đang tải thông tin..." />;

    return (
        <View style={styles.screen}>
            <AppHeader titles="Báo cáo thống kê" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Dropdown chọn loại báo cáo */}
                <SectionTitle text="Loại báo cáo" />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                        <ListDropDown
                            title="Chọn loại báo cáo"
                            value={reportType}
                            icon="chart-bar"
                            data={REPORT_TYPES}
                            onSelect={(item) => {
                                setReportType(item);
                                console.log(item)
                                setPatientFilter(PATIENT_FILTERS[0]);
                            }}
                        />
                    </View>
                    {reportType?.id === "patient" && (
                        <View style={{ flex: 1 }}>
                            <ListDropDown
                                title="Phân loại"
                                value={patientFilter}
                                icon="filter"
                                data={PATIENT_FILTERS}
                                onSelect={(item) => setPatientFilter(item)}
                            />
                        </View>
                    )}

                    {reportType?.id === "totalSales" && (
                        <>
                            <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>

                                <TouchableOpacity
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10 }}
                                    onPress={() => { setShowEnd(false); setShowStart(true); }}
                                >
                                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>Tháng bắt đầu</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>
                                        {`T${monthRange?.start.getMonth() + 1}/${monthRange?.start.getFullYear()}`}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10 }}
                                    onPress={() => { setShowStart(false); setShowEnd(true); }}
                                >
                                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>Tháng kết thúc</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>
                                        {`T${monthRange?.end.getMonth() + 1}/${monthRange?.end.getFullYear()}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <AppButton
                                type="confirm"
                                label="Xác nhận"
                                onPress={() => loadStats('totalSales', true)}
                            />
                        </>
                    )}
                </View>

                {/* Biểu đồ */}
                {reportType && (
                    <>
                        <SectionTitle text="Biểu đồ thống kê" />
                        <View style={styles.filterRow}>
                            {CHART_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[styles.filterBtn, chartType === type.key && styles.filterBtnActive]}
                                    onPress={() => setChartType(type.key)}
                                >
                                    <Text style={[styles.filterLabel, chartType === type.key && styles.filterLabelActive]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Card style={styles.chartCard}>
                            <Card.Content>
                                <Text style={styles.chartTitle}>{reportType.name}</Text>
                                {renderChart()}
                            </Card.Content>
                        </Card>
                    </>
                )}

                {/* Tổng quan */}
                {dataChart && (
                    <>
                        <SectionTitle text="Tổng quan" />

                        <Card style={[styles.statCard, { width: '100%', marginBottom: 10 }]}>
                            <Card.Content style={{ alignItems: 'center' }}>
                                <Text style={styles.statLabel}>Tổng số</Text>
                                <Text style={[styles.statValue, { color: '#1976D2', fontSize: 28 }]}>
                                    {dataChart.bar.datasets[0].data.reduce((a, b) => a + b, 0)}
                                </Text>
                            </Card.Content>
                        </Card>

                        {/* Max Min - 1 hàng */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Card style={[styles.statCard, { flex: 1 }]}>
                                <Card.Content style={{ alignItems: 'center' }}>
                                    <Text style={styles.statLabel}>Cao nhất</Text>
                                    <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                                        {Math.max(...dataChart.bar.datasets[0].data)}
                                    </Text>
                                    <Text style={styles.statSub}>
                                        {dataChart.bar.labels[
                                            dataChart.bar.datasets[0].data.indexOf(
                                                Math.max(...dataChart.bar.datasets[0].data)
                                            )
                                        ]}
                                    </Text>
                                </Card.Content>
                            </Card>

                            <Card style={[styles.statCard, { flex: 1 }]}>
                                <Card.Content style={{ alignItems: 'center' }}>
                                    <Text style={styles.statLabel}>Thấp nhất</Text>
                                    <Text style={[styles.statValue, { color: '#C62828' }]}>
                                        {Math.min(...dataChart.bar.datasets[0].data)}
                                    </Text>
                                    <Text style={styles.statSub}>
                                        {dataChart.bar.labels[
                                            dataChart.bar.datasets[0].data.indexOf(
                                                Math.min(...dataChart.bar.datasets[0].data)
                                            )
                                        ]}
                                    </Text>
                                </Card.Content>
                            </Card>
                        </View>
                    </>
                )}


            </ScrollView>

            <AppButton
                type="confirm"
                label="Xuất báo cáo PDF"
                disabled={!reportType}
                onPress={() => exportPDF()}
            />

            {showStart && (
                <DateTimePicker
                    value={monthRange?.start instanceof Date ? monthRange?.start : new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        setShowStart(false);
                        if (date) setMonthRange(prev => ({ ...prev, start: new Date(date) }));
                    }}
                />
            )}

            {showEnd && (
                <DateTimePicker
                    value={monthRange?.end instanceof Date ? monthRange?.end : new Date()}
                    mode="date"
                    display="default"
                    minimumDate={monthRange?.start}
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        setShowEnd(false);
                        if (date) setMonthRange(prev => ({ ...prev, end: new Date(date) }));
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { padding: 16, paddingBottom: 32 },
    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: 0.5,
        marginBottom: 8, marginTop: 4,
    },
    statGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 10, marginBottom: 16,
    },
    statCard: {
        width: '47%', borderRadius: 12,
        backgroundColor: '#fff', elevation: 1,
    },
    statLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    statValue: { fontSize: 20, fontWeight: '700' },
    statSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
    filterRow: {
        flexDirection: 'row', gap: 8, marginBottom: 12,
    },
    filterBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 10,
        backgroundColor: '#fff', alignItems: 'center',
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    filterBtnActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
    filterLabel: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    filterLabelActive: { color: '#fff' },
    chartCard: {
        borderRadius: 12, backgroundColor: '#fff',
        elevation: 1, marginBottom: 16,
    },
    chartTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
    emptyChart: {
        height: 160, alignItems: 'center', justifyContent: 'center',
    },
    emptyText: { fontSize: 13, color: '#94a3b8' },
});

export default Total;