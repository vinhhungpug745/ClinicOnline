import { useContext, useState } from "react"
import { fetchPublic } from "../../utils/apiHelper"
import { endpoints } from "../../configs/Apis"
import { ScrollView, View } from "react-native"
import { MyUserContext } from "../../utils/contexts/MyUserContext"
import PersonalInfoCard from "../../components/User/Profile/PersonalInfoCard"
import InsuranceCard from "../../components/User/Profile/InsuranceCard"
import MedicalInfoCard from "../../components/User/Profile/MedicalInfoCard"
import { StyleSheet } from "react-native"
import COLORS from "../../styles/Colors"
import Mystyles from "../../styles/Mystyles"
import AppButton from "../../components/AppButton"

const ProfileDetail = () => {
    const { user } = useContext(MyUserContext);
    const [profileDetail, setProfileDetail] = useState(user)

    const updatePatient = (key, value) => {
        setProfileDetail(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updateProfile = (key, value) => {
        setProfileDetail(prev => ({
            ...prev,
            profile: { ...prev.profile, [key]: value }
        }));
    };
    return (
        <View style={Mystyles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <PersonalInfoCard data={user} updatePatient={updatePatient} />
                {user.role === "customer" ? (
                    <>
                        <InsuranceCard data={user} updateProfile={updateProfile} />
                        <MedicalInfoCard data={user} updateProfile={updateProfile} />
                    </>
                ) : (
                    null
                )}

            </ScrollView>
            <AppButton type="edit" onPress={console.log("dddđ")}  />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
    },
})

export default ProfileDetail