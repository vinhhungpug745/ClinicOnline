import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.41;
export default StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e'
  },

  sectionSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  seeAll: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500'
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
    gap: 16,
    paddingBottom: 8
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    paddingBottom: 0
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 10
  },
  degree: {
    fontSize: 12,
    color: '#888'
  },
  name: {
    fontSize: 14,
    fontWeight: '700'
    , color: '#1a1a2e'
    , marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row'
    , alignItems: 'center'
    , gap: 6, marginBottom: 4
  },
  infoIcon: { fontSize: 12 },
  infoText: { fontSize: 12, color: '#555', flex: 1 },
  cardActions: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 12 },
  btn: { flex: 1, borderRadius: 10, backgroundColor: '#2196F3' },
  btnLabel: { fontSize: 15, fontWeight: '600' },
});