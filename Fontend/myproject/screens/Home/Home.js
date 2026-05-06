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

const Home = ({ navigation }) => {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [snackbar,setSnackbar] = useState({})

    const onRefresh = useCallback(() => loadDoctors(true), []);

    // chua try catch
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
            (type, msg) => setSnackbar({ visible: true, message: msg, type: 'error' }),
            {page}
        )
    }

    useEffect(() => {
        if (page !== null) loadDoctors();
    }, [page]);


    return (
        <View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                        onRefresh={onRefresh}
                        renderItem={({ item }) => {
                            return (<DoctorCard item={item} navigation={navigation} />);
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

export default Home;