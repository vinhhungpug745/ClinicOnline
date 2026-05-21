import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";
import { formatDate, formatDate2 } from "../../utils/format";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { InfoCard2Col } from "../Appointment/InfoCard";

const avatarColors = [
  { bg: "#E3F2FD", text: "#1565C0" },
  { bg: "#E8F5E9", text: "#2E7D32" },
  { bg: "#F3E5F5", text: "#6A1B9A" },
  { bg: "#FFF3E0", text: "#E65100" },
  { bg: "#E0F2F1", text: "#00695C" },
];

const getAvatarColor = (id = 0) => avatarColors[id % avatarColors.length];

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue} numberOfLines={3}>
        {value || "—"}
      </Text>
    </View>
  </View>
);

const MedicalRecordCard = ({ item, onPress }) => {
  const {
    doctor,
    customer,
    diagnosis,
    symptoms,
    follow_up_date,
    created_date,
    id,
  } = item;
  const { user } = useContext(MyUserContext);
  const target = user?.role === "doctor" ? customer : doctor;
  const targetAvatar = target?.avatar ?? null;
  const fullName = target ? `${target.last_name} ${target.first_name}` : "—";

  const roleLabel = user?.role === "doctor" ? "Bệnh nhân" : "Bác sĩ";

  const nameParts = fullName.trim().split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
      : fullName.charAt(0).toUpperCase();

  const avatarColor = getAvatarColor(item?.id ?? 0);

  const createdDate = item?.created_date ? formatDate2(item.created_date) : "—";

  const followUpDate = item?.follow_up_date
    ? formatDate(item.follow_up_date)
    : "Không có";

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          {targetAvatar ? (
            <Image source={{ uri: targetAvatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.initialsWrap,
                { backgroundColor: avatarColor.bg },
              ]}
            >
              <Text style={[styles.initials, { color: avatarColor.text }]}>
                {initials}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>

            <Text style={styles.role}>{roleLabel}</Text>
          </View>

          {/* <View style={styles.recordBadge}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={14}
              color="#0F766E"
            />

            <Text style={styles.recordBadgeText}>Hồ sơ bệnh án</Text>
          </View> */}
        </View>

        <View style={styles.divider} />

        {/* BODY */}
        <View style={styles.infoBlock}>
          <InfoRow
            icon="stethoscope"
            label="Chẩn đoán"
            value={item?.diagnosis}
          />

          <InfoRow
            icon="alert-circle-outline"
            label="Triệu chứng"
            value={item?.symptoms}
          />

          <InfoRow
            icon="calendar-clock"
            label="Tái khám"
            value={followUpDate}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MedicalRecordCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    padding: 16,

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  initialsWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 16,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
    gap: 2,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  role: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  recordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,

    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  recordBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F766E",
  },

  divider: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  infoBlock: {
    gap: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,

    backgroundColor: "#EEF6FF",

    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 20,
  },
});
