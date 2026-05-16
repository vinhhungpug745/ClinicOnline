import { StyleSheet } from 'react-native';
import COLORS from './Colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
    // paddingHorizontal: 16,
    paddingTop: 60,
  },

  padding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  margin: {
    marginHorizontal: 16,
    marginVertical: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  text: {
    fontSize: 14,
    color: '#1a1a2e',
  },

  smallText: {
    fontSize: 12,
    color: '#64748b',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
  },

  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 14,
  },

  secondaryButton: {
    backgroundColor: '#EAF4FF',
    borderRadius: 14,
  },

  outlineButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e8',
  },

  listContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
    gap: 10,
    paddingBottom: 8,

  },
  backdrop: {
    position: "absolute",
    top: 60, // chỉnh tùy header cao bao nhiêu
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10, // Android
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  tabBar: {
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: "absolute", // bắt buộc để border radius hiện
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});