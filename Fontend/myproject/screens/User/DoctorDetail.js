import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from 'react';
import {
    Button, Card, Chip, Icon, List,
} from 'react-native-paper';
import Apis, { endpoints } from "../../configs/Apis";
import ProfileHeader from "../../components/User/Profile/ProfileHeader";
import SectionCard from "../../components/User/Profile/SectionCard";
import ProfileInfoRow from "../../components/User/Profile/ProfileInforow";
import { useNavigation } from '@react-navigation/native';
import specialtyIcons from "../../styles/LogoSpecialty";
import COLORS from "../../styles/Colors";
import AppHeader from "../../components/AppHeader";
import { fetchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import LoadingScreen from "../../components/LoadingScreen";
import AppButton from "../../components/AppButton";

const degreeConfig = {
    "BS": { label: "Bác sĩ", icon: "stethoscope" },
    "CKI": { label: "Bác sĩ chuyên khoa I", icon: "certificate-outline" },
    "CKII": { label: "Bác sĩ chuyên khoa II", icon: "certificate" },
    "ThS": { label: "Thạc sĩ", icon: "school-outline" },
    "PGS.TS": { label: "Phó giáo sư - Tiến sĩ", icon: "school" },
};

const DoctorDetail = ({ route }) => {
    const navigation = useNavigation();
    const { doctorId } = route.params;
    const [detailDoctor, setDetailDoctor] = useState({});
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    const loadDetailDoctor = async (id) => {
        await fetchWithAuth(
            endpoints.doctorDetail(id),
            (data) => {
                setDetailDoctor(data);
                console.log(data)
            },
            (errType, errMsg) => {
                showSnackbar("Lỗi khi tải thông tin bác sĩ", "error");
            }, {}, setLoading
        );
    };

    useEffect(() => {
        loadDetailDoctor(doctorId);
    }, [doctorId]);

    if (loading) return <LoadingScreen text="Đang tải thông tin..." />;


    const profile = detailDoctor?.profile ?? {};

    return (
        <View style={styles.screen}>
            <AppHeader titles="Chi tiết bác sĩ" onBack={() => {
                navigation.goBack();
            }} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <ProfileHeader user={detailDoctor} />

                {/* ── Kinh nghiệm & Trình độ ── */}
                <View style={styles.rowCards}>
                    <SectionCard title="Kinh nghiệm" containerColor={COLORS.primaryLight}>
                        <View style={styles.expRow}>
                            <Text style={styles.expNumber}>
                                {profile?.experience ?? '—'}
                            </Text>
                            <Text style={styles.expUnit}>năm</Text>
                        </View>
                    </SectionCard>

                    <SectionCard title="Trình độ" icon="school" containerColor={COLORS.secondaryLight}>
                        <View style={styles.degreeRow}>
                            <Icon
                                source={degreeConfig[profile?.degree]?.icon ?? "certificate-outline"}
                                size={20}
                                color={COLORS.info}
                            />
                            <Text style={styles.degreeText}>
                                {degreeConfig[profile?.degree]?.label ?? profile?.degree ?? "Đang cập nhật"}
                            </Text>
                        </View>
                    </SectionCard>
                </View>

                {/* ── Giới thiệu ── */}
                <Card style={styles.card}>
                    <Card.Title
                        title="Giới thiệu"
                        titleStyle={styles.cardTitle}
                        left={(props) => (
                            <List.Icon {...props} icon="account-circle-outline" color={COLORS.primary} />
                        )}
                    />
                    <Card.Content>
                        <Text style={styles.bioText}>
                            {profile?.bio ?? 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
                        </Text>
                    </Card.Content>
                </Card>

                {/* ── Chuyên khoa ── */}
                <ProfileInfoRow
                    title="Chuyên khoa"
                    icon="stethoscope"
                    items={profile?.specialties?.map((spec, index) => ({
                        key: spec.id,
                        title: spec.name,
                        icon: specialtyIcons[spec.id] ?? "medical-bag",
                        right: () => (
                            <Chip
                                compact
                                mode="flat"
                                style={{
                                    alignSelf: 'center',
                                    backgroundColor: index === 0
                                        ? COLORS.primaryLight
                                        : COLORS.divider,
                                }}
                                textStyle={{
                                    color: index === 0 ? COLORS.primary : COLORS.textMuted,
                                    fontWeight: index === 0 ? '700' : '400',
                                }}
                            >
                                {index === 0 ? 'Chính' : 'Phụ'}
                            </Chip>
                        )
                    })) ?? []}
                />

                {/* ── Thông tin liên hệ ── */}
                <ProfileInfoRow
                    title="Thông tin liên hệ"
                    icon="card-account-details-outline"
                    items={[
                        {
                            key: 'email',
                            title: detailDoctor?.email ?? 'Chưa cập nhật',
                            description: 'Email',
                            icon: 'email-outline',
                        },
                        {
                            key: 'phone',
                            title: detailDoctor?.phone ?? 'Chưa cập nhật',
                            description: 'Điện thoại',
                            icon: 'phone-outline',
                        }
                    ]}
                />
                <ProfileInfoRow
                    title="Giá khám bệnh"
                    icon="cash"
                    items={[
                        {
                            key: 'price',
                            title: detailDoctor?.profile?.price
                                ? new Intl.NumberFormat('vi-VN').format(detailDoctor.profile.price) + ' VND'
                                : 'Chưa cập nhật',
                            description: 'Phí mỗi lần khám',
                            icon: 'cash',
                        }
                    ]}
                />
            </ScrollView>

            <AppButton
                label="Đặt lịch khám"
                icon="calendar-plus"
                onPress={() => {
                    navigation.navigate("BookingTab", {
                        screen: "Booking",
                        params: {
                            doctor: {
                                id: detailDoctor.id,
                                
                                first_name: detailDoctor.first_name,
                                last_name: detailDoctor.last_name,
                                email: detailDoctor.email,
                                phone: detailDoctor.phone,
                            },
                            specialty: profile.specialties[0]
                        }
                    });
                }}
                style={styles.bookingBtn}
                labelStyle={styles.bookingBtnLabel}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
        gap: 14,
    },

    // ── Row cards ──
    rowCards: {
        flexDirection: 'row',
        gap: 12,
    },

    // ── Kinh nghiệm ──
    expRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        marginTop: 4,
    },
    expNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
        lineHeight: 36,
    },
    expUnit: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 4,
    },

    // ── Trình độ ──
    degreeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        flexWrap: 'wrap',
    },
    degreeText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.info,
        flexShrink: 1,
    },

    // ── Card giới thiệu ──
    card: {
        borderRadius: 16,
        backgroundColor: COLORS.bgCard,
        elevation: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    bioText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.textSecondary,
    },

    // ── Booking bar ──
    bookingBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    bookingBtn: {
        borderRadius: 14,
    },
    bookingBtnContent: {
        paddingVertical: 6,
    },
    bookingBtnLabel: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default DoctorDetail;