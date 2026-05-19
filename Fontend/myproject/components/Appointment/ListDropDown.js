import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { List } from 'react-native-paper';
import specialtyIcons from '../../styles/LogoSpecialty';

const ListDropDown = ({ title, value, icon, data, onSelect, setPage, Icon }) => {
    return (
        <View style={styles.wrapper}>
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.container}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                itemTextStyle={styles.itemText}
                activeColor="#f0fdf4"
                data={data}
                labelField="name"
                valueField="id"
                placeholder={title}
                value={value}
                onChange={(item) => onSelect(item)}
                flatListProps={{
                    onEndReached: () => setPage && setPage(prev => prev + 1),
                    onEndReachedThreshold: 0.3,
                }}
                renderLeftIcon={() => (
                    <List.Icon icon={icon} color="#64748b" style={{ margin: 0, paddingRight: 20 }} />
                )}
                renderRightIcon={() => (
                    <List.Icon icon="chevron-down" color="#94a3b8" style={{ margin: 0 }} />
                )}
                renderItem={(item) => (
                    <View style={styles.item}>


                        {item.type === "doctor" ? (
                            <>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    gap: 10,
                                }}>
                                    {/* Tên + gender */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>
                                            BS. {item.name}
                                        </Text>
                                        <View style={{
                                            alignSelf: 'flex-start',
                                            marginTop: 3,
                                            paddingHorizontal: 8, paddingVertical: 2,
                                            borderRadius: 20,
                                            backgroundColor:
                                                item.gender === "male" ? '#dbeafe' :
                                                    item.gender === "female" ? '#fce7f3' : '#f1f5f9',
                                        }}>
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569' }}>
                                                {item.gender === "male" ? "👨 Nam" :
                                                    item.gender === "female" ? "👩 Nữ" : "🧑 Khác"}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Email + Phone */}
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={{ fontSize: 11, color: '#94a3b8' }}></Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <List.Icon icon="cash" color="#64748b" size={11} />
                                                <Text style={{ fontSize: 11, color: '#64748b' }}>
                                                    {new Intl.NumberFormat('vi-VN').format(item.description)} VND
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={{ fontSize: 11, color: '#94a3b8' }}>📞</Text>
                                            <Text style={{ fontSize: 11, color: '#64748b' }}>{item.specialty}</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <List.Icon
                                        icon={specialtyIcons[item.id] || "hospital-box-outline"}
                                        color="#1976D2"
                                        style={{ margin: 0 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>{item.name}</Text>
                                        {item.description &&
                                            <Text style={styles.itemDesc}>{item.description}</Text>
                                        }
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    dropdown: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    container: {
        borderRadius: 12,
        borderColor: '#e2e8f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    placeholder: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#64748b',
    },
    selectedText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1976D2',
    },
    itemText: {
        fontSize: 14,
        color: '#1976D2',
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
    },
    itemDesc: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 12,
        color: '#0f766e',
        fontWeight: '600',
        marginTop: 2,
    },
});

export default ListDropDown;