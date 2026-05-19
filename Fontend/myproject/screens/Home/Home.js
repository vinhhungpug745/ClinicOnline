import { ScrollView, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native';
import React, { use, useCallback, useContext, useEffect, useState } from 'react';
import DoctorCard from '../../components/User/Doctors/DoctorCard';
import StylesDoctorCard from '../../components/User/Doctors/StylesDoctorCard';
import { Avatar, Searchbar, Surface } from 'react-native-paper';
import Apis, { endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';
import AppList from '../../components/AppList';
import { fetchPublic } from '../../utils/apiHelper';
import AppSnackbar from '../../components/AppSnackbar';
import { useSnackbar } from '../../utils/contexts/SnackBarContext';
import LoadingScreen from '../../components/LoadingScreen';
import AnimatedPressable from '../../components/Animation/AnimatedPressable';
import COLORS from '../../styles/Colors';
import CategoryCard from '../../components/Home/CategoryCard';
import { MyUserContext } from '../../utils/contexts/MyUserContext';
import { SectionLabel } from '../Appointment/Step1Schedule';

const Home = ({ navigation, route }) => {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const { user } = useContext(MyUserContext);

    const loadDoctors = async (isRefresh = false, forcePage = null) => {
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
            { page: forcePage ?? page }
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
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            >
                <View style={{
                    flex: 1, flexDirection: "row", marginTop: 59,
                    marginBottom: 20, alignItems: "center"
                }}>
                    <Surface style={{
                        borderRadius: 999,
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        marginRight: 10
                    }} elevation={2}>
                        {user?.avatar
                            && (
                                <Avatar.Image
                                    size={56}
                                    source={{ uri: user.avatar }}
                                />
                            )
                        }

                    </Surface>
                    {user ? (
                        <Text style={{
                            fontSize: 22,
                            fontWeight: '700',
                            color: COLORS.text,

                        }}>
                            Xin chào, {user.last_name} {user.first_name} 👋
                        </Text>
                    ):(
                        <Text style={{
                            fontSize: 22,
                            fontWeight: '700',
                            color: COLORS.text,

                        }}>
                            Xin chào, Vui lòng đăng nhặp để tặng hưởng dịch vụ 👋
                        </Text>
                    )}

                </View>

                <Pressable
                    onPress={() => navigation.navigate("Search")}
                    style={({ pressed }) => ({
                        marginVertical: 16,
                        borderRadius: 16,
                        opacity: pressed ? 0.8 : 1,
                    })}
                >
                    <Searchbar
                        value=""
                        placeholder="Tìm bác sĩ, chuyên khoa, dịch vụ..."
                        editable={false}
                        pointerEvents="none"
                        style={{
                            borderRadius: 16,
                            backgroundColor: COLORS.white,
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 6,
                        }}
                        inputStyle={{
                            fontSize: 13,
                            color: COLORS.textLight,
                        }}
                        iconColor={COLORS.primary}
                    />
                </Pressable>

                <SectionLabel text="Dịch vụ" />
                <CategoryCard />

                {/* Danh sách bác sĩ */}
                <View style={{ marginTop: 12 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}>
                        <SectionLabel text="Danh sách bác sĩ" />
                        <Text style={{ fontSize: 13, color: COLORS.primary }}>Xem tất cả »</Text>
                    </View>

                    <AppList
                        data={doctors}
                        keyExtractor={(item) => item.id.toString()}
                        refreshing={refreshing}
                        onRefresh={() => {
                            setDoctors([]);
                            loadDoctors(true, 1);
                        }}
                        renderItem={({ item }) => (
                            <DoctorCard item={item} navigation={navigation} />
                        )}
                        emptyIcon="doctor"
                        emptyTitle="Không có bác sĩ"
                        listContentStyle={StylesDoctorCard.listContainer}
                        flatListProps={{
                            horizontal: true,
                            onEndReached: () => hasMore ? setPage(prev => prev + 1) : setPage(null),
                            onEndReachedThreshold: 0.3,
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Home;