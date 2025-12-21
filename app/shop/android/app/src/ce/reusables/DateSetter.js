import React, { useState } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateSetter = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateMode, setIsDateMode] = useState(true);

  const onChange = (event, selectedValue) => {
    const currentDate = selectedValue || date;
    setShowDatePicker(Platform.OS === 'ios');
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showPicker = (mode) => {
    if (mode === 'date') {
      setShowDatePicker(true);
      setIsDateMode(true);
    } else {
      setShowTimePicker(true);
      setIsDateMode(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selected Date: {date.toDateString()}</Text>
      <Text style={styles.text}>Selected Time: {date.toLocaleTimeString()}</Text>

      <Button title="Set Date" onPress={() => showPicker('date')} />
      <Button title="Set Time" onPress={() => showPicker('time')} />

      {(showDatePicker || showTimePicker) && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker || showTimePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={date}
                mode={isDateMode ? 'date' : 'time'}
                display="default"
                onChange={onChange}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DateSetter;
