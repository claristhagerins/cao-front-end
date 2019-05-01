import React from 'react';
import {
  StyleSheet, BackHandler, AsyncStorage, TextInput, ListView, Linking, ScrollView,
} from 'react-native';
import {
  Container, Content, Text, Spinner, Header, Left, Body, Right, Button, Icon, Title,
  Tab, Tabs, TabHeading, CheckBox, Toast, Root, Fab, Card, CardItem, Radio,
  Form, Item, Label, Input, Textarea, Picker, View, List, ListItem, Thumbnail, InputGroup
} from 'native-base';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import serviceUrl from '../../constant/Url';

const _format = 'YYYY-MM-DD'
const _full_format = 'ddd, DD MMM YYYY'
const _today = moment().format(_format)

export default class EventDetail extends React.Component {
  initialState = {
    [_today]: { disabled: true }
  }

  state = {
    loading: true,
    userId: '',
    userName: '',
    eventId: '',
    eventName: '',
    eventDescription: '',
    dateCreated: '',
    createdBy: '',
    pollClosedDate: '',
    isMultiple: '',
    participants: '',
    question: '',
    choices: '',
    location: '',
    dateChoice: '',
    dateChoiceNormalFormat: '',
    errorMessage: ''
  }

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted == true) {
      this.getId();
    }
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Main');
    return true;
  }

  getId() {
    AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
    AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
    AsyncStorage.getItem('eventId').then((value) => this.setEventId(value));
  }

  setUserId(value) { this.setState({ userId: value }) }
  setUserName(value) { this.setState({ userName: value }) }

  setEventId(value) {
    this.setState({ eventId: value });
    this.getEventDetail(this.state.eventId);
  }

  getEventDetail = async (eventId) => {
    let url = serviceUrl + '/events/showEventDetail';
    console.log(url);

    let data = {};
    data.eventId = eventId;

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.json();

      if (respJSON != null || respJSON != "") {
        this.setState({ errorMessage: '' })
        this.insertDetail(respJSON);
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      this.setState({ errorMessage: "Service is not available." })
      console.log(error)
    }
  }

  insertDetail(detail) {
    let eventName = detail[0].eventName;
    let eventDescription = detail[0].eventDescription;
    let dateCreated = detail[0].dateCreated;
    let createdBy = detail[0].createdBy;
    let pollClosedDate = moment(detail[0].pollClosedDate, 'DD-MMM-YYYY').format('ddd, DD MMMM YYYY');
    let isMultiple = detail[0].isMultiple;
    let question = detail[0].question;
    let choices = detail[0].choices;
    let dateChoice = detail[0].dateChoice;
    let locations = detail[0].locations;
    let participants = detail[0].participants;

    if (createdBy == this.state.userName) {
      createdBy = "You";
    }

    this.setState({ eventName: eventName });
    this.setState({ eventDescription: eventDescription });
    this.setState({ dateCreated: dateCreated });
    this.setState({ createdBy: createdBy });
    this.setState({ question: question });
    this.setState({ pollClosedDate: pollClosedDate })
    this.setState({ isMultiple: isMultiple });

    if (detail[0].dateChoice != "") {
      let evDate = dateChoice.split("~");

      let checked = false;
      let marked = true;


      for (let i = 0; i < evDate.length; i++) {
        let eventDate = moment(evDate[i], 'DD-MMM-YYYY').format('ddd, DD MMMM YYYY');

        const updateDateChoices = { ...this.state.dateChoice, ...{ [i]: { eventDate, marked, checked } } }
        this.setState({ dateChoice: updateDateChoices })
      }
      this.setState({ dateChoiceNormalFormat: evDate })
    }

    if (detail[0].locations != "") {
      let temp = locations.split("~");

      for (let i = 0; i < temp.length; i++) {
        let locationName = temp[i].split("(")[0];
        let locationContact = temp[i].substring(temp[i].indexOf("(") + 1, temp[i].length - 1);
        let checked = false;

        if (locationContact == "no contact") {
          locationContact = " "
        } else {
          locationContact = locationContact.replace("-", "");
          for (let j = 0; j < locationContact.length; j++) {
            locationContact = locationContact.replace(" ", "");
          }
        }

        const updatecontact = { ...this.state.location, ...{ [i]: { locationName, locationContact, checked } } }
        this.setState({ location: updatecontact })
      }
    }

    if (detail[0].choices != "") {
      let chc = choices.split("~");
      let checked = false;

      for (let i = 0; i < chc.length; i++) {
        let choice = chc[i];

        const updateChoices = { ...this.state.choices, ...{ [i]: { choice, checked } } }
        this.setState({ choices: updateChoices })
      }
    }

    if (detail[0].participants != "") {
      let pt = participants.split("~");
      let checked = false;

      this.setState({ participants: pt });
    }
  }

  checkDate = (idx, checkedValue) => {
    var found = this.getIndex(this.state.dateChoice, 'eventDate', idx.eventDate)
    let eventDate = idx.eventDate;
    let marked = !idx.marked;
    let checked = !idx.checked;

    this.setState({ dateChoice: { ...this.state.dateChoice, ...{ [found]: { eventDate, marked, checked } } } })
  }

  checkLocation = (idx, checkedValue) => {
    var found = this.getIndex(this.state.location, 'locationName', idx.locationName)
    let locationName = idx.locationName;
    let locationContact = idx.locationContact;
    let checked = !idx.checked;
    // console.log(idx.checked);
    // console.log(this.state.location['0']['checked']);

    this.setState({ location: { ...this.state.location, ...{ [found]: { locationName, locationContact, checked } } } })
  }

  checkChoice = (idx, checkedValue) => {
    var found = this.getIndex(this.state.choices, 'choice', idx.choice)
    let choice = idx.choice;
    let checked = !idx.checked;

    this.setState({ choices: { ...this.state.choices, ...{ [found]: { choice, checked } } } })
  }

  getIndex(arr, attr, value) {
    for (var i = 0; i < Object.keys(arr).length; i++) {
      if (arr[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

  checkContact(cont) {
    if (cont != " ") {
      return <Text style={{ width: '100%' }}>{cont}</Text>
    }
  }

  clickToCall(cont) {
    if (cont == " ") {
      return <Text> </Text>;
    } else {
      return <Button style={{ alignItems: 'flex-end' }} transparent onPress={() => Linking.openURL(`tel:${cont}`)}><Icon name="ios-call" style={{ color: '#499fcd' }} /></Button>;
    }
  }

  navigate(loc) {
    var url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=' + loc;
    var encode = encodeURI(url);
    console.log(encode);

    Linking.canOpenURL(encode).then(supported => {
      if (!supported) {
        console.log('failed');
      } else {
        return Linking.openURL(encode)
      }
    })
  }

  render() {
    if (this.state.loading == true) {
      return (
        <View style={styles.container}>
          <Header style={styles.header}>
            <Left style={{ flex: 1 }}>
              <Button transparent onPress={() => this.handleBackButtonClick()}>
                <Icon style={styles.backBtn} name='arrow-back' />
              </Button>
            </Left>
            <Body style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.headerTitle}>Detail</Text>
            </Body>
            <Right style={{ flex: 1 }}></Right>
          </Header>

          <View style={{ flex: 0, flexDirection: 'column', margin: 15, alignContent: 'center', justifyContent: 'center' }}>
            <Spinner color="#499fcd" />
          </View>
        </View>
      );
    }

    return (
      <ScrollView keyboardShouldPersistTaps='always'>
        <View style={styles.container}>
          <Header style={styles.header}>
            <Left style={{ flex: 1 }}>
              <Button transparent onPress={() => this.handleBackButtonClick()}>
                <Icon style={styles.backBtn} name='arrow-back' />
              </Button>
            </Left>
            <Body style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.headerTitle}>Detail</Text>
            </Body>
            <Right style={{ flex: 1 }}></Right>
          </Header>

          <View style={{ flex: 0, flexDirection: 'column', margin: 15 }}>
            <Card style={{ flexDirection: 'column', alignContent: 'flex-start' }} >
              <CardItem>
                <Body>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#499fcd' }}>{this.state.eventName}</Text>
                    <Text style={{ fontSize: 16 }}>{this.state.eventDescription}</Text>
                    {/* <Text style={{ fontSize: 16, marginTop: 10 }}>Poll Closed on {this.state.clos}</Text> */}
                  </View>
                </Body>
              </CardItem>
              <CardItem footer bordered>
                <View style={{ flex: 0, flexDirection: 'column', alignContent: 'flex-start', justifyContent: 'flex-start' }}>
                  <Text style={{ fontSize: 16, color: 'black' }}>Poll Closed Date: {this.state.pollClosedDate}</Text>
                  <Text style={{ fontSize: 16, color: 'black' }}>Created by <Text style={{ fontWeight: 'bold' }}>{this.state.createdBy}</Text>.</Text>
                </View>
              </CardItem>
            </Card>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    marginTop: 24,
    backgroundColor: '#499fcd',
    flex: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white'
  },
  backBtn: {
    color: 'white'
  },
})
