import React from 'react';
import { StyleSheet, AsyncStorage, ScrollView, RefreshControl, Alert } from 'react-native';
import { Container, Text, List, ListItem, Fab, Icon, Thumbnail, Spinner, View, Button } from 'native-base';
import Dialog, { ScaleAnimation, DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import serviceUrl from '../../constant/Url';

export default class Contacts extends React.Component {
    state = {
        currentUser: null,
        friendName: '',
        userId: '',
        userName: '',
        friendList: [],
        text: '',
        refreshing: false,
        loading: true,
        visible: false,
        friendIdPressed: '',
        friendNamePressed: ''
    }

    static navigationOptions = {
        title: 'Friends',
        headerTitleStyle: {
            fontWeight: 'bold',
            color: '#1da1f2'
        },
    };

    constructor(props) {
        super(props);
        this.getUserId();
    }

    getUserId() {
        AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
        AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
    }

    setUserId(value) {
        this.setState({ userId: value });
    }

    setUserName(value) {
        this.setState({ userName: value });
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
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false });
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

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.getFriendList(this.state.userId).then(() => {
            this.setState({ refreshing: false });
        });
    }

    popupDialog(friendId, friendName) {
        this.setState({ friendIdPressed: friendId })
        this.setState({ friendNamePressed: friendName })
        this.setState({ visible: true })
    }

    delete(visibleState) {
        this.setState({ visible: visibleState })
        this.deleteAlert();
    }

    deleteAlert = async () => {
        try {
            Alert.alert(
                'Unfriend',
                'Are you sure to unfriend this user?',
                [
                    { text: 'CANCEL', onPress: () => { }, style: 'cancel' },
                    { text: 'YES', onPress: () => this.deleteFriend() },
                ]
            );
        } catch (e) {
            console.log(e);
        }
    }

    deleteFriend = async () => {
        let url = serviceUrl + '/relationship/deleteFriend';
        console.log(url);

        let data = {};

        data.userId = this.state.userId;
        data.userName = this.state.userName;
        data.friendId = this.state.friendIdPressed;
        data.friendName = this.state.friendNamePressed;

        try {
            const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
            const respJSON = await resp.text();

            if (respJSON == "Friend Deleted") {
                this.deleteSuccess();
                this.getFriendList(this.state.userId);
            }
        } catch (error) {
            console.log(error);
        }
    }

    deleteSuccess = async () => {
        try {
            Alert.alert(
                'Success',
                'Friend deleted',
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
        const loading = <Spinner color="#499fcd" />;
        const serviceNotAvailable = <Container style={styles.friendListContainer}><Text style={{ color: '#8e8e8e' }}>Service is not available. Beep beep!</Text></Container>
        const friendIsNull = <Container style={styles.friendListContainer}><Text style={{ color: '#8e8e8e' }}>Wanna find some friends to catch up?</Text></Container>
        const friendIsNotNull =
            <List
                dataArray={this.state.friendList}
                style={{ marginTop: 0, marginBottom: 0 }}
                renderRow={item => (
                    <ListItem style={styles.listOfFriend} onPress={() => { this.popupDialog(item.friendId, item.friendName) }} avatar>
                        <Thumbnail small source={require('../../../assets/contacts/pp.png')} />
                        <Text style={{ flex: 4, paddingLeft: 10, fontSize: 20 }}>{item.friendName}</Text>
                    </ListItem>
                )}
            />;

        let friendListContainer;

        if (this.state.loading === true) {
            friendListContainer = loading;
        } else if (this.state.friendList === "Service is not available.") {
            friendListContainer = serviceNotAvailable;
        } else if (this.state.friendList === "No friend(s) found") {
            friendListContainer = friendIsNull;
        } else {
            friendListContainer = friendIsNotNull;
        }

        return (
            <Container style={styles.container}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }>

                    {friendListContainer}
                </ScrollView>

                <Dialog
                    visible={this.state.visible}
                    width={0.6}
                    dialogAnimation={new ScaleAnimation()}
                    onTouchOutside={() => {
                        this.setState({ visible: false });
                    }}
                >
                    <DialogContent style={{ flex: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                        <Thumbnail large source={require('../../../assets/contacts/pp.png')} />
                        <Text style={{ fontSize: 25, marginTop: 5 }}>{this.state.friendNamePressed}</Text>
                        <Button block danger onPress={() => this.delete(false)} style={{ alignItems: 'center', marginLeft: 20, marginRight: 20, marginTop: 20, marginBottom: 5 }}>
                            <Text style={{ color: 'white' }}>UNFRIEND</Text>
                        </Button>
                    </DialogContent>
                </Dialog>

                <Fab style={styles.addFriendBtn} position="bottomRight" onPress={() => this.props.navigation.push('AddFriend')}>
                    <Icon name="md-person-add" />
                </Fab>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listOfFriend: {
        flex: 6,
        alignItems: 'center',
        marginTop: 5,
        marginRight: 10,
        borderBottomWidth: 1.5,
        borderColor: '#efefef',
        padding: 5,
        paddingBottom: 10
    },
    friendListContainer: {
        flex: 0,
        alignItems: 'center',
        paddingTop: 15,
        // marginLeft: 15,
        marginRight: 15
    },
    addFriendBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderColor: '#499fcd',
        backgroundColor: '#499fcd'
    }
})