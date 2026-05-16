import { ScrollView, View, FlatList } from 'react-native';
import { Text } from 'react-native';
import React, { use, useCallback, useEffect, useState } from 'react';
import DoctorCard from '../../components/User/Doctors/DoctorCard';
import StylesDoctorCard from '../../components/User/Doctors/StylesDoctorCard';
import { Searchbar } from 'react-native-paper';
import Apis, { endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';
import AppList from '../../components/AppList';
import { fetchPublic } from '../../utils/apiHelper';
import AppSnackbar from '../../components/AppSnackbar';
import { useSnackbar } from '../../utils/contexts/SnackBarContext';
import LoadingScreen from '../../components/LoadingScreen';
import AnimatedPressable from '../../components/Animation/AnimatedPressable';
import COLORS from '../../styles/Colors';

const Home = ({ navigation, route }) => {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);

    const loadDoctors = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        await fetchPublic(
            endpoints.doctors,
            (data, next) => {
                if (next == null) {
                    setPage(null);
                    setHasMore(false);
                }
                setDoctors(prev => [...prev, ...data]);
            },
            (type, msg) => showSnackbar(msg, 'error', 'Không thể tải danh sách bác sĩ'),
            {page}
        )
        if (isRefresh) setRefreshing(false);
        setLoading(false);
    }

    useEffect(() => {
        if (page !== null) loadDoctors();
    }, [page]);

    useEffect(() => {
        if (route.params?.successMessage) {
            showSnackbar(route.params.successMessage, 'success');
        }
    }, [route.params?.successMessage]);

    if (loading) return <LoadingScreen text="Đang tải thông tin..." />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg}}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    
                </View>
                <Text style={{ fontSize: 24, fontWeight: '600', marginVertical: 36 }}>Home Screen</Text>
                <Searchbar placeholder="Search" onChangeText={setSearchQuery} value={searchQuery} />
                <View style={{ marginVertical: 30 }}>
                    {/* Header */}
                    <View style={StylesDoctorCard.header}>
                        <View>
                            <Text style={StylesDoctorCard.sectionTitle}>BÁC SĨ TƯ VẤN</Text>
                            <Text style={StylesDoctorCard.sectionSub}>khám bệnh qua video</Text>
                        </View>
                        <Text style={StylesDoctorCard.seeAll}>Xem tất cả »</Text>
                    </View>
                    <AppList
                        data={doctors}
                        keyExtractor={(item) => item.id.toString()}
                        refreshing={refreshing}
                        onRefresh={()=>{
                            setDoctors([]);
                            loadDoctors(true);
                        }}
                        renderItem={({ item }) => {
                            return (
                                <DoctorCard item={item} navigation={navigation} />
                            );
                        }}
                        emptyIcon="doctor"
                        emptyTitle="Không có bác sĩ"
                        listContentStyle={StylesDoctorCard.listContainer}
                        flatListProps={{
                            horizontal: true,
                            onEndReached: () => {
                                hasMore ? setPage(prev => prev + 1) : setPage(null)
                            },
                            onEndReachedThreshold: 0.3,
                        }}
                    />

                </View>

            </ScrollView>
        </View>
    );
};

export default Home;