import { Text, View, ScrollView, StyleSheet, Pressable } from "react-native";
import AppHeader from "../../components/AppHeader";
import { Searchbar, ActivityIndicator } from "react-native-paper";
import React, { useState, useEffect, useCallback } from "react";
import COLORS from "../../styles/Colors";
import { SectionLabel } from "../Appointment/Step1Schedule";
import CategoryCard from "../../components/Home/CategoryCard";
import { useNavigation } from '@react-navigation/native';
import Apis, { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import DoctorCard from "../../components/User/Doctors/DoctorCard";
import { fetchPublic, fetchWithAuth } from "../../utils/apiHelper";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ doctors: [], specialties: [] });
    const [searching, setSearching] = useState(false);
    const navigation = useNavigation();
    const { showSnackbar } = useSnackbar();

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults({ doctors: [], specialties: [] });
            return;
        }

        const results = { doctors: [], specialties: [] };

        await Promise.all([
            fetchPublic(
                endpoints.doctors,
                (data) => {
                    const arr = Array.isArray(data) ? data : [];
                    const unique = [...new Map(arr.map(d => [d.id, d])).values()];
                    results.doctors = unique;
                },
                () => { },
                { q: query },
                setSearching
            ),
            fetchWithAuth(
                endpoints.specialty,
                (data) => {
                    const arr = data?.results ?? [];
                    const unique = [...new Map(arr.map(s => [s.id, s])).values()];
                    results.specialties = unique;
                },
                () => { },
                { q: query },
                setSearching
            ),
        ]);

        setSearchResults({ ...results });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const hasResults = searchResults.doctors.length > 0 || searchResults.specialties.length > 0;

    return (
        <View style={styles.container}>
            <AppHeader onBack={() => navigation.goBack()}>
                <View style={{ paddingHorizontal: 19 }}>
                    <Searchbar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Tìm bác sĩ, chuyên khoa..."
                        autoFocus
                        style={{
                            borderRadius: 16,
                            backgroundColor: COLORS.white,
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 6,
                        }}
                        inputStyle={styles.searchInput}
                        iconColor={COLORS.primary}
                    />
                </View>
            </AppHeader>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {searching ? (
                    <ActivityIndicator
                        color={COLORS.primary}
                        style={{ marginTop: 32 }}
                    />
                ) : searchQuery.trim() ? (
                    // ── Kết quả search ──
                    <View>
                        {searchResults.specialties.length > 0 && (
                            <>
                                <SectionLabel text="Chuyên khoa" />
                                <View style={styles.tagRow}>
                                    {searchResults.specialties.map(s => (
                                        <Pressable
                                            key={s.id}
                                            style={({ pressed }) => [styles.tag, pressed && { opacity: 0.7 }]}
                                            onPress={() => navigation.navigate("Booking", { specialty: s })}
                                        >
                                            <Text style={styles.tagText}>{s.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}

                        {searchResults.doctors.length > 0 && (
                            <>
                                <SectionLabel text="Bác sĩ" />
                                <View style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 12,
                                }}>
                                    {searchResults.doctors.map(d => (
                                        <View key={d.id} style={{ width: '48%' }}>
                                            <DoctorCard item={d} navigation={navigation} />
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        {!hasResults && (
                            <Text style={styles.emptyText}>
                                Không tìm thấy kết quả cho "{searchQuery}"
                            </Text>
                        )}
                    </View>
                ) : (
                    <>
                        <SectionLabel text="Dịch vụ" />
                        <CategoryCard />

                        <SectionLabel text="Tìm kiếm phổ biến" />
                        <View style={styles.tagRow}>
                            {["Tim mạch", "Nhi khoa", "Da liễu", "Nội tổng quát", "Mắt", "Tai mũi họng","Ngoại tổng quát","Chấn thương chỉnh hình","Sản phụ khoa"].map(tag => (
                                <Pressable
                                    key={tag}
                                    style={({ pressed }) => [styles.tag, pressed && { opacity: 0.7 }]}
                                    onPress={() => setSearchQuery(tag)}
                                >
                                    <Text style={styles.tagText}>{tag}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    searchbar: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        elevation: 0,
        height: 44,
    },
    searchInput: {
        fontSize: 13,
        color: COLORS.text,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 14,
        marginTop: 32,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    tag: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    tagText: {
        fontSize: 13,
        color: COLORS.primary,
    },
});

export default Search;