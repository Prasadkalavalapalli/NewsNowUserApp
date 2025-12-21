import React from 'react';
import { ScrollView, View, SafeAreaView } from "react-native";
import MainHeader from "../helpers/mainheader";
import AdminDashboard from "./AdminDashboard";
import Loader from '../helpers/loader';
import DateRangeFilter from '../helpers/filter';


const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <MainHeader />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 6 }}>
          <AdminDashboard />
        </View>
      </ScrollView>
      {/* <Loader/> */}
     
      
    </SafeAreaView>
  );
};

export default HomeScreen;