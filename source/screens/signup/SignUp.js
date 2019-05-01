import React from 'react';
import {
  StyleSheet, Text, TextInput, View, SafeAreaView, StatusBar, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image, ImageBackground, BackHandler,
} from 'react-native';
import firebase from '../../config/Firebase';
import serviceUrl from '../../constant/Url';

export default class SignUp extends React.Component {
  _isMounted = false;

  state = {
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorMessage: ' ',
  }

  constructor(props) {
    super(props);

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount() {
    // This will load the default value's search results after the view has
    // been rendered
    this._isMounted = true;
  }

  componentWillMount() {
    this._isMounted = false;
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Select');
    return true;
  }

  handleSignUp = async () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (this.state.userName.length < 4) {
      this.setState({ errorMessage: 'Minimum username length is 4.' })
    } else if (reg.test(this.state.email) === false) {
      this.setState({ errorMessage: 'The email format is not valid.' })
    } else if (this.state.password.length < 6) {
      this.setState({ errorMessage: 'Minimum password length is 6.' })
    } else if (this.state.password != this.state.confirmPassword) {
      this.setState({ errorMessage: 'The password and confirmation password do not match.' })
    } else {
      let url = serviceUrl + '/user/register';
      let data = {};
      data.userName = this.state.userName;
      data.email = this.state.email;
      data.password = this.state.password;

      try {
        const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
        const respJSON = await resp.text();

        if (respJSON === 'REGISTER SUCCESS') {
          this.setErrorMessage(respJSON);

          firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(() => firebase.auth().signOut());

          // this.props.navigation.navigate('Login');
        }
      } catch (error) {
        console.log(error)
      }
    }
    // alert("You have been successfully registered!");
  }

  setErrorMessage(errMess) {
    this.setState({ errorMessage: errMess });
  }

  render() {
    return (

      <ImageBackground
        source={require('../../../assets/screenBackground/registerScreenBackground.jpg')}
        style={styles.bgImage}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss}>
              <View style={styles.subContainer}>
                {/* header bar */}
                <View style={styles.headerBar}>
                  <Image
                    source={require('../../../assets/logo/cao!.png')}
                    style={styles.logo}
                  />
                </View>

                {/* title dan logo */}
                {/* <View style={styles.titleContainer}>
                <Text style={styles.title}> Login </Text>
                </View> */}

                {/* inputan */}
                <View style={styles.infoContainer}>
                  {/* <Text style={styles.welcomeText}>Create an account</Text> */}

                  {/* <Text style={styles.inputHeaderText}>Login</Text> */}
                  <View style={styles.subInfoContainer}>
                    {this.state.errorMessage &&
                      <Text style={styles.errorMessage}>
                        {this.state.errorMessage}
                      </Text>}

                    <TextInput
                      placeholder="User Name"
                      autoCapitalize="none"
                      underlineColorAndroid='#ccd5e5'
                      style={styles.textInput}
                      onChangeText={userName => this.setState({ userName: userName.replace(" ", "") })}
                      value={this.state.userName}
                    />

                    <TextInput
                      placeholder="Email"
                      autoCapitalize="none"
                      underlineColorAndroid='#ccd5e5'
                      style={styles.textInput}
                      onChangeText={email => this.setState({ email })}
                      value={this.state.email}
                    />

                    <TextInput
                      secureTextEntry
                      placeholder="Password"
                      autoCapitalize="none"
                      underlineColorAndroid='#ccd5e5'
                      style={styles.textInput}
                      onChangeText={password => this.setState({ password })}
                      value={this.state.password}
                    />

                    <TextInput
                      secureTextEntry
                      placeholder="Confirm Password"
                      autoCapitalize="none"
                      underlineColorAndroid='#ccd5e5'
                      style={styles.textInput}
                      onChangeText={confirmPassword => this.setState({ confirmPassword })}
                      value={this.state.confirmPassword}
                    />

                    <View style={styles.btnContainer}>
                      <TouchableOpacity style={styles.signUpBtn} onPress={this.handleSignUp}>
                        <Text style={styles.signUpButtonText}>Register</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.loginBtn} onPress={() => this.props.navigation.navigate('Login')}>
                        <Text style={styles.loginButtonText}>Already have an account? Login</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    )
  }
}
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    borderColor: 'transparent'
  },
  statusBar: {
    height: 24,
    // backgroundColor: '#2c2f33',
    width: '100%'
  },
  headerBar: {
    height: 60,
    // backgroundColor: '#0c71af',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logo: {
    height: 40,
    width: 134,
  },
  container: {
    flex: 1,
    // backgroundColor: 'white',
    flexDirection: 'column'
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 20,
    flex: 1,
    flexDirection: 'column'
  },
  subContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: '#23272a'
  },
  infoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: 'white',
    // height: 400,
    alignItems: 'center',
    margin: 10,
    marginBottom: 0,
    borderRadius: 10,
  },
  subInfoContainer: {
    margin: 10,
    marginTop: 0,
    height: '100%',
    width: '80%'
  },
  textInput: {
    justifyContent: 'center',
    color: 'white',
    padding: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 6,
    marginBottom: 6,
    fontSize: 16,
    // borderColor: 'gray',
    // borderWidth: 1,
  },
  title: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
    fontWeight: 'bold'
  },
  inputHeaderText: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  errorMessage: {
    textAlign: 'center',
    color: 'yellow',
    fontWeight: 'bold'
  },
  signUpBtn: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    height: 40,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 20
  },
  loginBtn: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 30,
    margin: 5,
  },
  loginButtonText: {
    color: 'white',
    alignItems: 'center',
    fontSize: 16,
  },
  signUpButtonText: {
    color: '#4881ba',
    alignItems: 'center',
    fontSize: 16
  },
  btnContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeText: {
    color: 'white',
    fontSize: 20,
    paddingTop: 10,
  }
})