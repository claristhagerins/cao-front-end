import React from 'react';
import {
  StyleSheet, BackHandler, AsyncStorage, TextInput, ListView, Linking, ScrollView, Alert
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

export default class Vote extends React.Component {
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
    errorMessage: '',
    dateChecked: [],
    locationChecked: [],
    choiceChecked: []
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
    let pollClosedDate = moment(detail[0].pollClosedDate, 'dddd, LL HH:mm').format('dddd, LL HH:mm');
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

  showEventDate() {
    if (this.state.dateChoice.length != 0) {
      return <View>
        <List style={{ marginTop: 15, marginBottom: 10 }}>
          <ListItem itemDivider style={{ backgroundColor: 'WHITE', justifyContent: 'center', alignContent: 'center', borderBottomWidth: 1.5, borderBottomColor: '#499fcd' }}>
            <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>EVENT DATE</Text>
          </ListItem>
        </List>
        {/* <Calendar
                // onDayPress={this.onDaySelect}
                minDate={_today}
                disabled={true}
                hideExtraDays
                horizontal={true}
                marked={this.state.dateChoice.marked}
              /> */}

        <List
          dataArray={this.state.dateChoice}
          keyboardShouldPersistTaps='always'
          style={{ marginTop: 0, marginBottom: 0 }}
          renderRow={item => (
            <ListItem style={{ flex: 7, flexDirection: 'row' }} onPress={() => this.checkDate(item, item.checked)}>
              <CheckBox checked={item.checked} onPress={() => this.checkDate(item, item.checked)} />
              <View style={{ flex: 6, flexDirection: 'column', marginLeft: 15 }}>
                <Text style={{ width: '100%' }}>{item.eventDate}</Text>
              </View>
            </ListItem>
          )}
        />
      </View>
    } else {
      return <Text> </Text>
    }
  }

  showEventLocation() {
    if (this.state.location.length != 0) {
      return <View>
        <List style={{ marginTop: 15, marginBottom: 10 }}>
          <ListItem itemDivider style={{ backgroundColor: 'white', justifyContent: 'center', alignContent: 'center', borderBottomWidth: 1.5, borderBottomColor: '#499fcd' }}>
            <Text style={{ color: '#499fcd', fontWeight: 'bold' }} >EVENT LOCATION</Text>
          </ListItem>
        </List>

        <List
          dataArray={this.state.location}
          keyboardShouldPersistTaps='always'
          style={{ marginTop: 0, marginBottom: 0 }}
          renderRow={item => (
            <ListItem style={{ flex: 7, flexDirection: 'row' }} onPress={() => this.checkLocation(item, item.checked)}>
              <CheckBox checked={item.checked} onPress={() => this.checkLocation(item, item.checked)} />
              <View style={{ flex: 6, flexDirection: 'column', marginLeft: 15 }}>
                <Text style={{ width: '100%' }}>{item.locationName}</Text>
                {this.checkContact(item.locationContact)}
              </View>
              {this.clickToCall(item.locationContact)}
              <Button style={{ alignItems: 'flex-end' }} transparent onPress={() => this.navigate(item.locationName)}><Icon name="md-navigate" style={{ color: '#499fcd' }} /></Button>
            </ListItem>
          )}
        />
      </View>
    } else {
      return <Text> </Text>
    }
  }

  showEventQuestion() {
    if (this.state.choices.length != 0) {
      return <View>
        <List style={{ marginTop: 15, marginBottom: 10 }}>
          <ListItem itemDivider style={{ backgroundColor: 'white', justifyContent: 'center', alignContent: 'center', borderBottomWidth: 1.5, borderBottomColor: '#499fcd' }}>
            <Text style={{ color: '#499fcd', fontWeight: 'bold' }} >QUESTION</Text>
          </ListItem>
        </List>

        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 15 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 25 }}>{this.state.question}</Text>
        </View>

        <List
          dataArray={this.state.choices}
          keyboardShouldPersistTaps='always'
          style={{ marginTop: 0, marginBottom: 0 }}
          renderRow={item => (
            <ListItem style={{ flex: 7, flexDirection: 'row' }} onPress={() => this.checkChoice(item, item.checked)}>
              <CheckBox checked={item.checked} onPress={() => this.checkChoice(item, item.checked)} />
              <Text style={{ width: '100%' }}>     {item.choice}</Text>
            </ListItem>
          )}
        />
      </View>
    } else {
      return <Text> </Text>
    }
  }

  voteEvent() {
    var errCount = 0;
    var errDate = '';
    var errLoc = '';
    var errChc = '';


    this.setState({ dateChecked: [] })
    this.setState({ locationChecked: [] })
    this.setState({ choiceChecked: [] })

    if (Object.keys(this.state.dateChoice).length != 0) {
      errDate = this.validateDateChoice(this.state.dateChoice);
    }

    if (Object.keys(this.state.location).length != 0) {
      errLoc = this.validateLocationChoice(this.state.location);
    }

    if (Object.keys(this.state.choices).length != 0) {
      errChc = this.validateChoice(this.state.choices);
    }

    if (errDate != '') {
      if (errDate == 'No Date Checked') {
        this.setState({ dateChecked: [] })
        Alert.alert('Failed to vote', 'Choose the date first.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      } else if (errDate == 'Cannot choose more than 1 Date') {
        this.setState({ dateChecked: [] })
        Alert.alert('Failed to vote', 'Can`t choose more than 1 Date.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      }
    }

    if (errCount == 0 && errLoc != '') {
      if (errLoc == 'No Location Checked') {
        this.setState({ locationChecked: [] })
        Alert.alert('Failed to vote', 'Choose the location first.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      } else if (errLoc == 'Cannot choose more than 1 Location') {
        this.setState({ locationChecked: [] })
        Alert.alert('Failed to vote', 'Can`t choose more than 1 Location.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      }
    }

    if (errCount == 0 && errChc != '') {
      if (errChc == 'No Choice Checked') {
        this.setState({ choiceChecked: [] })
        Alert.alert('Failed to vote', 'Choose the option first.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      } else if (errChc == 'Cannot choose more than 1 option') {
        this.setState({ choiceChecked: [] })
        Alert.alert('Failed to vote', 'Can`t choose more than 1 option.', [{ text: 'Ok', onPress: () => { } }]);
        errCount = errCount + 1;
      }
    }

    if (errCount == 0) {
      this.giveVote();
    }
  }

  giveVote = async (value) => {
    let url = serviceUrl + '/voteresult/giveVote';
    console.log(url)

    let data = {};

    data.eventId = this.state.eventId;
    data.userId = this.state.userId;
    data.chosenLocationNameArray = this.state.locationChecked;
    data.chosenDateTimeArray = this.state.dateChecked;
    data.chosenChoiceNameArray = this.state.choiceChecked;

    console.log(data)

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.text();

      if (respJSON == "SUBMIT VOTE SUCCESS") {
        Alert.alert('Success', 'You have successfully vote for the event.', [{ text: 'Ok', onPress: () => { this.props.navigation.navigate("Main") } }]);
      } else if (respJSON == "SUBMIT VOTE FAILED") {
        Alert.alert('Failed', 'Failed to vote this event.', [{ text: 'Ok', onPress: () => { } }]);
      }
    } catch (error) {
      Alert.alert('Failed', 'Service is not available.', [{ text: 'Ok', onPress: () => { } }]);
      console.log(error)
    }
  }

  validateDateChoice(datechc) {
    var counterDate;

    counterDate = this.getCountDate(datechc, 'checked');
    // console.log("Date Checked: " + counterDate);

    if (counterDate == 0) {
      return 'No Date Checked';
    } else if (this.state.isMultiple == 'N' && counterDate > 1) {
      return 'Cannot choose more than 1 Date';
    } else {
      return 'Ok';
    }
  }

  validateLocationChoice(loc) {
    var counterLocation;

    counterLocation = this.getCountLocation(loc, 'checked');
    // console.log("Location Checked: " + counterLocation);

    if (counterLocation == 0) {
      return 'No Location Checked';
    } else if (this.state.isMultiple == 'N' && counterLocation > 1) {
      return 'Cannot choose more than 1 Location';
    } else {
      return 'Ok';
    }
  }

  validateChoice(chc) {
    var counterChoice;

    counterChoice = this.getCountChoice(chc, 'checked');
    // console.log("Choice Checked: " + counterChoice);

    if (counterChoice == 0) {
      return 'No Choice Checked';
    } else if (this.state.isMultiple == 'N' && counterChoice > 1) {
      return 'Cannot choose more than 1 Choice';
    } else {
      return 'Ok';
    }
  }

  getCountDate(datechc, attr) {
    let count = 0;
    for (let i = 0; i < Object.keys(datechc).length; i++) {
      if (datechc[i][attr] == true) {
        count = count + 1;

        let convertToDate = moment(datechc[i]['eventDate'], 'ddd, DD MMM YYYY').format('YYYY-MM-DD');
        this.state.dateChecked.push(convertToDate);
      }
    }
    return count;
  }

  getCountLocation(loc, attr) {
    let count = 0;
    for (let i = 0; i < Object.keys(loc).length; i++) {
      if (loc[i][attr] == true) {
        count = count + 1;

        this.state.locationChecked.push(loc[i]['locationName']);
      }
    }
    return count;
  }

  getCountChoice(chc, attr) {
    let count = 0;
    for (let i = 0; i < Object.keys(chc).length; i++) {
      if (chc[i][attr] == true) {
        count = count + 1;

        this.state.choiceChecked.push(chc[i]['choice']);
      }
    }
    return count;
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
              <Text style={styles.headerTitle}>Vote</Text>
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
              <Text style={styles.headerTitle}>Vote Result</Text>
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
                  <Text style={{ fontSize: 16, color: 'black' }}><Text style={{ fontWeight: 'bold' }}>{this.state.participants.length}</Text> Participants</Text>
                  <Text style={{ fontSize: 16, color: 'black' }}>Poll Closed Date: {this.state.pollClosedDate}</Text>
                  <Text style={{ fontSize: 16, color: 'black' }}>Created by <Text style={{ fontWeight: 'bold' }}>{this.state.createdBy}</Text>.</Text>
                </View>
              </CardItem>
            </Card>

            <View style={{ flex: 0 }}>
              {this.showEventDate()}
              {this.showEventLocation()}
              {this.showEventQuestion()}

              <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: 15 }}>
                <Button block onPress={() => this.voteEvent()} style={{ alignContent: 'center', justifyContent: 'center', backgroundColor: '#499fcd', borderRadius: 10 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>VOTE</Text>
                </Button>
              </View>
            </View>
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
  textInput: {
    justifyContent: 'center',
    color: 'black',
    fontSize: 16,
    marginRight: 5,
    marginLeft: 5,
    width: '80%',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#efefef',
  },
  listOfFriend: {
    flex: 6,
    alignItems: 'center',
    marginTop: 5,
    marginRight: 25,
    borderBottomWidth: 1.5,
    borderColor: '#efefef',
    padding: 5,
    paddingBottom: 10
  },
  friendListContainer: {
    flex: 0,
    alignItems: 'center',
    marginTop: 15,
    alignContent: 'center'
  },
  addBtn: {
    backgroundColor: 'white',
    height: '95%'
  },
  addParticipantBtn: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: '#499fcd',
    backgroundColor: '#499fcd'
  },
  addParticipantText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
