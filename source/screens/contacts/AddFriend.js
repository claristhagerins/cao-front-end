import React from 'react';
import { StyleSheet, BackHandler, AsyncStorage, Alert } from 'react-native';
import {
  Container, Content, Text, Spinner, Header, Left, Body, Right, Button, Icon, Title,
  Tab, Tabs, TabHeading, CheckBox, Toast, Root,
  Form, Item, Label, Input, Textarea, Picker, View, List, ListItem, Thumbnail
} from 'native-base';
import serviceUrl from '../../constant/Url';

export default class NewEvent extends React.Component {
  _isMounted = false;

  state = {
    searchBar: '',
    userIdToPass: '',
    userNameToPass: '',
    userList: [],
    userId: '',
    userName: '',
    loading: false
  }

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.getUserIdAndUserName();
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
    Toast.toastInstance = null;
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Main');
    setTimeout(this.props.navigation.navigate.bind(null, "ContactsStack"), 1);
    return true;
  }

  getUserIdAndUserName() {
    AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
    AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
  }

  setUserId(value) { this.setState({ userIdToPass: value }) }
  setUserName(value) { this.setState({ userNameToPass: value }) }

  checkSearchBar(value) {
    if (value == null || value == '') {
      this.setState({ userList: [] })
      this.setState({ userList: "We need you to fill the search box first so we know which one they are." })
    } else {
      this.setState({ userList: [] })
      this.searchFriend(this.state.userIdToPass);
    }
  }

  searchFriend = async (value) => {
    this.setState({ loading: true });
    let url = serviceUrl + '/relationship/searchFriend?userId=' + value;
    console.log(url);

    let data = {};
    data.friendName = this.state.searchBar;

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.json();

      if (respJSON.length == 0) {
        this.setState({ userList: [] })
        this.setState({ userList: "Username not found." });
      } else if (respJSON != null || respJSON != "") {
        this.setState({ userList: [] })
        this.viewUserList(respJSON);
      }

      this.setState({ loading: false });

    } catch (error) {
      this.setState({ userList: [] })
      this.setState({ userList: "Service is not available." })
    }
  }

  viewUserList(data) {
    let uList = data;

    for (let i = 0; i < uList.length; i++) {
      // console.log(data[i].friendId + " " + data[i].friendName);
      let userId = data[i].friendId;
      let userName = data[i].friendName;
      let status = data[i].friendStatus;

      const updateUserList = { ...this.state.userList, ...{ ["User " + (i + 1)]: { userId, userName, status } } }

      this.setState({ userList: updateUserList });
    }
  }

  checkFriend(friendId, friendName, stat) {
    if (stat == "Not a Friend") {
      return <Button onPress={() => this.addFriend(friendId, friendName)} style={{ width: '20%', backgroundColor: '#499FCD', alignItems: 'flex-end', alignItems: 'center', justifyContent: 'center', margin: 5 }}><Text style={{ color: 'white', borderWidth: 0 }}>ADD</Text></Button>;
    } else if (stat == "Friend") {
      return <Button disabled={true} style={{ width: '20%', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', margin: 5 }}><Text style={{ color: '#499FCD', borderWidth: 0 }}>ADDED</Text></Button>;
    }
  }

  addFriend = async (friendId, friendName) => {
    let url = serviceUrl + '/relationship/addFriend';
    console.log(url);

    let data = {};

    data.userId = this.state.userIdToPass;
    data.userName = this.state.userNameToPass;
    data.friendId = friendId;
    data.friendName = friendName;

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.text();

      if (respJSON == "Friend Added") {
        this.addFriendSuccess();
        this.checkSearchBar(this.state.searchBar);
      }
    } catch (error) {
      this.setState({ userList: [] })
      this.setState({ userList: "Service is not available." })
    }
  }

  addFriendSuccess = async () => {
    try {
      Alert.alert(
        'Success',
        'Friend added',
        [
          {

            text: 'Ok', onPress: () => {}
          }
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const serviceNotAvailable = <Container style={styles.userListContainer}><Text style={{ color: '#8e8e8e' }}>Service is not available.</Text></Container>
    const searchBarNull = <Container style={styles.userListContainer}><Text style={{ color: '#8e8e8e' }}>We need you to fill the search box first so we know which one they are.</Text></Container>
    const friendIsNull = <Container style={styles.userListContainer}><Text style={{ color: '#8e8e8e' }}>Username not found.</Text></Container>

    const friendIsNotNull =
      <List
        dataArray={this.state.userList}
        style={{ marginRight: 10, marginTop: 0, marginBottom: 0 }}
        keyboardShouldPersistTaps='always'
        renderRow={item => (
          <ListItem style={styles.listOfUser} avatar>
            <Thumbnail medium source={require('../../../assets/contacts/pp.png')} />
            <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item.userName}</Text>
            {this.checkFriend(item.userId, item.userName, item.status)}
          </ListItem>
        )}
      />;

    let userListContainer;

    if (this.state.userList === "Service is not available.") {
      userListContainer = serviceNotAvailable;
    } else if (this.state.userList === "We need you to fill the search box first so we know which one they are.") {
      userListContainer = searchBarNull;
    } else if (this.state.userList === "Username not found.") {
      userListContainer = friendIsNull;
    } else if (this.state.loading === true) {
      userListContainer = <Spinner color="#499fcd" />
    } else {
      userListContainer = friendIsNotNull;
    }

    return (
      <View style={styles.container}>
        <Header style={styles.header} searchBar>
          <Left style={{ flex: 0.7 }}>
            <Button transparent onPress={() => this.handleBackButtonClick()}>
              <Icon style={styles.backBtn} name='arrow-back' />
            </Button>
          </Left>
          <Body style={{ alignItems: 'center', alignContent: 'center', flex: 5, width: '100%' }}>
            <Form style={{ width: '100%' }}>
              <Item style={{ borderColor: 'transparent' }}>
                <Input
                  maxLength={20}
                  style={styles.textInput}
                  placeholder="Enter your friend's username"
                  placeholderTextColor="white"
                  value={this.state.searchBar}
                  onChangeText={(value) => this.setState({ searchBar: value })}
                />
              </Item>
            </Form>
          </Body>
          <Right style={{ flex: 1 }}>
            <Button transparent style={{}} onPress={() => this.checkSearchBar(this.state.searchBar)}>
              <Icon style={{ color: 'white' }} size={50} name="md-search" />
            </Button>
          </Right>
        </Header>
        {userListContainer}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
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
    color: 'white'
  },
  userListContainer: {
    flex: 0,
    alignItems: 'center',
    alignContent: 'center',
    marginRight: 15,
    marginLeft: 15,
    marginTop: 15
  },
  listOfUser: {
    flex: 6,
    alignItems: 'center',
    marginTop: 5,
    // marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 5
  },
})
