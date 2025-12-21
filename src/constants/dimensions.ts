import {Dimensions} from 'react-native';
import {PixelRatio, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const h = Dimensions.get('window').height;
const w = Dimensions.get('window').width;
const ID = 'ID'
const onBoard = 'onBoard'

export {h, w, ID, onBoard};


const scale = w / 320;

export const adjust = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

export const saveData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : undefined;
  } catch (e) {
    // error reading value
    return undefined;
  }
};

export const storeValue = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

export const getValue = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? value : undefined;
  } catch (e) {
    // error reading value
    return undefined;
  }
};

export const nav = (navigation: any, route?: string, params?: any) => {
  const {navigate, goBack} = navigation;
  route ? navigate(route, params) : goBack();
};

export const removeValue = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Error removing value:', error);
  }
};