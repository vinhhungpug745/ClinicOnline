import { Button, Avatar, Card } from "react-native-paper";
import { View, Text } from "react-native";
import StylesDoctorCard from "./StylesDoctorCard";
import AnimatedPressable from "../../Animation/AnimatedPressable";
import AppButton from "../../AppButton";

const DoctorCard = ({ item, navigation }) => {
    return (
        <AnimatedPressable scaleTo={0.97} bounciness={8}>
            <Card
                style={StylesDoctorCard.card}
                onPress={() => navigation.navigate("DoctorDetail", { doctorId: item.id })}
                mode="elevated"
            >
                <Card.Content style={StylesDoctorCard.cardContent}>
                    {/* Avatar */}
                    <View style={StylesDoctorCard.avatarWrapper}>
                        {item.avatar
                            ? <Avatar.Image size={80} source={{ uri: item.avatar }} />
                            : <Avatar.Icon size={80} icon="doctor" style={StylesDoctorCard.avatarIcon} />
                        }
                    </View>

                    {/* Họ tên đầy đủ */}
                    <Text style={StylesDoctorCard.name} numberOfLines={1}>
                        {item.last_name} {item.first_name}
                    </Text>

                    {/* Info rows */}
                    <View style={StylesDoctorCard.infoRow}>
                        <Text style={{ fontSize: 12 }}>📧</Text>
                        <Text style={StylesDoctorCard.infoText} numberOfLines={1}>{item.email}</Text>
                    </View>

                    <View style={StylesDoctorCard.infoRow}>
                        <Text style={{ fontSize: 12 }}>📞</Text>
                        <Text style={StylesDoctorCard.infoText}>{item.phone}</Text>
                    </View>

                    <View style={StylesDoctorCard.infoRow}>
                        <Text style={{ fontSize: 12 }}>
                            {item.gender === "male" ? "👨‍⚕️" : item.gender === "female" ? "👩‍⚕️" : "🧑‍⚕️"}
                        </Text>
                        <Text style={StylesDoctorCard.infoText}>
                            {item.gender === "male" ? "Nam" : item.gender === "female" ? "Nữ" : "Khác"}
                        </Text>
                    </View>
                </Card.Content>

                <Card.Actions style={StylesDoctorCard.cardActions}>
                    <AppButton
                        label="Tư vấn ngay"
                        type="book"
                        onPress={() => navigation.navigate("DoctorDetail", { doctorId: item.id })}
                        textColor="#fff"
                        mode="contained"
                        style={{
                            flex: 1,
                            borderRadius: 10,
                            backgroundColor: '#2196F3',
                            marginBottom: 0,
                            marginHorizontal: 0,
                        }}
                        labelStyle={{ fontSize: 15, fontWeight: '600' }}
                    />
                </Card.Actions>
            </Card>
        </AnimatedPressable>
    );
};

export default DoctorCard;