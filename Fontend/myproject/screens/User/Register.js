import InputField, { InputItem } from "../../components/User/LoginRegister/Input";
import Mystyles from "../../styles/Mystyles";
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Button, HelperText, Icon } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoints } from "../../configs/Apis";
import { createPublic } from "../../utils/apiHelper";
import AppButton from "../../components/AppButton";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import AppHeader from "../../components/AppHeader";
import COLORS from "../../styles/Colors";

const Register = ({ navigation }) => {
    const [user, setUser] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        email: '',
    });
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const info = [
        {
            label: "Họ và tên",
            placeholder: "Họ và tên",
            icon: "account",
            field: "fullName",
            secureText: false,
            inputProps: {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoComplete: 'email',
            },
        }, {
            label: "Tên đăng nhập",
            icon: "account",
            placeholder: "username",
            field: "username",
            secureText: false,
            inputProps: {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoComplete: 'email',
            },
        },
        {
            label: "Mật khẩu",
            field: "password",
            placeholder: "*************",
            secureText: true,
            inputProps: {
                autoComplete: 'password',
            },
        }, {
            label: "Nhập lại mật khẩu",
            field: "confirmPassword",
            placeholder: "*************",
            secureText: true,
            inputProps: {
                autoComplete: 'password',
            },
        }]

    const [errors, setErrors] = useState({});

    const pickImage = async () => {
        let { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.3,
                    allowsEditing: true,
                    aspect: [1,1],
                });
            if (!result.canceled) {
                const asset = result.assets[0];
                if (asset.fileSize > 5 * 1024 * 1024) {
                    showSnackbar("Ảnh quá lớn!", "Vui lòng chọn ảnh dưới 5MB", "warning");
                    return;
                }
                setUser({ ...user, avatar: asset });
            }
        }
    }

    const validate = (user) => {
        const err = {};

        if (user.username === "") {
            err.username = "Vui lòng nhập username";
        } else if (user.username.includes(" ")) {
            err.username = "Username không được chứa khoảng trắng";
        }

        if (!user.fullName.trim()) {
            err.fullName = "Vui lòng nhập họ tên";
        }

        if (!user.password) {
            err.password = "Vui lòng nhập mật khẩu";
        } else if (user.password.length < 6) {
            err.password = "Mật khẩu phải >= 6 ký tự";
        }

        if (!user.confirmPassword) {
            err.confirmPassword = "Vui lòng nhập lại mật khẩu";
        } else if (user.password !== user.confirmPassword) {
            err.confirmPassword = "Mật khẩu không khớp";
        }

        if (user.phone && !/^\d{10,11}$/.test(user.phone)) {
            err.phone = "Số điện thoại không hợp lệ";
        }

        if (user.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(user.email)) {
            err.email = "Email không hợp lệ";
        }

        return err;
    };

    const infoWithError = info.map((item) => ({
        ...item,
        error: !!errors?.[item.field],
        errorText: errors?.[item.field] || "",
    }));

    const register = async () => {
        const err = validate(user);

        setErrors(err);
        if (Object.keys(err).length === 0) {
            setLoading(true);

            let formData = new FormData();

            for (let key in user) {
                if (key !== "confirmPassword") {
                    if (key === "fullName") {
                        const parts = user[key].trim().split(/\s+/);
                        const first_name = parts.pop();
                        const last_name = parts.join(" ");
                        formData.append("first_name", first_name);
                        formData.append("last_name", last_name);
                    } else if (key === "avatar") {
                        formData.append("avatar", {
                            uri: user[key].uri,
                            name: user[key].fileName,
                            type: 'image/jpeg',
                        });
                    } else {
                        formData.append(key, user[key]);
                    }
                }
            }


            await createPublic(
                endpoints.register,
                formData,
                (data) => {
                    navigation.navigate("Login", {
                        successMessage: "Đăng ký thành công! Vui lòng đăng nhập."
                    });
                },
                (type, msg, errData) => {
                    if (type === "client") {
                        setErrors(errData || {});
                        showSnackbar("Đăng ký thất bại!", "error", msg);
                    }
                },
                { 'Content-Type': 'multipart/form-data' }, 
                null,
                setLoading
            );
        };
        setLoading(false);
    }

    return (
        <View>
            <AppHeader titles="Đăng ký tài khoản" onBack={() => {
                navigation.goBack();
            }}>

            </AppHeader>
            <ScrollView style={{ paddingHorizontal: 28 ,paddingTop: 36, backgroundColor: COLORS.bg}}>

                <InputField list={infoWithError.slice(0, 2)} user={user} setUser={setUser} setErrors={setErrors} />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                        <InputItem
                            label="Số điện thoại"
                            icon="phone"
                            value={user["phone"]}
                            onChangeText={(v) => {
                                setUser({ ...user, ["phone"]: v })
                                setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors["phone"];
                                    return newErrors;
                                });
                            }}
                            placeholder="Số điện thoại"
                            secureText={false}
                            inputProps={{
                                keyboardType: 'phone-pad',
                                autoCapitalize: 'none',
                                autoComplete: 'tel',
                            }}
                        />

                        <HelperText type="error" visible={errors?.phone !== undefined}>
                            {errors?.phone}
                        </HelperText>
                    </View>
                    <View style={{ flex: 1 }}>
                        <InputItem style={{ flex: 1 }}
                            label="Địa chỉ email"
                            icon="email"
                            value={user["email"]}
                            onChangeText={(v) => {
                                setUser({ ...user, ["email"]: v })
                                setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors["email"];
                                    return newErrors;
                                });
                            }}
                            placeholder="Địa chỉ email"
                            secureText={false}
                            inputProps={{
                                keyboardType: 'email-address',
                                autoCapitalize: 'none',
                                autoComplete: 'email',
                            }}
                        />
                        <HelperText type="error" visible={errors?.email !== undefined}>
                            {errors?.email}
                        </HelperText>
                    </View>
                </View>
                <InputField list={infoWithError.slice(2)} user={user} setUser={setUser} setErrors={setErrors} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={pickImage} style={{
                        alignSelf: 'flex-start',
                        fontSize: 14,
                        width: '60%',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor: '#e0e0e8',
                        marginTop: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                    }}
                    >
                        <Text style={{ color: '#000000' }}>Chọn ảnh đại diện</Text>
                        <Icon
                            source="camera"
                            size={20}
                        />
                    </TouchableOpacity>

                    {user.avatar && <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100, marginTop: 12, borderColor: '#2e2d2d', borderWidth: 1, borderRadius: 50 }} />}
                </View>

                <View style={{ marginTop: 40 }}>
                    <AppButton loading={loading} type="register" icon="account-plus" onPress={register} />
                </View>

                <Text style={{ marginVertical: 20, textAlign: 'center', color: '#a4a4ad' }}>------ Hoặc đăng ký bằng ------</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button style={Mystyles.btnSocial} icon="google" mode="contained" onPress={() => console.log('Pressed')}>
                        Google
                    </Button>

                    <Button style={Mystyles.btnSocial} icon="facebook" mode="contained" onPress={() => console.log('Pressed')}>
                        Facebook
                    </Button>
                </View>

                <View style={{ marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ color: '#8a8a9a' }}>Bạn đã có tài khoản?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#000000' }}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );

}
export default Register;