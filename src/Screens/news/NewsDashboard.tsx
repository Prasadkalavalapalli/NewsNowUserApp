import React from 'react';
import { ScrollView, View, SafeAreaView } from "react-native";
import Header from '../helpers/header';
import { useNavigation } from '@react-navigation/native';
import AllNewsScreen from './allnews';
import NewsList from './newslist';



const NewsDashboard = () => {
    const navigation=useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* <View style={{ paddingTop:10 }}>
    <Header
        onback={navigation.goBack()}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
        title={'News'}
      /></View> */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 6 }}>
          {/* <AllNewsScreen/> */}
          <NewsList/>
        </View>
      </ScrollView>
      {/* <Loader/> */}
     
      
    </SafeAreaView>
  );
};

export default NewsDashboard;