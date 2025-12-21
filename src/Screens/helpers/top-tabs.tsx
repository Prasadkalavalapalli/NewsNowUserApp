// components/TopTabs.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { pallette } from '../helpers/colors';
import { medium, bold, semibold } from '../helpers/fonts';
import { h, w, } from '../../constants/dimensions';

interface TopTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

const TopTabs: React.FC<TopTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            activeTab === index && styles.activeTab,
          ]}
          onPress={() => onTabChange(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === index && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
          {activeTab === index && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: pallette.white,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  tab: {
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.016,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  activeTab: {
    // borderBottomColor: pallette.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: semibold,
    color: pallette.grey,
    textAlign: 'center',
  },
  activeTabText: {
    color: pallette.primary,
    fontFamily: bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '100%',
    backgroundColor: pallette.primary,
  },
});

export default TopTabs;