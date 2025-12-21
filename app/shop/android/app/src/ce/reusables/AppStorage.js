import { MMKV } from 'react-native-mmkv'
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
    let result = await AsyncStorage.setItem(key, value);
    console.log(result)
    return result;
};

export const getData = async (key) => {
    let result = await AsyncStorage.getItem(key);
    // console.log(result)
    return result;
};