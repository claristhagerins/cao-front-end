import React from 'react';
import { StyleSheet, Alert, AsyncStorage, ScrollView, RefreshControl } from 'react-native';
import {
    Container, Content, Button, Header, Left, Right, Body, Spinner, Card, CardItem, View,
    Thumbnail, Item, Icon, Input, Fab, Text, Segment, List, ListItem, Tabs, Tab, TabHeading
} from 'native-base';
import Dialog, { ScaleAnimation, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import serviceUrl from '../../constant/Url';
import Vote from './Vote';

export default class Events extends React.Component {
    _isMounted = false;

    state = {
        active: 'true',
        eventName: '',
        eventDescription: '',
        userId: '',
        userName: '',
        eventList: [],
        draftEvent: [],
        publishedEvent: [],
        closedEvent: [],
        condition: '',
        refreshing: false,
        currentTab: 0,
        loading: true,
        visible: false,
        eventIdPressed: '',
        eventNamePressed: '',
        eventDescriptionPressed: '',
        pollConditionPressed: '',
    };

    static navigationOptions = ({ navigation }) => ({
        title: 'Events',
        headerRight: <Button rounded style={{ backgroundColor: '#499fcd', marginTop: 7, marginRight: 10, height: '70%' }} onPress={() => { navigation.navigate('NewEvent') }}><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>CREATE</Text></Button>,
        headerTitleStyle: {
            fontWeight: 'bold',
            color: '#1da1f2',
        },
        headerStyle: {
            elevation: 0
        }
        // header: null
    });

    constructor(props) {
        super(props);
        console.disableYellowBox = true;
        console.ignoredYellowBox = ['Warning:'];
        console.ignoredYellowBox = ['Require cycle:'];
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted == true) {
            // AsyncStorage.removeItem('eventID');
            this.getUserId();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    alertHello = async () => {
        try {
            Alert.alert(
                'Hello',
                'Claristha Gerinsya',
                [
                    { text: 'CANCEL', onPress: () => { }, style: 'cancel' }
                ]
            );
        } catch (e) {
            console.log(e);
        }
    }

    getUserId() {
        AsyncStorage.getItem('userId').then((value) => this.setUserId(value));
        AsyncStorage.getItem('userName').then((value) => this.setUserName(value));
    }

    setUserId(value) {
        this.setState({ userId: value });
    }

    setUserName(value) {
        this.setState({ userName: value })

        this.getEventList(this.state.userId);
    }

    getEventList = async (value) => {
        let url = serviceUrl + '/events/showEventList?userId=' + value;
        console.log(url);

        let data = {};
        data.eventName = this.state.eventName;
        data.eventDescription = this.state.eventDescription;

        try {
            const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
            // console.log("Resp: " + resp.toString());
            const respJSON = await resp.json();
            // console.log("RespJSON: " + respJSON[0]);

            if (respJSON.length == 0) {
                this.setState({ eventList: [] })
                this.setState({ eventList: "No event(s) found." });
            } else if (respJSON != null || respJSON != "") {
                this.setState({ eventList: [] })
                this.insertToEventList(respJSON);
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false });
            this.setState({ eventList: [] })
            this.setState({ eventList: "Service is not available." })
            console.log(error)
        }
    }

    insertToEventList(data) {
        let eList = data;

        for (let i = 0; i < eList.length; i++) {
            let eventId = data[i].eventId;
            let eventName = data[i].eventName;
            let eventDescription = data[i].eventDescription;
            let pollStatus = data[i].pollStatus;
            let pollCondition = data[i].pollCondition;
            let createdBy = data[i].createdBy

            const updateEventList = { ...this.state.eventList, ...{ [i]: { eventId, eventName, eventDescription, pollStatus, pollCondition, createdBy } } }
            this.setState({ eventList: updateEventList });

            // if (pollCondition == "Draft") {
            //     const updateEventList = { ...this.state.draftEvent, ...{ ["Event " + (i + 1)]: { eventId, eventName, eventDescription, pollStatus, pollCondition, createdBy } } }
            //     this.setState({ draftEvent: updateEventList });
            // } else 
            if (pollCondition == "Published") {
                const updateEventList = { ...this.state.publishedEvent, ...{ [i]: { eventId, eventName, eventDescription, pollStatus, pollCondition, createdBy } } }
                this.setState({ publishedEvent: updateEventList });
            } else if (pollCondition == "Closed") {
                const updateEventList = { ...this.state.closedEvent, ...{ [i]: { eventId, eventName, eventDescription, pollStatus, pollCondition, createdBy } } }
                this.setState({ closedEvent: updateEventList });
            }
        }
    }

    setAvatar(con) {
        // if (con == "Draft") {
        //     return <Thumbnail medium source={require('../../../assets/poll/draft.png')} />;
        // } else 
        if (con == "Published") {
            return <Thumbnail medium source={require('../../../assets/poll/published.png')} />;
        } else if (con == "Closed") {
            return <Thumbnail medium source={require('../../../assets/poll/closed.png')} />;
        }
    }

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.getEventList(this.state.userId).then(() => {
            this.setState({ refreshing: false });
        });
    }

    popupDialog(eventId, eventName, eventDescription, pollCondition) {
        this.setState({ eventIdPressed: eventId })
        this.setState({ eventNamePressed: eventName })
        this.setState({ eventDescriptionPressed: eventDescription })
        this.setState({ pollConditionPressed: pollCondition })
        this.setState({ visible: true })
    }

    cancelDelete(visibleState) {
        this.setState({ visible: visibleState })
    }

    delete(visibleState) {
        this.setState({ visible: visibleState })
        this.deleteEvent();
    }

    deleteEvent = async () => {
        let url = serviceUrl + '/events/deleteEvent';
        console.log(url);

        let data = {};

        data.eventId = this.state.eventIdPressed;

        try {
            const resp = await fetch(url, { method: 'POST', headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) });
            const respJSON = await resp.text();

            if (respJSON.length > 0) {
                this.deleteSuccess();
                this.deleteEventListByIndex(this.state.eventIdPressed);
                this.getEventList(this.state.userId);
            }
        } catch (error) {
            console.log(error);
        }
    }

    deleteSuccess = async () => {
        try {
            Alert.alert(
                'Success',
                'Event deleted',
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

    deleteEventListByIndex = (evt) => {
        var foundEventList = this.getEventIndex(this.state.eventList, 'eventId', evt);
        var foundPublishedList = this.getEventIndex(this.state.publishedEvent, 'eventId', evt);
        var foundClosedList = this.getEventIndex(this.state.closedEvent, 'eventId', evt);

        if (foundEventList != -1) {
            this.removeEventList(foundEventList)
        }

        if (foundPublishedList != -1 && this.state.pollConditionPressed == 'Published') {
            this.removePublishedList(foundPublishedList)
        }

        if (foundClosedList != -1 && this.state.pollConditionPressed == 'Closed') {
            this.removeClosedList(foundClosedList)
        }
    }

    getEventIndex(arr, attr, value) {
        // const index = arr.findIndex(item => item.eventId === value);
        // console.log(index)

        for (var i = 0; i < Object.keys(arr).length; i++) {
            if (arr[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    removeEventList(index) {
        const evtList = delete (this.state.eventList[index]);
        this.setState({ eventList: evtList });
    }

    removePublishedList(index) {
        const evtList = delete (this.state.publishedEvent[index]);
        this.setState({ publishedEvent: evtList });
    }

    removeClosedList(index) {
        const evtList = delete (this.state.closedEvent[index]);
        this.setState({ closedEvent: evtList });
    }

    cardFooter(eventId, eventName, eventDescription, pollCondition, createdBy) {
        const voteOnly =
            <CardItem footer bordered style={{ flex: 2, flexDirection: 'row' }}>
                <Button style={{ flex: 2, alignContent: 'center', justifyContent: 'center', backgroundColor: '#499fcd' }} block onPress={() => this.storeEventIdForVote(eventId)}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>VOTE</Text>
                </Button>
            </CardItem>;

        const deleteOnly =
            <CardItem footer bordered style={{ flex: 2, flexDirection: 'row' }}>
                <Button style={{ borderRadius: 10, flex: 1, alignContent: 'center', justifyContent: 'center' }} block danger onPress={() => this.popupDialog(eventId, eventName, eventDescription, pollCondition)}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>DELETE</Text>
                </Button>
            </CardItem>;

        const deleteAndVote =
            <CardItem footer bordered style={{ flex: 2, flexDirection: 'row' }}>
                <Button style={{ borderRadius: 10, flex: 1, alignContent: 'center', justifyContent: 'center' }} block danger onPress={() => this.popupDialog(eventId, eventName, eventDescription, pollCondition)}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>DELETE</Text>
                </Button>
                <Text>    </Text>
                <Button style={{ borderRadius: 10, flex: 1, alignContent: 'center', justifyContent: 'center', backgroundColor: '#499fcd' }} block onPress={() => this.storeEventIdForVote(eventId)}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>VOTE</Text>
                </Button>
            </CardItem>;

        if (pollCondition == 'Closed') {
            return deleteOnly;
        } else if (this.state.userName == createdBy) {
            return deleteAndVote;
        } else {
            return voteOnly;
        }
    }

    storeEventIdForVote = async (eventId) => {
        await AsyncStorage.setItem('eventId', eventId);
        this.props.navigation.navigate('Vote');
    }

    storeEventIdForDetails = async (eventId) => {
        await AsyncStorage.setItem('eventId', eventId);
        this.props.navigation.navigate('EventDetail');
    }

    render() {
        const serviceNotAvailable = <Container style={{ flex: 0, height: '100%', alignItems: 'center', margin: 15 }}><Text style={{ color: '#8e8e8e' }}>Service is not available. Beep beep!</Text></Container>
        const eventIsNull = <Container style={{ marginLeft: 15, marginRight: 15, flex: 0, alignItems: 'center', marginTop: 10, flex: 0, height: '100%' }}><Text style={{ color: '#8e8e8e' }}>Beep beep! There is no event yet. Try to make one!</Text></Container>
        const eventIsNotNull =
            <List
                dataArray={this.state.eventList}
                style={{ marginRight: 15, marginTop: 0, marginBottom: 0 }}
                renderRow={item => (
                    <ListItem style={styles.listOfEvent}>
                        <Left style={{ flex: 1, paddingLeft: 15 }}>
                            {this.setAvatar(item.pollCondition)}
                        </Left>
                        <Body style={{ flex: 4 }}>
                            <Text style={{ width: '90%', fontWeight: 'bold' }}>{item.eventName}</Text>
                            <Text style={{ width: '90%' }}>{item.eventDescription}</Text>
                        </Body>
                        <Right style={{ flex: 1, justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end' }}>
                            <Text style={[(item.pollCondition == "Draft") ? styles.draft : "", (item.pollCondition == "Published") ? styles.published : "", (item.pollCondition == "Closed") ? styles.closed : ""]}>{item.pollCondition}</Text>
                            <Text></Text>
                            <Text></Text>
                            <Text></Text>
                        </Right>
                    </ListItem>
                )}
            />;

        const loading = <Spinner color="#499fcd" />;

        const noDraft = <Container style={{ marginLeft: 15, marginRight: 15, flex: 0, alignItems: 'center', marginTop: 10, height: '100%' }}><Text style={{ color: '#8e8e8e' }}>And in the beginning... there was silence.</Text></Container>
        const draft =
            <Content style={{ flex: 0, height: '100%' }}>
                <List
                    dataArray={this.state.draftEvent}
                    style={{ marginRight: 15, marginTop: 0, marginBottom: 0 }}
                    renderRow={item => (
                        <ListItem style={styles.listOfEvent}>
                            <Left style={{ flex: 5, flexDirection: 'column' }}>
                                {/* {this.setAvatar(item.pollCondition)} */}
                                <Text style={{ width: '90%', fontWeight: 'bold' }}>{item.eventName}</Text>
                                <Text style={{ width: '90%' }}>{item.eventDescription}</Text>
                            </Left>
                            <Body style={{ flex: 0 }}>
                                {/* <Text style={{ width: '90%', fontWeight: 'bold' }}>{item.eventName}</Text>
                            <Text style={{ width: '90%' }}>{item.eventDescription}</Text> */}
                            </Body>
                            <Right style={{ flex: 1, justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end' }}>
                                {/* <Text style={[(item.pollCondition == "Draft") ? styles.draft : "", (item.pollCondition == "Published") ? styles.published : "", (item.pollCondition == "Closed") ? styles.closed : ""]}>{item.pollCondition}</Text> */}
                                <Text></Text>
                                <Text></Text>
                                <Text></Text>
                            </Right>
                        </ListItem>
                    )}
                />
            </Content>;

        const noPublished = <Container style={{ marginLeft: 15, marginRight: 15, flex: 0, alignItems: 'center', marginTop: 10, height: '100%' }}><Text style={{ color: '#8e8e8e' }}>Roses are red, violets are blue. There is no event for you.</Text></Container>
        const published =
            <Content style={{ flex: 0, height: '100%' }}>
                <List
                    dataArray={this.state.publishedEvent}
                    style={{ marginTop: 10, marginLeft: 15, marginRight: 15 }}
                    renderRow={item => (
                        <Card style={{ marginBottom: 10 }}>
                            <CardItem button bordered onPress={() => this.storeEventIdForDetails(item.eventId)}>
                                <Body style={{ flex: 5, flexDirection: 'column' }}>
                                    {/* {this.setAvatar(item.pollCondition)} */}
                                    <Text style={{ width: '90%', fontWeight: 'bold', fontSize: 20 }}>{item.eventName}</Text>
                                    <Text style={{ width: '90%' }}>{item.eventDescription}</Text>
                                    <Text> </Text>
                                    <Text style={{ fontWeight: 'normal', color: '#282828' }}>Created by {item.createdBy}</Text>
                                </Body>
                            </CardItem>
                            {this.cardFooter(item.eventId, item.eventName, item.eventDescription, item.pollCondition, item.createdBy)}
                        </Card>
                    )}
                />
            </Content>;

        const noClosed = <Container style={{ marginLeft: 15, marginRight: 15, flex: 0, alignItems: 'center', marginTop: 10, height: '100%' }}><Text style={{ color: '#8e8e8e' }}>Bacon is rough. One event is never enough.</Text></Container>
        const closed =
            <Content style={{ flex: 0, height: '100%' }}>
                <List
                    dataArray={this.state.closedEvent}
                    style={{ marginTop: 10, marginLeft: 15, marginRight: 15 }}
                    renderRow={item => (
                        <Card style={{ marginBottom: 10 }}>
                            <CardItem button bordered onPress={() => this.storeEventIdForDetails(item.eventId)}>
                                <Body style={{ flex: 5, flexDirection: 'column' }}>
                                    {/* {this.setAvatar(item.pollCondition)} */}
                                    <Text style={{ width: '90%', fontWeight: 'bold', fontSize: 20 }}>{item.eventName}</Text>
                                    <Text style={{ width: '90%' }}>{item.eventDescription}</Text>
                                    <Text> </Text>
                                    <Text style={{ fontWeight: 'normal', color: '#282828' }}>Created by {item.createdBy}</Text>
                                </Body>
                            </CardItem>
                            {this.cardFooter(item.eventId, item.eventName, item.eventDescription, item.pollCondition, item.createdBy)}
                        </Card>
                    )}
                />
            </Content>;

        let eventListContainer;

        if (this.state.loading === true) {
            // draftEventList = loading;
            publishedEventList = loading;
            closedEventList = loading;
        } else if (this.state.eventList === "Service is not available.") {
            // eventListContainer = serviceNotAvailable;            
            // draftEventList = serviceNotAvailable;
            publishedEventList = serviceNotAvailable;
            closedEventList = serviceNotAvailable;
        } else if (this.state.eventList === "No event(s) found.") {
            // eventListContainer = eventIsNull;            
            // draftEventList = eventIsNull;
            publishedEventList = eventIsNull;
            closedEventList = eventIsNull;
        } else {
            // eventListContainer = eventIsNotNull;
            // if (this.state.draftEvent.length == 0) {
            //     draftEventList = noDraft;
            // } else {
            //     draftEventList = draft;
            // }

            if (this.state.publishedEvent.length == 0) {
                publishedEventList = noPublished;
            } else {
                publishedEventList = published;
            }

            if (this.state.closedEvent.length == 0) {
                closedEventList = noClosed;
            } else {
                closedEventList = closed;
            }
        }

        return (
            <Container style={styles.container}>
                <Container style={{ backgroundColor: 'white' }}>
                    {/* <Button block style={styles.newEventBtn} onPress={() => this.props.navigation.push('NewEvent')}>
                        <Text style={styles.newEventBtnText}>Create New Event</Text>
                    </Button> */}

                    {/* <Item rounded style={{ marginLeft: 15, marginTop: 15, marginBottom: 15, marginRight: 15 }}>
                            <Input
                                maxLength={20}
                                underlineColorAndroid="transparent"
                                placeholder="Search"
                            />

                            <Button transparent style={{ marginTop: 3, marginLeft: 10, marginRight: 5 }} onPress={() => this.checkSearchBar(this.state.searchBar)}>
                                <Icon style={{ color: '#499fcd' }} size={50} name="md-search" />
                            </Button>
                        </Item> */}

                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }>
                        <Tabs
                            tabContainerStyle={{ backgroundColor: 'white', marginBottom: 5, paddingTop: 10, paddingBottom: 10 }}
                            // tabBarUnderlineStyle={{ height: 0 }}
                            tabBarUnderlineStyle={{ backgroundColor: '#499fcd' }}
                            initialPage={this.state.currentPage}
                            onChangeTab={({ i }) => this.setState({ currentTab: i })}>
                            {/* <Tab heading={<TabHeading style={this.state.currentTab === 0 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-bookmarks" horizontal style={this.state.currentTab === 0 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 0 ? styles.activeTabText : styles.tabText}>Draft</Text></TabHeading>}>
                                {draftEventList}
                            </Tab> */}

                            <Tab heading={<TabHeading style={this.state.currentTab === 0 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-send" horizontal style={this.state.currentTab === 0 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 0 ? styles.activeTabText : styles.tabText}>Published</Text></TabHeading>}>
                                {publishedEventList}
                            </Tab>

                            <Tab heading={<TabHeading style={this.state.currentTab === 1 ? styles.activeTabStyle : styles.tabStyle} ><Icon transparent name="md-close" horizontal style={this.state.currentTab === 1 ? styles.activeTabIcon : styles.tabIcon} /><Text style={this.state.currentTab === 1 ? styles.activeTabText : styles.tabText}>Closed</Text></TabHeading>}>
                                {closedEventList}
                            </Tab>
                        </Tabs>
                        {/* {eventListContainer} */}
                    </ScrollView>

                    <Dialog
                        visible={this.state.visible}
                        width={0.6}
                        dialogAnimation={new ScaleAnimation()}
                        onTouchOutside={() => {
                            this.setState({ visible: false });
                        }}
                    >
                        <DialogContent style={{ flex: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginLeft: 15, marginRight: 15 }}>
                            <Text style={{ fontSize: 20, marginTop: 5 }}>Delete "{this.state.eventNamePressed}" ?</Text>
                        </DialogContent>
                        <DialogFooter>
                            <DialogButton
                                text="Cancel"
                                textStyle={{ color: '#d9534f' }}
                                onPress={() => this.cancelDelete(false)}
                            />
                            <DialogButton
                                text="Yes"
                                textStyle={{ color: '#499fcd' }}
                                onPress={() => this.delete(false)}
                            />
                        </DialogFooter>
                    </Dialog>
                </Container>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        marginTop: 24,
        backgroundColor: 'white',
        flex: 0,
        elevation: 1
    },
    segment: {
        width: '100%',
        height: 50,
        backgroundColor: 'transparent'
    },
    newEventBtn: {
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderColor: '#499fcd',
        backgroundColor: '#499fcd'
    },
    newEventBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listOfEvent: {
        flex: 6,
        flexDirection: 'row',
        marginBottom: 5,
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderRadius: 6,
        borderColor: '#efefef',
        marginTop: 8
        // shadowColor: '#000',
        // shadowOffset: {width: 1, height: 2 },
        // shadowOpacity: 1,
        // shadowRadius: 4,
        // elevation: 1,
    },
    listContainer: {
        flex: 0,
        alignItems: 'center',
        marginTop: 15,
        height: '100%'
    },
    draft: {
        fontSize: 13,
        color: '#FAC331'
    },
    published: {
        fontSize: 13,
        color: '#008549'
    },
    closed: {
        fontSize: 13,
        color: '#A6A6A6'
    },
    tabIcon: {
        color: '#afafaf',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeTabIcon: {
        color: '#499fcd',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeTabStyle: {
        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 15,
        // borderWidth: 1.5,
        // borderBottomWidth: 0,
        // borderColor: '#efefef',
        backgroundColor: 'white',
        color: '#499fcd',
    },
    tabStyle: {
        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 15,
        // borderWidth: 0.5,
        // borderBottomWidth: 1.5,
        // borderColor: '#efefef',
        // backgroundColor: '#efefef',
        backgroundColor: 'white',
        color: '#afafaf',
    },
    activeTabText: {
        color: '#499fcd'
    },
    tabText: {
        color: '#afafaf'
    },
});