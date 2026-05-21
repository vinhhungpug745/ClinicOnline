import { useNavigation } from "@react-navigation/native";
import InputField from "../../components/User/LoginRegister/Input";
import Mystyles from "../../styles/Mystyles";
import { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Button, HelperText, Snackbar } from "react-native-paper";
import AppSnackbar from "../../components/AppSnackbar";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import { CLIENT_ID_APP, CLIENT_SECRET_APP } from "@env"
import AppButton from "../../components/AppButton";
import { createPublic, fetchPublic, fetchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import AppHeader from "../../components/AppHeader";
import qs from "qs";

const Login = ({ navigation, route }) => {
    const [user, setUser] = useState({
        username: "",
        password: "",
    });
const { showSnackbar } = useSnackbar();

    useEffect(() => {
        if (route.params?.successMessage) {
            showSnackbar(route.params.successMessage, "success");
        }
    }, 
    [route.params?.successMessage]);


    const info = [
        {
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
        },]

    const [errors, setErrors] = useState({});

    const validate = (user) => {
        const err = {};

        if (user.username === "") {
            err.username = "Vui lòng nhập username";
        } else if (user.username.includes(" ")) {
            err.username = "Username không được chứa khoảng trắng";
        }

        if (!user.password) {
            err.password = "Vui lòng nhập mật khẩu";
        }
        return err;
    };

    const infoWithError = info.map((item) => ({
        ...item,
        error: !!errors?.[item.field],
        errorText: errors?.[item.field] || "",
    }));

    const [loading, setLoading] = useState(false);

    const { dispatch } = useContext(MyUserContext);

    const handleLogin = async () => {
        const err = validate(user);
        setErrors(err);
        if (Object.keys(err).length === 0) {
            await createPublic(
                endpoints.login,
                qs.stringify(
                {
                    username: user.username,
                    password: user.password,
                    client_id: CLIENT_ID_APP,
                    client_secret: CLIENT_SECRET_APP,
                    grant_type: "password",
                }),
                async (dataToken) => {
                    await AsyncStorage.setItem("access_token", dataToken.access_token);

                    setTimeout(async () => {
                        await fetchWithAuth(
                            endpoints.profile,
                            async (data) => {
                                dispatch({ type: "LOGIN", payload: data });
                                const toSave = {
                                    ...data,
                                    tokenExpiresAt: Date.now() + dataToken.expires_in * 1000,// 
                                    refresh_token: dataToken.refresh_token,
                                }
                                await SecureStore.setItemAsync("user", JSON.stringify(toSave));

                                navigation.navigate("HomeTab", {
                                    screen: "Home",
                                    params: {
                                        successMessage: "Chào mừng bạn đã trở lại!",
                                    }
                                });
                            },
                            (type, message, fieldErrors) => {
                                if (type === "client") {
                                    setErrors(fieldErrors || {});
                                    showSnackbar("Đăng nhặp thất bại!", "error", message);
                                }
                            },
                        );
                    }, 500);
                },
                (type, msg) => showSnackbar(`${msg} Vui lòng kiểm tra lại thông tin`, 'error'),
                {},
                null,
                setLoading
            )
        }

    }

    return (
        <View style={{ flex: 1 }}>
            <AppHeader titles="Đăng nhập tài khoản" onBack={() => { navigation.goBack() }}>
            </AppHeader>
            <ScrollView style={{ flex: 1, marginTop: 100, paddingHorizontal: 28 }}>
                <InputField list={infoWithError} user={user} setUser={setUser} setErrors={setErrors} />
                <View style={{ marginTop: 40 }}>
                    <AppButton loading={loading} type="login" icon="account-plus" onPress={handleLogin} />
                </View>

                <Text style={{ marginVertical: 20, textAlign: 'center', color: '#a4a4ad' }}>------ Hoặc đăng nhập bằng ------</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button style={Mystyles.btnSocial} icon="google" mode="contained" onPress={() => console.log('Pressed')}>
                        Google
                    </Button>

                    <Button style={Mystyles.btnSocial} icon="facebook" mode="contained" onPress={() => console.log('Pressed')}>
                        Facebook
                    </Button>
                </View>

                <View style={{ marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ color: '#8a8a9a' }}>Bạn chưa có tài khoản?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={{ color: '#000000' }}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

export default Login;