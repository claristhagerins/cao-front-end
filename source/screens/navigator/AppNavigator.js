import React from 'react';
import { Button, View, Text } from 'react-native';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Loading from '../loading/Loading';
import Login from '../login/Login';
import SignUp from '../signup/SignUp';
import MainTabNavigator from '../main/MainTabNavigator';
import NewEvent from '../events/NewEvent';
import AddFriend from '../contacts/AddFriend';
import AddParticipant from '../events/AddParticipant';
import EditProfile from '../settings/EditProfile';
import EventDetail from '../events/EventDetail';
import Vote from '../events/Vote';

const NewEventStack = createStackNavigator({
    NewEvent: NewEvent,
});

const AddFriendStack = createStackNavigator({
    AddFriend: AddFriend,
});

const AddParticipantStack = createStackNavigator({
    AddParticipant: AddParticipant,
});

const EditProfileStack = createStackNavigator({
    EditProfile: EditProfile,
});

const EventDetailStack = createStackNavigator({
    EventDetail: EventDetail,
});

const VoteStack = createStackNavigator({
    Vote: Vote
});

export default createAppContainer(createSwitchNavigator(
    {
        Loading: {
            screen: Loading,
            navigationOptions: () => ({ header: null })
        },
        Login: {
            screen: Login,
            navigationOptions: () => ({ header: null })
        },
        SignUp: {
            screen: SignUp,
            navigationOptions: () => ({ header: null })
        },
        Main: MainTabNavigator,
        // Events: Events,
        // Schedule: Schedule,
        // Contacts: Contacts,
        // Settings: Settings,
        NewEvent: NewEventStack,
        AddFriend: AddFriendStack,
        AddParticipant: AddParticipantStack,
        EditProfile: EditProfileStack,
        EventDetail: EventDetailStack,
        Vote: VoteStack
    },
    {
        initialRouteName: "Loading"
    }
));