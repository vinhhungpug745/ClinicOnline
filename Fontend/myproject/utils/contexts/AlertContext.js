import { createContext, useContext, useState } from "react";
import CustomAlert from "../../components/AppAlert";
import { useNavigation } from "@react-navigation/native";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

const AlertProvider = ({ children }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const navigation = useNavigation();
    const [alertConfig, setAlertConfig] = useState({
        type: 'info',
        title: '',
        message: '',
        actions: [],
    });

    const showAlert = ({ type = 'info', title, message, actions }) => {
        setAlertConfig({ type, title, message, actions });
        setAlertVisible(true);
    }

    const showAlertAuth = ({ lable }) => {
        setAlertConfig({
            type: 'info',
            title: 'Thông báo',
            message: 'Vui lòng đăng nhập để sử dụng dịch vụ ' + lable,
            actions: [
                {
                    text: 'Quay lại trang chủ',
                    onPress: ()=>{navigation.navigate("HomeTab")}
                },
                {
                    text: 'Đến trang đăng nhập',
                    onPress: () => {navigation.navigate("UserTab",{screen : "Login"})},
                },
            ],
            dismissable: true
        })
        setAlertVisible(true);
    }

    const showAlertAuth403 = () => {
        setAlertConfig({
            type: 'info',
            title: 'Thông báo',
            message: 'Bạn không có quyền truy cập',
            actions: [
                {
                    text: 'Thoát',
                    onPress: ()=>{navigation.navigate("HomeTab")}
                }
            ],
            dismissable: true
        })
        setAlertVisible(true);
    }

    return (
        <AlertContext.Provider value={{ showAlert, showAlertAuth , showAlertAuth403}}>
            {children}
            <CustomAlert
                visible={alertVisible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                actions={alertConfig.actions}
                onClose={() => setAlertVisible(false)}
                dismissable={alertConfig.dismissable ?? false}
            />
        </AlertContext.Provider>
    );
};

export default AlertProvider;