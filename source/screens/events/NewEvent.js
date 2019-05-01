import React from 'react';
import {
  StyleSheet, Alert, BackHandler, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform,
  AsyncStorage, TouchableHighlight, ListView
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Calendar } from 'react-native-calendars';
import {
  Container, Content, Text, Spinner, Header, Left, Body, Right, Button, Icon, Title,
  Tab, Tabs, TabHeading, CheckBox, Toast, Root, Fab, Card, CardItem, Radio,
  Form, Item, Label, Input, Textarea, Picker, View, List, ListItem, Thumbnail, InputGroup
} from 'native-base';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import Modal from "react-native-modal";
import serviceUrl from '../../constant/Url';

const _format = 'YYYY-MM-DD'
const _full_format = 'ddd, DD MMM YYYY'
const _today = moment().format(_format)
//const _maxDate = moment().add(15, 'days').format(_format)

export default class NewEvent extends React.Component {
  _isMounted = false;

  initialState = {
    [_today]: { disabled: false }
  }

  state = {
    active: 'true',
    anonymousChecked: false,
    buttonPressed: '',
    chosenDate: new Date(),
    currentTab: 0,
    currentDate: new Date().getDate(),
    friendName: '',
    friendList: [],
    inisiator: '',
    mark: null,
    multipleAnswerChecked: false,
    modalVisible: false,
    pollCloseDate: null,
    pollParticipant: [],
    selectedDay: [],
    selectedForm: 'date',
    searchBar: '',
    text: '',
    time: '',
    userId: '',
    userList: [],
    _markedDates: this.initialState,

    // untuk di kirim ke back end
    action: '',
    choice: [],
    eventName: '',
    eventDescription: '',
    selectedEventSettings: 'P',
    userIdChecked: [],
    userChecked: [],
    locationName: [],
    locationContact: [],
    eventDate: [],
    pollQuestion: '',
    radioSelected: ''
  }

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.setDate = this.setDate.bind(this);
    this.editChoice = this.editChoice.bind(this);
    this.onLocationSelect = this.onLocationSelect.bind(this);

    // this.onDayPress = this.onDayPress.bind(this);
    this.getDataForAddParticipant();
    this.getInisiator();
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentDidMount() {
    // This will load the default value's search results after the view has
    // been rendered
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Toast.toastInstance = null;
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Main');
    return true;
  }

  multipleAnswerCheckBox() {
    var checked = this.state.multipleAnswerChecked;
    if (checked == true) {
      this.setState({ multipleAnswerChecked: false })
    }
    else
      this.setState({ multipleAnswerChecked: true })
  }

  anonymousAnswerCheckBox() {
    var checked = this.state.anonymousChecked;
    if (checked == true) {
      this.setState({ anonymousChecked: false })
    }
    else
      this.setState({ anonymousChecked: true })
  }

  onValueChangeEventSettings(value) {
    this.setState({
      selectedEventSettings: value
    });
  }

  onValueChangeForm(value) {
    this.setState({
      selectedForm: value
    });
  }

  onDaySelect = (day) => {
    this.setState({ selectedDay: this.state.selectedDay.concat([moment(day.dateString).format(_full_format)]) });

    var found = this.getIndex(moment(day.dateString).format(_full_format), this.state.selectedDay)
    if (found == -1) {
      this.setState({ selectedDay: this.state.selectedDay.concat([moment(day.dateString).format(_full_format)]) })
    } else {
      this.removeItem(found)
    }

    const _selectedDay = moment(day.dateString).format(_format);
    let marked = true;
    let selected = true;

    if (this.state._markedDates[_selectedDay]) {
      // Already in marked dates, so reverse current marked state
      marked = !this.state._markedDates[_selectedDay].marked;
      selected = !this.state._markedDates[_selectedDay].selected;
    }

    // Create a new object using object property spread since it should be immutable
    // Reading: https://davidwalsh.name/merge-objects
    const updatedMarkedDates = { ...this.state._markedDates, ...{ [_selectedDay]: { selected } } }

    // Triggers component to render again, picking up the new state
    this.setState({ _markedDates: updatedMarkedDates });
  }

  onDateDelete = (day) => {
    var found = this.getIndex(day, this.state.selectedDay)

    if (found != -1) {
      this.removeItem(found)
    }

    const _selectedDay = moment((new Date(day.substring(5, day.length)))).format('YYYY-MM-DD');
    let selected = true;

    if (this.state._markedDates[_selectedDay]) {
      selected = !this.state._markedDates[_selectedDay].selected;
    }

    const updatedMarkedDates = { ...this.state._markedDates, ...{ [_selectedDay]: { selected } } }

    this.setState({ _markedDates: updatedMarkedDates });
  }


  editChoice(originalChoice, choiceValue) {
    var found = this.getIndex(originalChoice, this.state.choice)

    if (found == -1) {
      console.log("No Choice Found")
    } else {
      const newArray = [...this.state.choice]
      newArray[found] = choiceValue
      this.setState({ choice: newArray })
    }
  }

  getIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }

  removeItem(index) {
    const data = this.state.selectedDay;
    this.setState({
      selectedDay: [...data.slice(0, index), ...data.slice(index + 1)]
    });
  }

  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }

  onLocationSelect = (loc, contact) => {
    let location = loc;
    let cont = contact;

    if (contact == undefined) {
      cont = "";
    } else if (contact.length == 0) {
      cont = "";
    }

    if (this._isMounted == true) {
      if (loc != "") {
        var found = this.getLocIndex(loc, this.state.locationName);
        if (found == -1) {
          this.setState({ locationName: this.state.locationName.concat([location]) });
          this.setState({ locationContact: this.state.locationContact.concat([cont]) })
        }
      }
    }
  }

  onLocationDelete = (loc) => {
    var found = this.getLocIndex(loc, this.state.locationName)
    if (found != -1) {
      this.removeLocItem(found)
    }
  }

  getLocIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }

  removeLocItem(index) {
    const locName = this.state.locationName;
    const locContact = this.state.locationContact;
    this.setState({ locationName: [...locName.slice(0, index), ...locName.slice(index + 1)] });
    this.setState({ locationContact: [...locContact.slice(0, index), ...locContact.slice(index + 1)] });
  }

  handleAddNewChoice() {
    this.setState({
      choice: this.state.choice.concat("")
    });
  }

  onOptionDelete = (opt) => {
    var found = this.getOptIndex(opt, this.state.choice)
    if (found != -1) {
      this.removeOptItem(found)
    }
  }

  getOptIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }

  removeOptItem(index) {
    const data = this.state.choice;
    this.setState({
      choice: [...data.slice(0, index), ...data.slice(index + 1)]
    });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  getDataForAddParticipant() {
    AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
  }

  setUserId(value) {
    this.setState({ userId: value });
    this.getFriendList(this.state.userId);
  }

  getFriendList = async (value) => {
    let url = serviceUrl + '/relationship/showFriendList?userId=' + value;
    console.log(url)

    let data = {};
    data.friendName = this.state.eventName;

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.json();

      if (respJSON.length == 0) {
        this.setState({ friendList: [] })
        this.setState({ friendList: "No friend(s) found" });
      } else if (respJSON != null || respJSON != "") {
        this.setState({ friendList: [] })
        this.insertToFriendList(respJSON);
      }

    } catch (error) {
      this.setState({ friendList: [] })
      this.setState({ friendList: "Service is not available." })
      console.log(error)
    }
  }

  insertToFriendList(data) {
    let fList = data;

    for (let i = 0; i < fList.length; i++) {
      // console.log(data[i].friendId + " " + data[i].friendName);
      let friendId = data[i].friendId;
      let friendName = data[i].friendName;

      const updateFriendList = { ...this.state.friendList, ...{ ["Friend " + (i + 1)]: { friendId, friendName } } }

      this.setState({ friendList: updateFriendList });
    }
  }

  onCheckBoxPress(id, name) {
    const tmp = this.state.userIdChecked;
    const tmp2 = this.state.userChecked;

    var found1 = this.getParticipantIndex(id, this.state.userIdChecked)
    var found2 = this.getParticipantIndex(name, this.state.userChecked)

    if (found1 != -1) {
      this.setState({ userIdChecked: [...tmp.slice(0, found1), ...tmp.slice(found1 + 1)] });
    } else {
      tmp.push(id);
      this.setState({ userIdChecked: tmp });
    }

    if (found2 != -1) {
      this.setState({ userChecked: [...tmp2.slice(0, found2), ...tmp2.slice(found2 + 1)] });
    } else {
      tmp2.push(name);
      this.setState({ userChecked: tmp2 });
    }
  }

  deleteParticipant = (nama) => {
    var found = this.getParticipantIndex(nama, this.state.userChecked)
    if (found != -1) {
      const data = this.state.userChecked;
      this.setState({ userChecked: [...data.slice(0, found), ...data.slice(found + 1)] });
    }
  }

  getParticipantIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }

  getInisiator() {
    AsyncStorage.getItem('userId').then((value) => this.setInisiator(value));
  }

  setInisiator(value) {
    this.setState({ inisiator: value });
  }

  validation() {
    this.deleteEmptyOptions();
    this.setState({ eventDate: [] });
    this.setState({ pollParticipant: [] });

    if (this.state.selectedDay.length != 0) {
      for (let i = 0; i < this.state.selectedDay.length; i++) {
        let date = this.state.selectedDay[i];
        let convertToDate = moment(date, 'ddd, DD MMM YYYY').format('YYYY-MM-DD');

        this.state.eventDate.push(convertToDate)
      }
    }

    let closeDate = this.state.pollCloseDate;
    let convertFormatCloseDate = moment(closeDate, 'LLLL').format('YYYYMMDD');

    let dateNow = this.state.currentDate;
    let convertFormatNow = moment(dateNow, 'LLLL').format('YYYYMMDD');

    this.state.pollParticipant[0] = this.state.inisiator;
    if (this.state.userIdChecked.length != 0) {
      for (let i = 0; i < this.state.userIdChecked.length; i++) {
        let participant = this.state.userIdChecked[i];
        this.state.pollParticipant.push(participant);
      }
    }

    // if (this.state.selectedEventSettings == 'F' && (this.state.userChecked.length == 0 || this.state.userChecked.length < 2)) {
    //   Toast.show({ text: 'Choose minimum 2 participants', type: 'warning', buttonText: 'OK', duration: 3000 })
    // } 

    if (this.state.eventName.length == 0) {
      Toast.show({ text: 'Event name cannot be empty', type: 'warning', buttonText: 'OK', duration: 3000 });
    } else if (this.state.pollCloseDate == null) {
      Toast.show({ text: 'Poll close date cannot be empty', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (convertFormatCloseDate < convertFormatNow) {
      Toast.show({ text: 'Poll close date must be greater than current time', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.userChecked.length == 0 || this.state.userChecked.length < 2) {
      Toast.show({ text: 'Choose minimum 2 participants', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.eventDate.length == 0 && this.state.locationName.length == 0 && this.state.pollQuestion.length == 0) {
      Toast.show({ text: 'You should fill the form', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.eventDate.length != 0 && this.state.eventDate.length < 2) {
      Toast.show({ text: 'Minimum 2 date options', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.locationName.length != 0 && this.state.locationName.length < 2) {
      Toast.show({ text: 'Minimum 2 location options', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.pollQuestion.length != 0 && (this.state.choice.length != 0 && this.state.choice.length < 2)) {
      Toast.show({ text: 'Minimum 2 options', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else if (this.state.choice[0] == '' || this.state.choice[1] == '') {
      Toast.show({ text: 'Options cannot be empty', type: 'warning', buttonText: 'OK', duration: 3000 })
    } else {
      this.publishPoll();
    }
  }

  deleteEmptyOptions() {
    for (let i = 0; i < this.state.choice.length; i++) {
      var found = this.getEmptyIndex('', this.state.choice[i])
      if (found != -1) {
        const data = this.state.choice;
        this.setState({
          choice: [...data.slice(0, found), ...data.slice(found + 1)]
        });
      }
    }
  }

  getEmptyIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }

  publishPoll = async () => {
    try {
      Alert.alert(
        'Are you sure to publish this poll?',
        'Make sure the data is correct',
        [
          { text: 'CANCEL', onPress: () => { }, style: 'cancel' },
          { text: 'YES', onPress: () => this.updateAction("PUBLISH") },
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  savePoll = async () => {
    try {
      // this.saveDraft("SAVE");
      Toast.show({ text: 'Poll Saved!', type: 'success', buttonText: 'Okay', duration: 3000 })
    } catch {
      Toast.show({ text: 'Cant save poll!', type: 'warning', buttonText: 'Okay', duration: 3000 })
    }
  }

  updateAction(act) {
    this.setState({ action: act });
    this.validation();
    this.createNewEvent();
    this.successCreatingPoll();
  }

  saveDraft(act) {
    this.setState({ action: act });
    this.createNewEvent();
  }

  createNewEvent = async () => {
    let url = serviceUrl + '/events/createNewEvent'
    let data = {};

    data.action = this.state.action;
    data.eventName = this.state.eventName;
    data.eventDescription = this.state.eventDescription;
    // data.pollStatus = this.state.selectedEventSettings;
    data.pollStatus = "F";
    data.userId = this.state.pollParticipant;
    data.locationName = this.state.locationName;
    data.locationContact = this.state.locationContact;
    data.eventDate = this.state.eventDate;
    data.question = this.state.pollQuestion;
    data.choice = this.state.choice;
    data.createdBy = this.state.userId;
    data.pollClosedDate = this.state.pollCloseDate;

    if (this.state.multipleAnswerChecked == true) {
      data.isMultiple = 'Y';
    } else if (this.state.multipleAnswerChecked == false) {
      data.isMultiple = 'N';
    }

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      // const respJSON = await resp.text();
    } catch (error) {
      console.log(error)
    }
  }

  

  successCreatingPoll = async () => {
    try {
      Alert.alert(
        'Poll Created!',
        'You can check and edit the poll in Event`s menu',
        [
          { text: 'Ok', onPress: () => this.props.navigation.navigate('Main') },
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  // showCard() {
  //   let closedDate;

  //   if (this.state.pollCloseDate != null) {
  //     closedDate = <Text style={{ fontSize: 16, marginTop: 10 }}>Poll Closed on {this.state.pollCloseDate}</Text>;
  //   }

  //   if (this.state.eventName != "" || this.state.eventDescription != "" || this.state.pollCloseDate != null) {
  //     return <View>
  //       <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 5, color: '#499fcd' }}>{this.state.eventName}</Text>
  //       <Text style={{ fontSize: 16 }}>{this.state.eventDescription}</Text>
  //       {closedDate}
  //     </View>;
  //   } else {
  //     return <View style={{ margin: 15, flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#8e8e8e' }}> No Preview Available</Text></View>;
  //   }
  // }

  // showLocation() {
  //   if (this.state.locationName.length != 0 && this.state.locationName.length >= 2 && this.state.multipleAnswerChecked == false) {
  //     return <View>
  //       <Text style={{ fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 20 }}>
  //         Choose Event Location:
  //       </Text>
  //       <List
  //         dataArray={this.state.locationName}
  //         keyboardShouldPersistTaps='always'
  //         style={{ marginRight: 15, marginTop: 0, marginBottom: 0 }}
  //         renderRow={item => (
  //           this.state.radioSelected == item ?
  //             <ListItem style={{ flex: 0, flexDirection: 'row' }} onPress={() => this.locationChecked(item)}>
  //               <Radio
  //                 selected={true}
  //                 onPress={() => this.locationChecked(item)}
  //               />
  //               <Text style={{ width: '90%' }}>  {item}</Text>
  //             </ListItem>
  //             :
  //             <ListItem style={{ flex: 0, flexDirection: 'row' }} onPress={() => this.locationChecked(item)}>
  //               <Radio
  //                 selected={false}
  //                 onPress={() => this.locationChecked(item)}
  //               />
  //               <Text style={{ width: '90%' }}>  {item}</Text>
  //             </ListItem>
  //         )}
  //       />
  //     </View>
  //   } else {
  //     return <Text> </Text>;
  //   }
  // }

  // locationChecked(item) {
  //   let tmp = this.state.radioSelected;

  //   var found = this.getLocIndex(item, this.state.radioSelected)

  //   if (found != -1) {
  //     this.setState({ radioSelected: [...tmp.slice(0, found), ...tmp.slice(found + 1)] });
  //   } else {
  //     this.setState({ radioSelected: item })
  //   }
  //   console.log("radio: " + this.state.radioSelected);
  //   console.log(this.state.radioSelected == item);
  // }

  // showQuestionAndChoice() {
  //   return <Text> </Text>
  // }

  publishButtonDisplay() {
    if (this.state.eventName != "" || this.state.eventDescription != "" || this.state.pollCloseDate != null) {
      return <Button block style={styles.publishButton} onPress={() => this.validation()}>
        <Text style={{ fontWeight: 'bold' }}>Publish Poll</Text>
      </Button>
    }
  }

  addParticipantView() {
    if (this.state.userChecked == 0) {
      return <View>
        <Button block style={styles.chooseFriendBtn} onPress={() => this.setModalVisible(true)}><Text style={{ color: 'white', fontWeight: "bold" }}>Participant</Text><Icon style={styles.addFriendIcon} name='md-person-add' /></Button>
        <Container style={styles.participantContainer}><Text style={{ color: '#b7b7b7' }}>There is no participant yet. Minimum 2 participants.</Text></Container>
      </View>
    } else if (this.state.userChecked != null) {
      return <View>
        <Button block style={styles.chooseFriendBtn} onPress={() => this.setModalVisible(true)}><Text style={{ color: 'white', fontWeight: "bold" }}>Participant</Text><Icon style={styles.addFriendIcon} name='md-person-add' /></Button>
        <ScrollView>
          <Content style={{ width: '100%' }}>
            <List
              dataArray={this.state.userChecked}
              renderRow={item => (
                <ListItem style={styles.listOfFriend} avatar>
                  <Thumbnail small source={require('../../../assets/contacts/pp.png')} />
                  <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item}</Text>
                  <Button transparent style={{ justifyContent: 'center', marginTop: 0, marginBottom: 0 }} onPress={() => this.deleteParticipant(item)}>
                    <Icon style={{ color: '#d65555' }} name='md-close' />
                  </Button>
                </ListItem>
              )}
            />
          </Content>
        </ScrollView>
      </View>
    }
  }

  render() {
    //Poll Settings For Friend-----------------------------------------------------------------------
    const isFriendType = <Button block style={styles.chooseFriendBtn} onPress={() => this.setModalVisible(true)}><Text style={{ color: 'white', fontWeight: "bold" }}>Participant</Text><Icon style={styles.addFriendIcon} name='md-person-add' /></Button>
    const noParticipant = <Container style={styles.participantContainer}><Text style={{ color: '#b7b7b7' }}>There is no participant yet. Minimum 2 participants.</Text></Container>
    const participantList =
      <ScrollView>
        <Content style={{ width: '100%' }}>
          <List
            dataArray={this.state.userChecked}
            renderRow={item => (
              <ListItem style={styles.listOfFriend} avatar>
                <Thumbnail small source={require('../../../assets/contacts/pp.png')} />
                <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item}</Text>
                <Button transparent style={{ justifyContent: 'center', marginTop: 0, marginBottom: 0 }} onPress={() => this.deleteParticipant(item)}>
                  <Icon style={{ color: '#d65555' }} name='md-close' />
                </Button>
              </ListItem>
            )}
          />
        </Content>
      </ScrollView>;

    let chooseFriend;
    let participantContainer;

    if (this.state.selectedEventSettings === "F") {
      chooseFriend = isFriendType;

      if (this.state.userChecked == 0) {
        participantContainer = noParticipant;
      } else if (this.state.userChecked != null) {
        participantContainer = participantList;
      }
    }
    //-----------------------------------------------------------------------------------------------

    //Poll Form--------------------------------------------------------------------------------------
    const _dateNull = <View style={{ flex: 0 }}><Text style={{ color: '#8e8e8e', marginBottom: 15, marginRight: 15, marginLeft: 15 }}>You have not selected the date of the event. Minimum 2 date options.</Text></View>;

    const _dateNotnull =
      <List
        dataArray={this.state.selectedDay}
        style={{ marginRight: 15, marginTop: 0, marginBottom: 0 }}
        renderRow={item => (
          <ListItem style={{ flex: 0, flexDirection: 'row' }}>
            <Text style={{ width: '90%' }}>
              {item}
            </Text>
            <Button transparent style={{ justifyContent: 'center', marginTop: 0, marginBottom: 0 }} onPress={() => this.onDateDelete(item)}>
              <Icon style={{ color: '#d65555' }} name='md-close' />
            </Button>
          </ListItem>
        )}
      />;

    let dateForm;

    if (this.state.selectedDay.length === 0 || this.state.selectedDay === null) {
      dateForm = _dateNull;
    } else {
      dateForm = _dateNotnull;
    }

    const datePickerForForm =
      <Container style={{ margin: 15, flex: 0, height: '100%' }}>
        <Calendar
          onDayPress={this.onDaySelect}
          minDate={_today}
          hideExtraDays
          horizontal={true}
          markedDates={this.state._markedDates}
        />

        <Text style={{ fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 20 }}>
          Event Date List:
        </Text>

        {dateForm}
      </Container>;

    const _locationNull = <View style={{ flex: 0, justifyContent: 'center' }}><Text style={{ color: '#8e8e8e', marginBottom: 15, marginRight: 15, marginLeft: 15 }}>You have not selected the location of the event. Minimum 2 location options.</Text></View>;
    const _locationNotnull =
      <List
        dataArray={this.state.locationName}
        style={{ marginRight: 15, marginTop: 0, marginBottom: 0 }}
        renderRow={item => (
          <ListItem style={{ flex: 0, flexDirection: 'row' }}>
            <Text style={{ width: '90%' }}>
              {item}
            </Text>
            <Button transparent style={{ justifyContent: 'center', marginTop: 0, marginBottom: 0 }} onPress={() => this.onLocationDelete(item)}>
              <Icon style={{ color: '#d65555' }} name='md-close' />
            </Button>
          </ListItem>
        )}
      />;

    let locationForm;

    if (this.state.locationName.length === 0 || this.state.locationName === null) {
      locationForm = _locationNull;
    } else {
      locationForm = _locationNotnull;
    }

    const locationForForm =
      <Container style={styles.locationContainer}>
        <GooglePlacesAutocomplete
          placeholder='Search'
          minLength={2} // minimum length of text to search
          autoFocus={false}
          returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          keyboardAppearance={'always'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
          listViewDisplayed='false'    // true/false/undefined
          fetchDetails={true}
          // renderDescription={(row) => row.description} // custom description render
          renderDescription={row => row.description || row.formatted_address || row.name}
          // onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          //   console.log(data, details);
          // }}

          onPress={(text, details = null) => {
            //here add what you want to do with the place selected (place selected is inside text.description
            this.onLocationSelect(details.name, details.formatted_phone_number);
            // console.log(details.name);
            // console.log(details.formatted_phone_number);
          }}

          addLoc={(text) => {
            //here add what you want to do with the place selected (place selected is inside text.description
            this.onLocationSelect(text, "");
          }}

          getDefaultValue={() => ''}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: 'AIzaSyBuAY-xv_Zjwz4xzjHeQ-0tdwBIrStgxAY',
            // key: '',
            language: 'en', // language of the results
            types: 'establishment', // default: 'geocode',
          }}

          styles={{
            textInputContainer: {
              // flex: 4,
              width: '90%'
            },
            description: {
              fontWeight: 'bold',
              flex: 0,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
              flex: 0,
            }
          }}

          // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
          // currentLocationLabel="Current location"
          enablePoweredByContainer={false}
          //nearbyPlacesAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          nearbyPlacesAPI='GooglePlacesSearch'

          GoogleReverseGeocodingQuery={{
            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          }}

          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance',
            type: 'cafe'
          }}

          GooglePlacesDetailsQuery={{
            // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
            fields: 'formatted_address',
          }}

          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          //predefinedPlaces={[homePlace, workPlace]}

          debounce={1000} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        // onPressButtonAddLocation={text => { this.onLocationSelect(text) }}
        />

        <Text style={{ fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 20 }}>
          Event Location List:
        </Text>

        {locationForm}
      </Container>;

    const _choiceNotNull =
      <KeyboardAvoidingView behavior="padding" style={{ flex: 0 }} >
        <View>
          <List
            dataArray={this.state.choice}
            style={{ marginTop: 0, marginBottom: 0, }}
            renderRow={item => (
              <ListItem style={{ flex: 0, flexDirection: 'row', width: '100%', borderBottomWidth: 0 }}>
                <Item style={{ flex: 0, }}>
                  <Input
                    placeholder='Add Choice Here'
                    value={item}
                    onChangeText={(value) => this.editChoice(item, value)}
                    style={{ flex: 1, }}
                  />
                  <Button transparent style={{ justifyContent: 'center', marginTop: 0, marginBottom: 0 }} onPress={() => this.onOptionDelete(item)}>
                    <Icon style={{ color: '#d65555' }} name='md-close' />
                  </Button>
                </Item>
              </ListItem>)}
          />
        </View>
      </KeyboardAvoidingView>;

    choice = _choiceNotNull;

    const textForForm =
      <Container style={{ flex: 0, height: '100%', paddingLeft: 15, paddingRight: 30, paddingTop: 5, backgroundColor: 'white', elevation: 1 }}>
        <View>
          <Form style={{ flex: 0 }}>
            <Text style={{ fontWeight: 'bold', color: '#1da1f2', marginTop: 5 }}>
              Question ({this.state.pollQuestion.length}/50 characters)
          </Text>
            <Textarea
              rowSpan={5}
              maxLength={50}
              bordered
              placeholder="Type poll question here."
              placeholderTextColor="#e2e2e2"
              value={this.state.pollQuestion}
              onChangeText={(value) => this.setState({ pollQuestion: value })}
              style={{ padding: 6, color: 'black', fontSize: 16 }} />
          </Form>
        </View>

        <View style={{ paddingTop: 15, alignContent: 'flex-end' }}><Text style={{ color: '#8e8e8e' }}>*Minimum 2 options.</Text></View>
        <Button block style={{ marginTop: 10, justifyContent: 'center', backgroundColor: '#499fcd' }} onPress={() => this.handleAddNewChoice()}><Text style={{ fontWeight: 'bold' }}>Add New Choice</Text></Button>
        {choice}
      </Container>;

    let eventForm;

    if (this.state.buttonPressed === "date") {
      eventForm = datePickerForForm;
    } else if (this.state.buttonPressed === "location") {
      eventForm = locationForForm;
    } else if (this.state.buttonPressed === "text") {
      eventForm = textForForm;
    }

    //-----------------------------------------------------------------------------------------------
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const serviceNotAvailable = <View style={styles.friendListContainer}><Text style={{ color: '#8e8e8e' }}>Service is not available.</Text></View>
    const friendIsNull = <View style={styles.friendListContainer}><Text style={{ color: '#8e8e8e' }}>There is no friend(s) yet.</Text></View>
    const friendIsNotNull =
      <Content>
        <Item>
          <ListView
            enableEmptySections={true}
            dataSource={ds.cloneWithRows(this.state.friendList)}
            renderRow={item => (
              <ListItem style={styles.listOfFriend} avatar onPress={() => { this.onCheckBoxPress(item.friendId, item.friendName) }}>
                <Thumbnail small source={require('../../../assets/contacts/pp.png')} />
                <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item.friendName}</Text>
                <CheckBox
                  checked={this.state.userChecked.includes(item.friendName) ? true : false}
                  onPress={() => this.onCheckBoxPress(item.friendId, item.friendName)}
                />
              </ListItem>
            )}
          />
        </Item>
      </Content>;

    let friendListContainer;
    let addOrBack;

    if (this.state.friendList === "Service is not available.") {
      friendListContainer = serviceNotAvailable;
    } else if (this.state.friendList === "No friend(s) found") {
      friendListContainer = friendIsNull;
      addOrBack = <Text style={styles.addParticipantText}>BACK</Text>
    } else {
      friendListContainer = friendIsNotNull;
      addOrBack = <Text style={styles.addParticipantText}>ADD</Text>
    }

    //===============================================================================

    return (
      <Root>
        <ScrollView keyboardShouldPersistTaps='always'>
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <View style={styles.container}>
              <Header style={styles.header}>
                <Left style={{ flex: 1 }}>
                  <Button transparent onPress={() => this.handleBackButtonClick()}>
                    <Icon style={styles.backBtn} name='arrow-back' />
                  </Button>
                </Left>
                <Body style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={styles.headerTitle}>New Event</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Button rounded style={styles.saveBtn}
                    onPress={() => this.validation()}>
                    <Text style={{ color: '#499fcd', fontWeight: 'bold', fontSize: 14 }}>PUBLISH</Text>
                  </Button>
                </Right>
              </Header>

              <Tabs
                tabContainerStyle={{ elevation: 0, backgroundColor: '#499fcd' }}
                tabBarUnderlineStyle={{ height: 0 }}
                initialPage={this.state.currentPage}
                onChangeTab={({ i }) => this.setState({ currentTab: i })}
                locked={true}>

                {/* Settings Tab */}
                <Tab heading={<TabHeading style={this.state.currentTab === 0 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-settings" horizontal style={this.state.currentTab === 0 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 0 ? styles.activeTabText : styles.tabText}>Edit</Text></TabHeading>}>
                  <Content style={{ flex: 0, height: '100%' }} scrollEnabled={true}>
                    <Form style={{ flex: 0, marginTop: 10 }}>
                      <Item stackedLabel style={styles.textInputLine}>
                        <Label style={{ color: '#333333', fontWeight: 'bold' }}>Events Name ({this.state.eventName.length}/30 characters)<Text style={{ color: '#dd0606' }}>*</Text></Label>
                        <Input
                          maxLength={30}
                          style={styles.textInput}
                          placeholder="Example: Daily Meeting."
                          placeholderTextColor="#e2e2e2"
                          value={this.state.eventName}
                          onChangeText={(value) => this.setState({ eventName: value })}
                        />
                      </Item>

                      <Text style={styles.eventDescriptionText}>
                        Event Description ({this.state.eventDescription.length}/100 characters)
                      </Text>

                      <Textarea
                        rowSpan={3}
                        maxLength={100}
                        bordered
                        placeholder="Type event description here."
                        placeholderTextColor="#e2e2e2"
                        value={this.state.eventDescription}
                        onChangeText={(value) => this.setState({ eventDescription: value })}
                        style={styles.textArea} />
                    </Form>

                    {/* Poll Settings */}
                    <Text style={{ width: '20%', fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 20, marginBottom: 10 }}>
                      Settings:
                    </Text>

                    {/* <Text style={{ marginLeft: 15, marginTop: 15 }}>Poll Close Date<Text style={{ color: '#dd0606', fontWeight: 'bold' }}>*</Text></Text> */}
                    <View style={{ flex: 0, flexDirection: 'row' }}>
                      <DatePicker
                        style={{ width: '50%', marginLeft: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}
                        date={this.state.pollCloseDate}
                        mode="datetime"
                        placeholder="Select Poll Close Date"
                        format="dddd, LL HH:mm"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                          dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 0
                          },
                          dateInput: {
                            position: 'absolute',
                            left: 35,
                            fontWeight: 'bold',
                            fontSize: 30,
                            borderWidth: 0,
                          }
                        }}
                        onDateChange={(date) => { this.setState({ pollCloseDate: date }) }}
                      />
                    </View>

                    <ListItem onPress={() => this.multipleAnswerCheckBox()} style={styles.contentMargin}>
                      <CheckBox checked={this.state.multipleAnswerChecked} onPress={() => this.multipleAnswerCheckBox()} color="black" />
                      <Text>  Multiple Answers</Text>
                    </ListItem>

                    {/* <ListItem onPress={() => this.anonymousAnswerCheckBox()} style={styles.contentMargin}>
                      <CheckBox checked={this.state.anonymousChecked} color="black" />
                      <Text>  Anonymous</Text>
                    </ListItem> */}

                    {/* Poll Type */}
                    <Text style={{ width: '100%', fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 15 }}>
                      Select Poll Participant
                    </Text>

                    {/* <Form style={{ flexDirection: "row", flex: 0, marginTop: 5 }}>
                      <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        style={styles.pollSettings}
                        selectedValue={this.state.selectedEventSettings}
                        onValueChange={this.onValueChangeEventSettings.bind(this)}
                      >
                        <Picker.Item label="Public" value="P" />
                        <Picker.Item label="Private" value="F" />
                      </Picker>
                      {chooseFriend}
                    </Form>
                    {participantContainer} */}
                    {this.addParticipantView()}
                    {/* {this.publishButtonDisplay()} */}
                  </Content>
                </Tab>

                {/* Form Tabs */}
                <Tab heading={<TabHeading style={this.state.currentTab === 1 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-paper" horizontal style={this.state.currentTab === 1 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 1 ? styles.activeTabText : styles.tabText}>Form</Text></TabHeading>}>
                  <Content scrollEnabled={true} style={{ flex: 0, height: '100%' }}>
                    <Text style={{ margin: 15, marginBottom: 5, color: '#8e8e8e' }}>
                      You can predetermine dates/text/location which can be selected by the participants.
                </Text>

                    <View style={{ flexDirection: "row", flex: 3, marginTop: 5 }}>
                      <Button info onPress={() => this.setState({ buttonPressed: 'date' })} style={{ flex: 3, marginLeft: 5, justifyContent: 'center', backgroundColor: '#499fcd' }}><Text style={styles.boldAndWhiteText}>Date/Time</Text></Button>
                      <Button info onPress={() => this.setState({ buttonPressed: 'location' })} style={{ flex: 3, marginLeft: 5, justifyContent: 'center', backgroundColor: '#499fcd' }}><Text style={styles.boldAndWhiteText}>Location</Text></Button>
                      <Button info onPress={() => this.setState({ buttonPressed: 'text' })} style={{ flex: 3, marginLeft: 5, marginRight: 5, justifyContent: 'center', backgroundColor: '#499fcd' }}><Text style={styles.boldAndWhiteText}>Text</Text></Button>
                    </View>

                    {eventForm}

                  </Content>
                </Tab>

                {/* Preview Tabs */}
                {/* <Tab heading={<TabHeading style={this.state.currentTab === 2 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-eye" horizontal style={this.state.currentTab === 2 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 2 ? styles.activeTabText : styles.tabText}>Preview</Text></TabHeading>}>
                  <Container style={{ flex: 0, height: '100%' }}>
                    <View style={{ flex: 0, margin: 15 }}>
                      <Card>
                        <CardItem>
                          <Body>
                            {this.showCard()}
                          </Body>
                        </CardItem>
                      </Card>
                      {this.showDatePicker()}
                      {this.showLocation()}
                      {this.showQuestionAndChoice()}
                      {this.publishButtonDisplay()}
                    </View>
                  </Container>
                </Tab> */}
              </Tabs>

              <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}
                hasBackdrop={true}>
                <View style={styles.addParticipantContainer}>
                  <Header style={styles.participantHeader}>
                    <Left style={{ flex: 0 }}></Left>
                    <Body style={{ alignItems: 'flex-start', flex: 3, }}>
                      <Text style={styles.headerTitle}>Add Participant</Text>
                    </Body>
                    <Right style={{ flex: 1 }}>
                      <Button style={styles.saveBtn} block onPress={() => { this.setModalVisible(!this.state.modalVisible) }}>
                        {addOrBack}
                      </Button>
                    </Right>
                  </Header>

                  {friendListContainer}
                </View>
              </Modal>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </Root>
    );
  }
}

NewEvent.propTypes = {
  addLoc: PropTypes.string,
  onPress: PropTypes.func
}

NewEvent.defaultProps = {
  addLoc: '',
  onPress: () => { },
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#499fcd',
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
  saveBtn: {
    backgroundColor: 'white',
    height: '95%'
  },
  addBtn: {
    backgroundColor: 'white',
    height: '95%',
    alignItems: 'center'
  },
  planeBtn: {
    color: '#499fcd'
  },
  contentMargin: {
    marginLeft: 15,
    marginRight: 15
  },
  tabIcon: {
    color: '#2d7196',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeTabIcon: {
    color: '#499fcd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeTabStyle: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'white',
    color: '#499fcd',
  },
  tabStyle: {
    backgroundColor: '#499fcd',
    color: '#2d7196',
  },
  activeTabText: {
    color: '#499fcd'
  },
  tabText: {
    color: '#2d7196'
  },
  textInputLineError: {
    marginRight: 15,
    marginLeft: 15,
    borderColor: '#dd0606'
  },
  textInputLine: {
    marginRight: 15,
    marginLeft: 15,
    borderColor: '#e2e2e2'
  },
  textInput: {
    justifyContent: 'center',
    color: 'black',
    fontSize: 16,
    marginTop: 6
  },
  textArea: {
    margin: 15,
    padding: 6,
    color: 'black',
    fontSize: 16,
  },
  eventDescriptionText: {
    marginLeft: 15,
    color: '#333333',
    marginTop: 15,
    fontWeight: 'bold'
  },
  pollForm: {
    width: '60%',
    marginLeft: 10,
    marginRight: 10,
    flex: 0
  },
  pollSettings: {
    width: '20%',
    marginLeft: 10,
    marginRight: 5,
    flex: 0
  },
  addFriendIcon: {
    color: 'white'
  },
  chooseFriendBtn: {
    backgroundColor: '#499fcd',
    borderRadius: 15,
    marginRight: 15,
    marginLeft: 15,
    marginTop: 10,
    flex: 0,
    // width: '50%',
  },
  participantContainer: {
    flex: 0,
    height: '100%',
    margin: 15,
    alignItems: 'center',
  },
  addEventFormBtn: {
    color: '#499fcd',
  },
  addEventFormIcon: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  formPicker: {
    width: '90%',
    marginLeft: 10,
    marginRight: 30,
    flex: 0
  },
  boxTemplate: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 15,
    marginBottom: 10,
    height: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  formType: {
    flexDirection: 'row',
    flex: 0,
    margin: 5
  },
  boldAndWhiteText: {
    fontWeight: 'bold',
    color: 'white'
  },
  locationContainer: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    flex: 0,
    height: '100%'
  },
  searchBar: {
    borderWidth: 0.3,
    borderRadius: 50,
    borderColor: 'black',
  },
  locationTextInput: {
    justifyContent: 'center',
    color: 'black',
    fontSize: 16,
    paddingLeft: 15,
    marginRight: 5
  },
  participantHeader: {
    backgroundColor: '#499fcd',
    flex: 0,
    borderRadius: 15
  },
  addParticipantContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  listOfFriend: {
    flex: 6,
    alignItems: 'center',
    marginTop: 5,
    marginRight: 25,
    borderBottomWidth: 1.5,
    borderColor: '#efefef',
    padding: 5,
    paddingBottom: 10,
  },
  addParticipantBtn: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'white',
    backgroundColor: 'white'
  },
  addParticipantText: {
    color: '#499fcd',
    fontSize: 14,
    fontWeight: 'bold',
  },
  publishButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: '#499fcd',
    backgroundColor: '#499fcd',
    margin: 15
  },
  friendListContainer: {
    flex: 0,
    alignItems: 'center',
    marginTop: 15,
    alignContent: 'center'
  },
})
