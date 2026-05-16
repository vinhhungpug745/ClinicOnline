import { StyleSheet } from "react-native";
import { Appbar, Surface } from "react-native-paper"
import COLORS from "../styles/Colors";
import { Children } from "react";

const AppHeader = ({ titles, step, onBack, children }) => {
    return (
        <Surface style={styles.container} elevation={4}>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={onBack} color={COLORS.white} />
                <Appbar.Content
                    title={Array.isArray(titles) ? titles[step] : titles}
                    titleStyle={styles.title}
                />
            </Appbar.Header>

            {children}
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.blue,
        paddingBottom: 12
    },
    appbar: {
        backgroundColor: "transparent",
        elevation: 0,
    },
    title: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 22,
    },
})

export default AppHeader;