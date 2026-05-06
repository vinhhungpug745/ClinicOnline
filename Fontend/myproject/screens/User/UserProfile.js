import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import {
    Avatar,
    Button,
    Divider,
    List,
    Text,
    useTheme,
    Surface,
} from 'react-native-paper';
import { MyUserContext } from '../../utils/contexts/MyUserContext';
import COLORS from '../../styles/Colors';
import AppButton from '../../components/AppButton';
import { createPublic } from '../../utils/apiHelper';
import { endpoints } from '../../configs/Apis';
import AppSnackbar from '../../components/AppSnackbar';
import * as SecureStore from 'expo-secure-store';
import { CLIENT_ID_APP, CLIENT_SECRET_APP } from "@env"
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_SECTIONS = [
    {
        title: 'Điều khoản & quy định',
        items: [
            { id: 'terms', icon: 'shield-check-outline', label: 'Quy định sử dụng', iconBg: '#E1F5EE', iconColor: '#0F6E56' },
            { id: 'privacy', icon: 'lock-outline', label: 'Chính sách bảo mật', iconBg: '#EDE7F6', iconColor: '#6200EA' },
            { id: 'service', icon: 'file-document-outline', label: 'Điều khoản dịch vụ', iconBg: '#FFEBEE', iconColor: '#C62828' },
        ],
    },
    {
        title: 'Tiện ích',
        items: [
            { id: 'health', icon: 'heart-pulse', label: 'Xem/Lưu thông tin sức khoẻ', iconBg: '#E3F2FD', iconColor: '#1565C0' },
            { id: 'hotline', icon: 'phone-outline', label: 'Hỗ trợ tư vấn/đặt khám 19002115', iconBg: '#E0F7FA', iconColor: '#00695C' },
        ],
    },
    {
        title: 'Khác',
        items: [
            { id: 'rate', icon: 'star-outline', label: 'Đánh giá ứng dụng', iconBg: '#FFF8E1', iconColor: '#F57F17' },
            { id: 'community', icon: 'account-group-outline', label: 'Tham gia cộng đồng Medpro', iconBg: '#F1F8E9', iconColor: '#33691E' },
        ],
    },
];

const UserProfile = ({ navigation, onLogin, onRegister, onMenuItem }) => {
    const theme = useTheme();
    const { user, dispatch } = React.useContext(MyUserContext);
    const [snackbar, setSnackbar] = useState({});
    const [loading, setLoading] = useState(false);
    const handleLogout = async () => {
        const token = await AsyncStorage.getItem("access_token");
        await createPublic(
            endpoints.logout,
            {
                token: token,
                client_id: CLIENT_ID_APP,
                client_secret: CLIENT_SECRET_APP,
            },
            () => { },
            (err) => setSnackbar({ visible: true, message: err, type: 'error' }),
            {},
            async () => {
                await SecureStore.deleteItemAsync("user");
                await AsyncStorage.clear();
                dispatch({ type: "LOGOUT" });
                setLoading(false);
            },
            setLoading
        );
    }

    return (
        <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* ── Hero header ── */}
                <Surface style={[styles.hero, { backgroundColor: COLORS.primary }]} elevation={0}>
                    <View style={styles.heroInner}>
                        <Surface style={styles.avatarRing} elevation={2}>
                            <Avatar.Icon
                                size={136}
                                icon="account-outline"
                                style={{ backgroundColor: theme.colors.surfaceVariant }}
                                color={theme.colors.onSurfaceVariant}
                            />
                        </Surface>

                        <Text
                            variant="headlineSmall"
                            style={[styles.heroName, { color: theme.colors.onPrimary }]}
                        >
                            {user?.last_name} {user?.first_name}
                        </Text>

                        {user ? (
                            <>
                                <View>
                                    <Text
                                        variant="bodyMedium"
                                        style={[styles.heroSub, { color: theme.colors.onPrimary, opacity: 0.8 }]}
                                    >
                                        Chào mừng bạn đã trở lại! Hãy khám phá các dịch vụ của chúng tôi.
                                    </Text>
                                </View>
                                {user.role == "doctor" && (
                                    <AppButton
                                        type="book"
                                        style={{ borderWidth: 1, borderColor: "#FFFFFF" }}
                                        onPress={() => navigation.navigate('Schedule')}
                                    />
                                )}

                                <AppButton
                                    type="detail"
                                    label="Xem chi tiết hồ sơ"
                                    style={{ borderWidth: 1, borderColor: "#FFFFFF" }}
                                    onPress={() => navigation.navigate('ProfileDetail')}
                                />

                            </>
                        ) : (
                            <>
                                <Text
                                    variant="bodyMedium"
                                    style={[styles.heroSub, { color: theme.colors.onPrimary, opacity: 0.8 }]}
                                >
                                    Đăng nhập để trải nghiệm đầy đủ tính năng
                                </Text>

                                {/* Nút đăng nhập / đăng ký */}
                                <View style={styles.authRow}>

                                    <AppButton
                                        type="login"
                                        mode="contained"
                                        color={theme.colors.onPrimary}
                                        textColor={theme.colors.primary}
                                        contentStyle={styles.btnContent}
                                        style={[styles.btnLogin, { backgroundColor: theme.colors.onPrimary }]}
                                        labelStyle={styles.btnLabel}
                                        onPress={onLogin}
                                        onPressIn={() => navigation.navigate('Login')}
                                    />

                                    <AppButton
                                        type="register"
                                        mode="contained"
                                        color={theme.colors.onPrimary}
                                        textColor={theme.colors.primary}
                                        contentStyle={styles.btnContent}
                                        style={[styles.btnLogin, { backgroundColor: theme.colors.onPrimary }]}
                                        labelStyle={styles.btnLabel}
                                        onPress={onRegister}
                                        onPressIn={() => navigation.navigate('Register')}
                                    />

                                </View>
                            </>
                        )}

                    </View>

                    {/* Wave bottom */}
                    <View style={[styles.wave, { backgroundColor: theme.colors.background }]} />
                </Surface>

                {/* ── Menu sections ── */}
                <View style={styles.menuWrap}>
                    {MENU_SECTIONS.map((section, si) => (
                        <View key={section.title} style={styles.section}>
                            <Text
                                variant="labelSmall"
                                style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
                            >
                                {section.title.toUpperCase()}
                            </Text>

                            <Surface
                                style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
                                elevation={1}
                            >
                                {section.items.map((item, ii) => (
                                    <React.Fragment key={item.id}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => onMenuItem?.(item.id)}
                                        >
                                            <List.Item
                                                title={item.label}
                                                titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
                                                style={styles.listItem}
                                                left={() => (
                                                    <View
                                                        style={[
                                                            styles.iconWrap,
                                                            { backgroundColor: item.iconBg },
                                                        ]}
                                                    >
                                                        <List.Icon
                                                            icon={item.icon}
                                                            color={item.iconColor}
                                                            style={styles.iconInner}
                                                        />
                                                    </View>
                                                )}
                                                right={(props) => (
                                                    <List.Icon
                                                        {...props}
                                                        icon="chevron-right"
                                                        color={theme.colors.onSurfaceVariant}
                                                    />
                                                )}
                                            />
                                        </TouchableOpacity>
                                        {ii < section.items.length - 1 && (
                                            <Divider style={{ marginLeft: 64 }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Surface>
                        </View>
                    ))}

                    {/* App version */}
                    <Text
                        variant="bodySmall"
                        style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
                    >
                        Phiên bản 1.0.0
                    </Text>
                </View>
                {user &&(
                    <AppButton loading={loading} type='logout' style={{ marginTop: 20 }} onPress={handleLogout} />
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
    root: {
        flex: 1,
    },
    scroll: {
        paddingBottom: 40,
    },

    /* Hero */
    hero: {
        paddingBottom: 0,
        overflow: 'hidden',
    },
    heroInner: {
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 30,
    },

    avatarRing: {
        borderRadius: 999,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    heroName: {
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSub: {
        textAlign: 'center',
        marginBottom: 28,
    },
    authRow: {
        flexDirection: 'row',
        gap: 12,
    },
    btnContent: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    btnLabel: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    btnLogin: {
        borderRadius: 10,
        minWidth: 130,
    },
    btnRegister: {
        borderRadius: 10,
        minWidth: 130,
        borderColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1.5,
    },

    /* Wave separator */
    wave: {
        height: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    /* Menu */
    menuWrap: {
        paddingHorizontal: 16,
        gap: 16,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        paddingHorizontal: 4,
        letterSpacing: 0.8,
    },
    sectionCard: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    itemTitle: {
        fontSize: 14,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginLeft: 4,
        overflow: 'hidden',
    },
    iconInner: {
        margin: 0,
    },

    version: {
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.5,
    },
});

export default UserProfile;