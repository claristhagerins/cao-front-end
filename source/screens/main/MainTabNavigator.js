import React from 'react';
import Text from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import TabBarIcon from '../main/TabBarIcon';
import Events from '../events/Events';
import Schedule from '../schedule/Schedule';
import Contacts from '../contacts/Contacts';
import Settings from '../settings/Settings';

const EventsStack = createStackNavigator({
  Events: Events
});

EventsStack.navigationOptions = {
  tabBarLabel: 'Events',
  tabBarIcon: ({ tintColor }) => (
    // <TabBarIcon
    //   focused={focused}
    //   name={'ios-paper'}
    // />
    <Icon containerStyle={{ paddingBottom: 6 }} name="ios-paper" color={tintColor} size={25} />
  ),
};

// const ScheduleStack = createStackNavigator({
//   Schedule: Schedule,
// });

// ScheduleStack.navigationOptions = {
//   tabBarLabel: 'Schedule',
//   tabBarIcon: ({ tintColor }) => (
//     <Icon name="ios-calendar" color={tintColor} size={25} />
//   ),
// };

const ContactsStack = createStackNavigator({
  Contacts: Contacts,
});

ContactsStack.navigationOptions = {
  tabBarLabel: 'Friends',
  tabBarIcon: ({ tintColor }) => (
    <Icon name="md-people" color={tintColor} size={25} />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: Settings,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ tintColor }) => (
    <Icon name="md-settings" color={tintColor} size={25} />
  ),
};

export default createMaterialBottomTabNavigator({
  EventsStack: EventsStack,
  // ScheduleStack: ScheduleStack,
  ContactsStack: ContactsStack,
  SettingsStack: SettingsStack
}, {
    initialRouteName: 'EventsStack',
    activeTintColor: '#1da1f2',
    inactiveTintColor: '#c1c1c1',
    barStyle: { backgroundColor: 'white', alignItems: 'center', borderTopWidth: 0, height: 50},
  });