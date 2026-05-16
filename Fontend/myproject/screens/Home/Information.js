import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { INFORMATION_CONTENT } from '../../utils/mapping';
import AppHeader from '../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../styles/Colors';

const Information = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const type = route.params?.type;
    const content = INFORMATION_CONTENT[type];

    if (!content) return null;

    return (
        <View style={styles.container}>
            <AppHeader titles={content.title} onBack={() => navigation.goBack()} />
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {content.sections.map((section, i) => (
                    <View key={i} style={styles.section}>
                        <Text style={styles.heading}>{section.heading}</Text>
                        <Text style={styles.body}>{section.body}</Text>
                    </View>
                ))}

                <Text style={styles.footer}>
                    Cập nhật lần cuối: 15/05/2025
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scroll: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 16,
        gap: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    heading: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    body: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 22,
    },
    footer: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default Information;