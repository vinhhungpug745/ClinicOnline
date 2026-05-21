import { TextInput } from "react-native-paper";
import COLORS from "../../styles/Colors";
import styles from "../../styles/Mystyles";

const Field = ({ label, value, onChangeText, placeholder, multiline, keyboardType }) => (
    <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 3 : 1}
        outlineColor={COLORS.border}
        activeOutlineColor={COLORS.primary}
        style={styles.input}
    />
);

export default Field;