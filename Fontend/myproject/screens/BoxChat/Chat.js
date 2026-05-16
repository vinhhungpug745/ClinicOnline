import React, { useState, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, Text, TextInput, IconButton, Avatar } from 'react-native-paper';
import { createWithAuth } from '../../utils/apiHelper';
import { endpoints } from '../../configs/Apis';
import AppHeader from '../../components/AppHeader';
import COLORS from '../../styles/Colors';
import { useNavigation } from "@react-navigation/native";


const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const appendMessage = (text, sender) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        appendMessage(text, 'user');
        setInput('');
        await createWithAuth(
            endpoints.chatgemini,
            { message: text },
            (data) => appendMessage(data.reply, 'bot'),
            () => appendMessage('Loi ket noi.', 'bot'),
            setLoading,
        );
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
                {!isUser && (
                    <Avatar.Text size={32} label="AI" style={{ backgroundColor: COLORS.primary }} />
                )}
                <Card
                    style={[styles.bubble, { backgroundColor: isUser ? COLORS.primary : COLORS.white }]}
                    elevation={1}
                >
                    <Card.Content style={styles.bubbleContent}>
                        <Text style={{ color: isUser ? COLORS.white : COLORS.text }}>
                            {item.text}
                        </Text>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader titles="ChatBox Hỗ trợ sức khỏe" onBack={() => {
                navigation.goBack();
            }}>
            </AppHeader>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text variant="bodyMedium" style={{ color: COLORS.textMuted, textAlign: 'center' }}>
                                Để được chẩn đoán chính xác, bạn nên đến gặp bác sĩ tại cơ sở y tế gần nhất. Đừng tự ý dùng thuốc khi chưa có chỉ định nhé! 
                            </Text>
                        </View>
                    }
                />

                {loading && (
                    <View style={[styles.rowBot, { paddingBottom: 4 }]}>
                        <Avatar.Text size={32} label="AI" style={{ backgroundColor: COLORS.primary }} />
                        <Card style={{ backgroundColor: COLORS.white }} elevation={1}>
                            <Card.Content style={styles.bubbleContent}>
                                <Text style={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                                    Đang trả lời...
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>
                )}

                <Card style={styles.inputBar} elevation={4}>
                    <Card.Content style={styles.inputContent}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Nhập câu hỏi..."
                            mode="outlined"
                            multiline
                            maxLength={500}
                            disabled={loading}
                            outlineColor={COLORS.border}
                            activeOutlineColor={COLORS.primary}
                            dense
                        />
                        <IconButton
                            icon="send"
                            size={24}
                            disabled={!input.trim() || loading}
                            onPress={sendMessage}
                            iconColor={COLORS.white}
                            style={{ backgroundColor: !input.trim() || loading ? COLORS.btnDisabled : COLORS.primary }}
                        />
                    </Card.Content>
                </Card>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    flex: { flex: 1 },
    list: { padding: 16, gap: 10, flexGrow: 1 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    rowUser: { flexDirection: 'row-reverse' },
    rowBot: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
    bubble: { maxWidth: '75%', borderRadius: 16 },
    bubbleContent: { paddingVertical: 6, paddingHorizontal: 4 },
    inputBar: { margin: 12, borderRadius: 16, backgroundColor: COLORS.white },
    inputContent: { flexDirection: 'row', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: COLORS.bgInput, maxHeight: 120, fontSize: 15 },
});