import { useContext, useEffect, useState } from "react"
import { fetchPublic, updatePatchWithAuth } from "../../utils/apiHelper"
import { endpoints } from "../../configs/Apis"
import { ScrollView, View, Text } from "react-native"
import { MyUserContext } from "../../utils/contexts/MyUserContext"
import PersonalInfoCard from "../../components/User/Profile/PersonalInfoCard"
import InsuranceCard from "../../components/User/Profile/InsuranceCard"
import MedicalInfoCard from "../../components/User/Profile/MedicalInfoCard"
import { StyleSheet } from "react-native"
import COLORS from "../../styles/Colors"
import Mystyles from "../../styles/Mystyles"
import AppButton from "../../components/AppButton"
import { Icon } from "react-native-paper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext"
import AppHeader from "../../components/AppHeader"
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from 'expo-secure-store';
import DoctorProfileCard from "../../components/User/Profile/DoctorProfileCard"
const ProfileDetail = () => {
    const { user, dispatch } = useContext(MyUserContext);
    const initProfile = (u) => {
        const isCustomer = u?.role === "customer";

        const profileFields = isCustomer
            ? {
                allergy_history: u?.profile?.allergy_history ?? null,
                blood_group: u?.profile?.blood_group ?? null,
                height: u?.profile?.height ?? null,
                weight: u?.profile?.weight ?? null,
                insurance_number: u?.profile?.insurance_number ?? null,
                insurance_expiry_date: u?.profile?.insurance_expiry_date ?? null,
            }
            : {
                specialties: u?.profile?.specialties ?? [],
                workday_set: u?.profile?.workday_set ?? [],
                degree: u?.profile?.degree ?? null,
                experience: u?.profile?.experience ?? null,
                bio: u?.profile?.bio ?? null,
            };

        return {
            first_name: u?.first_name ?? null,
            last_name: u?.last_name ?? null,
            email: u?.email ?? null,
            phone: u?.phone ?? null,
            dob: u?.dob ?? null,
            gender: u?.gender ?? null,
            profile: profileFields,
        };
    };

    const [profileDetail, setProfileDetail] = useState(initProfile(user));
    const [change, setChange] = useState(true)
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState({});
    const { showSnackbar } = useSnackbar();
    const navigation = useNavigation();
    const updatePatient = (key, value) => {
        setProfileDetail(prev => ({
            ...prev, [key]: value
        }));
    };

    const updateProfile = (key, value) => {
        setProfileDetail(prev => ({
            ...prev,
            profile: { ...prev.profile, [key]: value }
        }));
    };

    useEffect(() => {
        console.log("User in ProfileDetail:", user);
        if (user !== null) setProfileDetail(initProfile(user))
    }, [user])


    const validate = (user) => {
        const err = {};

        if (!user.last_name?.trim()) {
            err.last_name = "Vui lòng nhập họ";
        }

        if (!user.first_name?.trim()) {
            err.first_name = "Vui lòng nhập tên";
        }

        if (!user.phone?.trim()) {
            err.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^\d{10,11}$/.test(user.phone)) {
            err.phone = "Số điện thoại không hợp lệ (10-11 số)";
        }

        if (user.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(user.email)) {
            err.email = "Email không hợp lệ";
        }

        if (user.dob) {
            const dob = new Date(user.dob);
            if (isNaN(dob.getTime())) {
                err.dob = "Ngày sinh không hợp lệ";
            } else if (dob > new Date()) {
                err.dob = "Ngày sinh không được lớn hơn hôm nay";
            } else {
                const age = new Date().getFullYear() - dob.getFullYear();
                if (age > 120) err.dob = "Ngày sinh không hợp lệ";
            }
        }

        if (user.profile?.insurance_number) {
            if (!/^[A-Z0-9]{10,15}$/.test(user.profile.insurance_number)) {
                err.insurance_number = "Số thẻ BHYT không hợp lệ (10-15 ký tự in hoa)";
            }
        }

        if (user.profile?.insurance_expiry_date) {
            const expiry = new Date(user.profile.insurance_expiry_date);
            if (isNaN(expiry.getTime())) {
                err.insurance_expiry_date = "Ngày hết hạn không hợp lệ";
            } else if (expiry < new Date()) {
                err.insurance_expiry_date = "Thẻ BHYT đã hết hạn";
            }
        }

        if (user.profile?.blood_type) {
            const validBloodTypes = ["A", "B", "AB", "O"];
            if (!validBloodTypes.includes(user.profile.blood_type)) {
                err.blood_type = "Nhóm máu không hợp lệ";
            }
        }

        return err;
    };

    const updateProfileUser = async () => {
        const errors = validate(profileDetail);
        console.log("Validation errors:", errors);
        if (Object.keys(errors).length > 0) {
            showSnackbar("Vui lòng kiểm tra lại thông tin đã nhập.", "warning");
            setErro(errors);
            return;
        }
        console.log(profileDetail)

        updatePatchWithAuth(
            endpoints.profile,
            profileDetail,
            async (data) => {
                console.log("✅ Thành công:", data);
                setChange(true);
                showSnackbar("Cập nhật hồ sơ thành công!", "success");
                const savedStr = await SecureStore.getItemAsync("user");
                const saved = savedStr ? JSON.parse(savedStr) : {};
                const updated = { ...saved, ...data };
                await SecureStore.setItemAsync("user", JSON.stringify(updated));
                dispatch({ type: "UPDATE", payload: data });
                setProfileDetail(data);
                setErro({});
            },
            (type, message, fieldErrors) => {
                if (type === "client") {
                        setErro(fieldErrors || {});
                        showSnackbar("Cập nhật hồ sơ thất bại!", "error", message);
                    }
            },
            setLoading
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Thông tin cá nhân" onBack={() => {
                navigation.goBack();
            }}>
            </AppHeader>
            {change === false && (
                <View style={styles.editingBanner}>
                    <Icon source="pencil-outline" size={16} color={COLORS.white} />
                    <Text style={styles.editingText}>Đang chỉnh sửa thông tin...</Text>
                </View>
            )}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View pointerEvents={change ? "none" : "auto"}>
                    <PersonalInfoCard err={erro} data={profileDetail} updatePatient={updatePatient} />
                    {user?.role === "customer" ? (
                        <>
                            <InsuranceCard err={erro} data={profileDetail} updateProfile={updateProfile} />
                            <MedicalInfoCard data={profileDetail} updateProfile={updateProfile} />
                        </>
                    ) : (
                        <DoctorProfileCard data={profileDetail} />
                    )}
                </View>
            </ScrollView>
            {change === true ?
                <AppButton type="edit" onPress={() => setChange(false)} />
                :
                <AppButton type="book" loading={loading} onPress={() =>
                    updateProfileUser()
                } label={"Xác nhận cập nhật hồ sơ"} />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
    },
    editingBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    editingText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "500",
    },
})

export default ProfileDetail