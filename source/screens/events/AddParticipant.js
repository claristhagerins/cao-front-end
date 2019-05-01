import React from 'react';
import {
  StyleSheet, BackHandler, AsyncStorage, View, TextInput, Text, ListView,
} from 'react-native';
// import {
//   Container, Content, Text, Spinner, Header, Left, Body, Right, Button, Icon, Title,
//   Tab, Tabs, TabHeading, CheckBox, Toast, Root,
//   Form, Item, Label, Input, Textarea, Picker, View, List, ListItem, Thumbnail
// } from 'native-base';
import { Button, Icon, Content, Item, CheckBox, ListItem, Thumbnail, Header, Left, Right, Body } from 'native-base';
import serviceUrl from '../../constant/Url';

export default class AddParticipant extends React.Component {
  _isMounted = false;

  state = {
    searchBar: '',
    userList: [],
    friendName: '',
    friendList: [],
    text: '',
    userChecked: []
  }

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.getUserId();
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Main');
    setTimeout(this.props.navigation.navigate.bind(null, "ContactsStack"), 1);
    return true;
  }

  getUserId() {
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
      // console.log("Resp: " + resp);
      const respJSON = await resp.json();
      // console.log("RespJSON: " + respJSON);

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

  onCheckBoxPress(name) {
    // this.setState({ checkBoxChecked: name })
    let tmp = this.state.userChecked;
    if (tmp.includes(name)) {
      tmp.splice(tmp.indexOf(name), 1);
    } else {
      tmp.push(name);
    }

    this.setState({ userChecked: tmp })
  }

  render() {
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
              <ListItem style={styles.listOfFriend} avatar onPress={() => { this.onCheckBoxPress(item.friendName) }}>
                <Thumbnail small source={require('../../../assets/contacts/pp.png')} />
                <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item.friendName}</Text>
                <CheckBox
                  checked={this.state.userChecked.includes(item.friendName) ? true : false}
                  onPress={() => this.onCheckBoxPress(item.friendName)}
                />
              </ListItem>
            )}
          />
        </Item>
      </Content>;

    let friendListContainer;

    if (this.state.friendList === "Service is not available.") {
      friendListContainer = serviceNotAvailable;
    } else if (this.state.friendList === "No friend(s) found") {
      friendListContainer = friendIsNull;
    } else {
      friendListContainer = friendIsNotNull;
    }

    const button = <Button style={{ backgroundColor: '#499fcd', marginLeft: 10, marginRight: 5 }}>
      <Icon style={{ color: 'white' }} size={50} name="md-search" />
    </Button>;

    return (
      <View style={styles.container}>
        <View style={{ flex: 0, margin: 15, flexDirection: 'row', width: '100%' }}>
          {/* <TextInput
            maxLength={20}
            style={styles.textInput}
            placeholder="Search"
            value={this.state.searchBar}
            onChangeText={(value) => this.setState({ searchBar: value })}
          /> */}

          {/* {button} */}
        </View>

        {friendListContainer}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // marginTop: 24,
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
