import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const RadioButton = ({ label, value, selected, onSelect }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onSelect(value)}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        <View style={[styles.innerCircle, selected && styles.selectedInnerCircle]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOuterCircle: {
    borderColor: '#007AFF',
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  selectedInnerCircle: {
    backgroundColor: '#007AFF',
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default RadioButton;
