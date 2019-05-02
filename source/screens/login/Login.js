import React from 'react';
import {
    StyleSheet, Text, TextInput, View, SafeAreaView, StatusBar, KeyboardAvoidingView,
    TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image, ImageBackground, BackHandler,
    ActivityIndicator, AsyncStorage
} from 'react-native';
import firebase from './../../config/Firebase';
import serviceUrl from '../../constant/Url';


export default class Login extends React.Component {
    state = {
        email: '',
        password: '',
        errorMessage: ' ',
        isLoading: false,
        userId: ''
    }

    constructor(props) {
        super(props);

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate('Select');
        return true;
    }

    handleLogin = async () => {
        let url = serviceUrl + '/user/login'
        let data = {};
        data.email = this.state.email;
        data.password = this.state.password;

        try {
            const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
            const respJSON = await resp.json();
            
            let stat = respJSON.status;    
            let userId = respJSON.userId;
            let userName = respJSON.userName;
            let email = respJSON.email;
            let password = respJSON.password;
            let role = respJSON.roleId;

            // console.log(userId)

            this.setState({ userId: userId });
            this.setState({ errorMessage: stat });

            if (respJSON != null || respJSON != "") {
                if (stat === 'Login Success') {
                    this.setState({ errorMessage: 'Login Success', isLoading: true });

                    this._setAsyncStorage(userId, userName, email, role);
    
                    firebase.auth().
                        signInWithEmailAndPassword(email, password)
                        .then(() => this.props.navigation.navigate('Main'))
                        .catch(error => this.setState({ errorMessage: error.message }));
                } else {
                    this.setState({ isLoading: false });
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    async _setAsyncStorage(uID, uName, mail, role) {
        var evtID = 'fromlogin';
        await AsyncStorage.clear();
        await AsyncStorage.setItem('userId',uID);
        await AsyncStorage.setItem('userName', uName);
        await AsyncStorage.setItem('email', mail);
        await AsyncStorage.setItem('role', role);
        // await AsyncStorage.setItem('eventID', evtID);

        // console.log(uID + " " + uName + " " + mail + " " + role);
        console.log("User ID   : " + uID);
        console.log("User Name : " + uName);
        console.log("Email     : " + mail);
        console.log("Role      : " + role);
        // console.log("Event ID  : " + evtID);
    }

    render() {
        return (
            <ImageBackground
                source={require('../../../assets/screenBackground/loginScreenBackground.jpg')}
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

                                <View style={styles.infoContainer}>
                                    <Text style={styles.welcomeText}> Welcome back!</Text>

                                    {/* <Text style={styles.inputHeaderText}>Login</Text> */}
                                    <View style={styles.subInfoContainer}>
                                        {this.state.errorMessage &&
                                            <Text style={styles.errorMessage}>
                                                {this.state.errorMessage}
                                            </Text>}

                                        <TextInput
                                            style={styles.textInput}
                                            autoCapitalize="none"
                                            placeholder="Email"
                                            selectionColor='white'
                                            underlineColorAndroid='#ccd5e5'
                                            onChangeText={email => this.setState({ email })}
                                            value={this.state.email}
                                        />
                                        <TextInput
                                            secureTextEntry
                                            style={styles.textInput}
                                            autoCapitalize="none"
                                            placeholder="Password"
                                            selectionColor='white'
                                            underlineColorAndroid='#ccd5e5'
                                            onChangeText={password => this.setState({ password })}
                                            value={this.state.password}
                                        />

                                        <View style={styles.btnContainer}>
                                            <TouchableOpacity style={styles.loginBtn} onPress={this.handleLogin}>
                                                <Text style={styles.loginButtonText}>Login</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.signUpBtn} onPress={() => this.props.navigation.navigate('SignUp')}>
                                                <Text style={styles.signUpButtonText}>Don't have an account? Sign Up</Text>
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
        height: 300,
        alignItems: 'center',
        margin: 10,
        borderRadius: 10,
    },
    subInfoContainer: {
        margin: 20,
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
    loginBtn: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 40,
        marginBottom: 5,
        marginTop: 5,
        borderRadius: 20
    },
    signUpBtn: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 30,
        margin: 5,
    },
    loginButtonText: {
        color: '#4881ba',
        alignItems: 'center',
        fontSize: 16,
    },
    signUpButtonText: {
        color: 'white',
        alignItems: 'center',
        fontSize: 16
    },
    btnContainer: {
        justifyContent: 'center',
        paddingBottom: 10,
        alignItems: 'center'
    },
    welcomeText: {
        color: 'white',
        fontSize: 20,
        paddingTop: 10,
    }
})