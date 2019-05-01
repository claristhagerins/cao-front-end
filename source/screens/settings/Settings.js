import React from 'react';
import { StyleSheet, Alert, AsyncStorage, ImageStore, ImageEditor, Image } from 'react-native';
import {
    Container, Content, Text, Button, Thumbnail, Header, List, Card, CardItem, View,
    Right, Body, Left, Icon, ListItem, Switch
} from 'native-base';
import { ImagePicker } from 'expo';
import firebase from '../../config/Firebase';
import ImgToBase64 from 'react-native-image-base64';

console.disableYellowBox = true;

export default class Settings extends React.Component {
    state = {
        currentUser: null,
        userId: '',
        userName: '',
        email: '',
        password: '',
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
    }

    componentDidMount() {
        const { currentUser } = firebase.auth();
        this.setState({ currentUser });
    }

    getUserData() {
        AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
        AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
        AsyncStorage.getItem('email').then((value) => this.setEmail(value));
        AsyncStorage.getItem('password').then((value) => this.setPassword(value));
    }

    setUserId(value) { this.setState({ userId: value }) }
    setUserName(value) { this.setState({ userName: value }) }
    setEmail(value) { this.setState({ email: value }) }
    setPassword(value) { this.setState({ password: value }) }

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

    // chooseImage = async () => {
    //     let image = await ImagePicker.launchImageLibraryAsync();

    //     if (!image.cancelled) {
    //         this.uploadImage(image.uri, "test")
    //             .then(() => {
    //                 console.log("Success");
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    // }

    // uploadImage = async (uri, imageName) => {
    //     console.log(uri);    
    //     const storage = firebase.storage();
    //     const response = await fetch(uri);
    //     const blob = await response.blob();

    //     var ref = storage.ref('images').child("avatar/" + imageName);
    //     return ref.put(blob);
    // }

    render() {
        const { currentUser } = this.state;
        return (
            <Container style={styles.container}>
                <Container>
                    <View style={{ backgroundColor: '#499fcd', height: 300, width: '100%' }}></View>

                    <View style={{ flex: 0, backgroundColor: '#499fcd', width: '100%' }}>
                        <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', paddingLeft: 15, paddingBottom: 5 }}>Account</Text>
                    </View>
                    <View style={{ flexDirection: 'row', margin: 15 }}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>Username</Text>
                            <Text>{this.state.userName}</Text>
                            <Text> </Text>
                            <Text style={{ color: '#499fcd', fontWeight: 'bold' }}>Email</Text>
                            <Text>{this.state.email}</Text>
                        </View>

                        <View style={{ flexDirection: 'column', justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'center' }}>
                            <Button block onPress={() => this.props.navigation.push('EditProfile')} style={{ backgroundColor: '#499fcd', borderRadius: 15 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>EDIT</Text>
                            </Button>
                            <Text> </Text>
                            <Text> </Text>
                            <Text> </Text>
                        </View>

                    </View>

                    <Button block danger onPress={() => this.signOutUser()} style={{ margin: 15, borderRadius: 10 }}>
                        <Text style={{ color: 'white' }}>LOGOUT</Text>
                    </Button>
                </Container>
            </Container>
        )
    }
}
const styles = StyleSheet.create({
    // bgImage: {        
    //     flex: 1,
    //     width: '100%',
    //     borderColor: 'transparent'
    // },
    container: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    profile: {
        width: '100%',
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profilepic: {
        marginLeft: 10,
        height: 38,
        width: 130,
    },
    profilemenu: {
        backgroundColor: '#f7f7f7',
        width: '100%'
    },
    welcomeText: {
        alignItems: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1da1f2',
        marginTop: 15,
    },
    content: {
        // paddingTop: 10,
        // paddingLeft: 10,
        // paddingRight: 10,
        width: '100%',
    },
    settingButton: {
        marginTop: 15,
        marginBottom: 15,
        // backgroundColor: '#f4f4f4',   
        elevation: 0
    },
    settingButtonText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#499fcd',
    },
    logoutBtn: {
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 10
    },
});