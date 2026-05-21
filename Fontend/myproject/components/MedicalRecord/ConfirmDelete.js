import { Alert } from "react-native";

const confirmDelete = ({ title = "Xác nhận xóa", message, onConfirm }) => {
    Alert.alert(
        title,
        message,
        [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: onConfirm,
            }
        ]
    );
};

export default confirmDelete;