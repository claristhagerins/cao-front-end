import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    ScrollView,
    View
} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

export default class Schedule extends Component {
    static navigationOptions = {
        title: 'Schedule',
        headerTitleStyle: {
            fontWeight: 'bold',
            color: '#1da1f2'
        },
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.onDayPress = this.onDayPress.bind(this);
    }

    render() {
        return (
            <ScrollView style={styles.container}>
            <Calendar
                onDayPress={this.onDayPress}
                style={styles.calendar}
                hideExtraDays
                horizontal={true}
                markedDates={{[this.state.selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}}}
            />
            </ScrollView>
        );
    }

    onDayPress(day) {
        this.setState({
            selected: day.dateString
    });
    }
}

const styles = StyleSheet.create({
    calendar: {
    //   borderTopWidth: 1,
      paddingTop: 5,
    //   borderBottomWidth: 1,
    //   borderColor: '#eee',
    //   height: 350
    },
    text: {
      textAlign: 'center',
      borderColor: '#bbb',
      padding: 10,
      backgroundColor: '#eee'
    },
    container: {
      flex: 1,
      backgroundColor: 'gray'
    }
});
