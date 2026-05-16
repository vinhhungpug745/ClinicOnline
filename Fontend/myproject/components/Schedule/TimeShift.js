import { StyleSheet } from "react-native";
import { Card, SegmentedButtons } from "react-native-paper";
import COLORS from "../../styles/Colors";

const TimeShift = ({shift, updateBulk, setShift}) => {
    return (
        <Card style={styles.card}>
            <Card.Content>
                <SegmentedButtons
                    value={shift}
                    onValueChange={(value) => {
                        updateBulk ? updateBulk({ shift: value, slots: [] }) :setShift(value);
                    }}
                    style={styles.segmented}
                    theme={{
                        colors: {
                            secondaryContainer: COLORS.primary,
                            onSecondaryContainer: '#ffffff',
                            outline: '#e2e8f0',
                        },
                    }}
                    buttons={[
                        { value: 'morning', label: '🌤 Sáng', style: styles.segBtn },
                        { value: 'afternoon', label: '☀️ Chiều', style: styles.segBtn },
                        { value: 'evening', label: '🌙 Tối', style: styles.segBtn },
                    ]}
                />
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: COLORS.white,
        elevation: 2,
        marginBottom: 16,

        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    segBtn: {
        borderRadius: 10,
    },
})

export default TimeShift;