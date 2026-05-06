import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../styles/Colors";

const AppList = ({
    data,
    renderItem,
    keyExtractor,
    refreshing = false,
    onRefresh,

    emptyIcon = "file-outline",
    emptyTitle = "Không có dữ liệu",
    emptyText = "",

    listContentStyle,
    isHorizontal = false,
    flatListProps = {}
}) => {
    return (
        <FlatList
            data={data}
            keyExtractor={keyExtractor}
            contentContainerStyle={
                data.length === 0
                    ? styles.emptyContainer
                    : [styles.listContent, listContentStyle]
            }
            renderItem={renderItem}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                ) : null
            }
            ListEmptyComponent={
                <View style={styles.center}>
                    <MaterialCommunityIcons
                        name={emptyIcon}
                        size={56}
                        color={COLORS.textMuted}
                    />
                    <Text style={styles.stateTitle}>{emptyTitle}</Text>
                    {emptyText ? (
                        <Text style={styles.stateText}>{emptyText}</Text>
                    ) : null}
                </View>
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            {...flatListProps}
        />
    );
};

export default AppList;

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 32,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    stateTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        textAlign: "center",
    },

    stateText: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 32,
    },
});