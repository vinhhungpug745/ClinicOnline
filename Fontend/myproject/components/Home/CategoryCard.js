import React from "react";
import { View, FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/Colors";
import AnimatedPressable from "../Animation/AnimatedPressable";


const categories = [
    { id: "1", icon: "calendar-plus", label: "Đặt khám\ntại cơ sở", screen: "BookingTab" },
    { id: "2", icon: "stethoscope", label: "Đặt khám\nchuyên khoa", screen: "BookingTab" },
    { id: "3", icon: "test-tube", label: "Đặt lịch\nxét nghiệm", screen: "BookingTab" },
    { id: "4", icon: "shield-plus", label: "Gói sức khỏe\ntoàn diện", screen: "BookingTab" },
    { id: "5", icon: "account-heart", label: "Giúp việc\ncá nhân", screen: "BookingTab" },
    { id: "6", icon: "video", label: "Gọi video\nvới bác sĩ", screen: "ChatTab" },
    { id: "7", icon: "clock-outline", label: "Đặt khám\nngoài giờ", screen: "BookingTab" },
    { id: "8", icon: "office-building-outline", label: "Khám doanh\nnghiệp", screen: "BookingTab" },
];

const CategoryCard = () => {

    const navigation = useNavigation();

    return (
        <View style={styles.card}>
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <AnimatedPressable scaleTo={0.97} bounciness={8}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.chip,
                                pressed && styles.chipPressed,
                            ]}
                            onPress={() => navigation.navigate(item.screen, { category: item })}
                        >
                            <View style={styles.iconWrap}>
                                <Icon source={item.icon} size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>
                        </Pressable>
                    </AnimatedPressable>

                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingVertical: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        marginVertical: 12,
    },
    listContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    chip: {
        alignItems: "center",
        justifyContent: "center",
        width: 80,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        backgroundColor: COLORS.primary + "10",
    },
    chipPressed: {
        backgroundColor: COLORS.primary + "25",
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary + "15",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        color: COLORS.text,
        textAlign: "center",
        lineHeight: 16,
    },
});

export default CategoryCard;