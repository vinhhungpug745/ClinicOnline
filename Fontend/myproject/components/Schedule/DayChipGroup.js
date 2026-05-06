import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { formatDate } from '../../utils/format';


const DAY_VI = {
  "Monday": "T2",
  "Tuesday": "T3",
  "Wednesday": "T4",
  "Thursday": "T5",
  "Friday": "T6",
  "Saturday": "T7",
  "Sunday": "CN",
};

const DaychipGroup = ({ selected, onToggle, DAYS, WORKDAYS }) => {
  
  return (
    <View style={styles.row}>
      {DAYS.map((label, i) => (
        <Chip
          key={i}
          selected={selected === i}
          onPress={() => onToggle(i)}
          style={[
            styles.chip,
            selected === i && styles.chipSelected,
          ]}
          textStyle={[
            styles.text,
            selected === i && styles.textSelected,
          ]}
          showSelectedCheck={false}
          compact
        >
          {DAY_VI[label] ?? label} {WORKDAYS?.[i] ? formatDate(WORKDAYS[i]) : ''}
        </Chip>
      ))}
    </View>
  );
}

export default DaychipGroup;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  text: {
    fontSize: 12,
    color: '#64748b',
  },
  textSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});