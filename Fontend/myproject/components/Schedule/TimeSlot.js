import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';


const TimeSlot = ({ shift, selectedSlots, onSlotsChange, SLOTS, multiple = true }) => {
  const slots = SLOTS?.[shift] ?? [];

  const isSelected = (slot) => {
    if (multiple) {
      return selectedSlots?.some(
        s => s.start_time === slot.start_time && s.end_time === slot.end_time
      );
    } else {
      return selectedSlots &&
        selectedSlots.start_time === slot.start_time &&
        selectedSlots.end_time === slot.end_time;
    }
  };

  const handlePress = (slot) => {
    if (slot.status === 'Booked') return;
    const exists = isSelected(slot);

    if (multiple) {
      if (exists) {
        onSlotsChange(
          selectedSlots.filter(s => !(s.start_time === slot.start_time && s.end_time === slot.end_time))
        );
      } else
        onSlotsChange([...selectedSlots, { id: slot.id, start_time: slot.start_time, end_time: slot.end_time }]);
    } else {
      if (exists) {
        onSlotsChange(null);
      } else
        onSlotsChange({ id: slot.id, start_time: slot.start_time, end_time: slot.end_time });
    }
  };


  if (!slots.length) return (
    <View>
      <Text variant="labelSmall" style={styles.label}>Không có khung giờ</Text>
    </View>
  );

  const formatSlotLabel = (label) => {
    return label
      .split(" - ")
      .map((time) => time.slice(0, 5))
      .join(" - ");
  };

  return (
    <View>
      <View style={styles.row}>
        {slots.map(slot => (
          <Chip
            key={slot.label}
            selected={isSelected(slot)}
            disabled={slot.status === 'Booked'}
            onPress={() => handlePress(slot)}
            style={[styles.chip, isSelected(slot) && styles.selected, slot.status === 'Booked' && styles.booked]}
            textStyle={[styles.text, isSelected(slot) && styles.textSel]}
            showSelectedCheck={false}
          >
            {formatSlotLabel(slot.label)}
          </Chip>
        ))}
      </View>
    </View>
  );
};

export default TimeSlot;

const styles = StyleSheet.create({
  label: { color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 ,justifyContent: 'center',},
  chip: { borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0'},
  selected: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  booked: {
    backgroundColor: '#b4b4b4',
    borderColor: '#0a0a0a',
    borderWidth: 1,
    opacity: 0.7,
  },
  text: { fontSize: 12, color: '#64748b' },
  textSel: { color: '#1d4ed8', fontWeight: '600' },
});