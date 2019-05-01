import React from 'react';
import { StyleSheet, Alert, AsyncStorage, ImageStore, ImageEditor, Image, BackHandler } from 'react-native';
import {
  Container, Content, Text, Button, Thumbnail, Header, List, Card, CardItem, View, Item,
  Right, Body, Left, Icon, ListItem, Switch, Input
} from 'native-base';
import { ImagePicker } from 'expo';
import firebase from '../../config/Firebase';
import ImgToBase64 from 'react-native-image-base64';
import serviceUrl from '../../constant/Url';

console.disableYellowBox = true;

export default class EditProfile extends React.Component {
  state = {
    currentUser: null,
    userId: '',
    userName: '',
    userNameBaru: '',
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    disable: true
  }

  static navigationOptions = {
    // title: 'Settings',
    // headerTitleStyle: {
    //     fontWeight: 'bold',
    //     color: '#1da1f2'
    // },
    header: null
  };

  constructor(props) {
    super(props);
    this.getUserData();
    
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount() {
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Main');
    setTimeout(this.props.navigation.navigate.bind(null, "SettingsStack"), 1);
    return true;
  }

  getUserData() {
    AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
    AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
    AsyncStorage.getItem('email').then((value) => this.setEmail(value));
    // AsyncStorage.getItem('password').then((value) => this.setPassword(value));
  }

  setUserId(value) { this.setState({ userId: value }) }
  setUserName(value) { this.setState({ userName: value }); this.setState({ userNameBaru: value }) }
  setEmail(value) { this.setState({ email: value }) }
  // setPassword(value) { this.setState({ password: value }) }

  // SignOut
  signOutUser = async () => {
    try {
      Alert.alert(
        'Log Out',
        'Are you sure you want to logout?',
        [
          { text: 'CANCEL', onPress: () => { }, style: 'cancel' },
          {
            text: 'LOG OUT', onPress: () => {
              firebase.auth().signOut();
              AsyncStorage.clear();
              this.props.navigation.navigate('Loading');
            }
          },
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  handleEdit() {
    if (this.state.userNameBaru.length < 4) {

    } else if (this.state.userName != this.state.userNameBaru) {
      this.editProfile();
    }
  }

  editProfile = async (value) => {
    let url = serviceUrl + '/user/changeUsername';
    console.log(url)

    let data = {};
    data.userName = this.state.userName;
    data.userNameBaru = this.state.userNameBaru;

    try {
      const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
      const respJSON = await resp.json();

      if (respJSON != null && respJSON == 'Username sudah ada') {
        this.userNameFalse();
      } else if (respJSON != null && respJSON == "Berhasil di ganti") {
        await AsyncStorage.setItem('userName', this.state.userNameBaru);
        this.profileEdited();
      }

    } catch (error) {
      this.setState({ friendList: "Service is not available." })
      console.log(error)
    }
  }

  userNameFalse = async () => {
    try {
      Alert.alert(
        'Failed',
        'Username already used',
        [
          {
            text: 'Ok', onPress: () => { }
          }
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  profileEdited = async () => {
    try {
      Alert.alert(
        'Success',
        'Profile Edited!',
        [
          {
            text: 'Ok', onPress: () => { this.handleBackButtonClick() }
          }
        ]
      );
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const errorM = <Text style={{ marginTop: 5, color: 'red', fontSize: 12, marginLeft: 3 }}>Minimum username length is 4.</Text>;

    if (this.state.userNameBaru.length > 4) {
      errorMessage = <Text> </Text>;
    } else if (this.state.userNameBaru.length < 4) {
      errorMessage = errorM;
    }

    return (
      <Container style={styles.container}>
        <Header style={styles.header} noShadow={false}>
          <Left style={{ flex: 1 }}>
            <Button transparent onPress={() => this.handleBackButtonClick()}>
              <Icon style={{ color: '#499fcd' }} name='arrow-back' />
            </Button>
          </Left>
          <Body style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </Body>
          <Right style={{ flex: 1 }}>
          </Right>
        </Header>

        <List style={{ borderTopColor: '#d6d6d6', borderTopWidth: 1 }}>
          <ListItem itemDivider>
            <Text>Profile</Text>
          </ListItem>
        </List>

        <View style={{ flex: 0, flexDirection: 'column', marginTop: 15, marginLeft: 15, marginRight: 15, marginBottom: 5 }}>
          <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>Username</Text>
          <Item regular style={{ flex: 0, marginTop: 10 }}>
            <Input
              placeholder="Input your username here"
              value={this.state.userNameBaru}
              onChangeText={(value) => this.setState({ userNameBaru: value.replace(" ", "") })}
              style={{ flex: 1, paddingLeft: 5 }}
            />
          </Item>
          {errorMessage}
        </View>

        <List style={{ marginTop: 10 }}>
          <ListItem itemDivider>
            <Text>Password</Text>
          </ListItem>
        </List>

        <View style={{ flex: 0, flexDirection: 'column', margin: 15 }}>
          <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>Old Password</Text>
          <Item regular style={{ flex: 0, marginTop: 10 }}>
            <Input
              secureTextEntry={true}
              placeholder="Input your old password here"
              value={this.state.password}
              onChangeText={(value) => this.setState({ password: value })}
              style={{ flex: 1, paddingLeft: 5 }}
            />
          </Item>

          <Text> </Text>

          <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>New Password</Text>
          <Item regular style={{ flex: 0, marginTop: 10 }}>
            <Input
              secureTextEntry={true}
              placeholder="Input your new password here"
              value={this.state.newPassword}
              onChangeText={(value) => this.setState({ newPassword: value })}
              style={{ flex: 1, paddingLeft: 5 }}
            />
          </Item>

          <Text> </Text>

          <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>Confirm New Password</Text>
          <Item regular style={{ flex: 0, marginTop: 10 }}>
            <Input
              secureTextEntry={true}
              placeholder="Input your new password here"
              value={this.state.confirmNewPassword}
              onChangeText={(value) => this.setState({ confirmNewPassword: value })}
              style={{ flex: 1, paddingLeft: 5 }}
            />
          </Item>


          <Button block style={{ marginTop: 20, backgroundColor: '#499fcd', borderRadius: 10 }} onPress={() => this.handleEdit()}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>EDIT PROFILE</Text>
          </Button>
        </View>
      </Container>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    marginTop: 24,
    backgroundColor: 'white',
    flex: 0,
    shadowRadius: 10,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#499fcd'
  },
  logoutBtn: {
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10
  },
});