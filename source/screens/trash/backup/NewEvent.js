import React from 'react';
import { StyleSheet, Alert, BackHandler, Linking } from 'react-native';
import {
    Container, Content, Text, Spinner, Header, Left, Body, Right, Button, Icon, Title,
    Form, Item, Label, Input, Textarea, Picker, ScrollView
} from 'native-base';

export default class NewEvent extends React.Component {
    state = {
        eventName: '',
        eventDescription: '',
        selectedEventForm: undefined,
        selectedEventSettings: undefined
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

    handleBackButtonClick() {
        this.props.navigation.navigate('Main');
        return true;
    }

    onValueChangeEventForm(value) {
        this.setState({
            selectedEventForm: value
        });
    }

    onValueChangeEventSettings(value) {
        this.setState({
            selectedEventSettings: value
        });
    }

    render() {
        const isFriendType = <Button block style={styles.chooseFriendBtn}><Text style={{ color: 'white', fontWeight: "bold" }}>Participant</Text><Icon style={styles.addFriendIcon} name='md-person-add' /></Button>
        const partContainer = <Container style={styles.participantContainer}><Text style={{ color: '#b7b7b7' }}>There is no participant yet.</Text></Container>

        let chooseFriend;
        let participantContainer;

        if (this.state.selectedEventSettings === "f") {
            chooseFriend = isFriendType;
            participantContainer = partContainer;
        }

        return (
            <Container style={styles.container}>
                <Header style={styles.header}>
                    <Left style={{ flex: 1 }}>
                        <Button transparent onPress={() => this.handleBackButtonClick()}>
                            <Icon style={styles.backBtn} name='arrow-back' />
                        </Button>
                    </Left>
                    <Body style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={styles.headerTitle}>New Event</Text>
                    </Body>
                    <Right style={{ flex: 1 }}></Right>
                </Header>

                <Content style={styles.content}>
                    <Container style={{ flex: 0 }}>
                        <Form style={{ flex: 0 }}>
                            <Item stackedLabel style={styles.textInputLine}>
                                <Label style={{ color: '#1da1f2', fontWeight: 'bold' }}>Events Name ({this.state.eventName.length}/30 characters)</Label>
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



                        <Form style={{ flexDirection: "column", flex: 0 }}>
                            <Text style={{ margin: 15, color: '#1da1f2' }}>
                                You can set dates/locations/free question which can be selected by the participants.
                            </Text>

                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={styles.pollForm}
                                selectedValue={this.state.selectedEventForm}
                                onValueChange={this.onValueChangeEventForm.bind(this)}
                            >
                                <Picker.Item label="Event Date" value="ed" />
                                <Picker.Item label="Event Location" value="el" />
                                <Picker.Item label="Free Question" value="fq" />
                            </Picker>
                        </Form>

                        <Form style={{ flexDirection: "row", flex: 0 }}>
                            <Text style={{ width: '15%', fontWeight: 'bold', marginLeft: 15, color: '#1da1f2', marginTop: 15, marginBottom: 10 }}>
                                Settings:
                            </Text>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={styles.pollSettings}
                                selectedValue={this.state.selectedEventSettings}
                                onValueChange={this.onValueChangeEventSettings.bind(this)}
                            >
                                <Picker.Item label="Public" value="p" />
                                <Picker.Item label="Friend Only" value="f" />
                            </Picker>
                            {chooseFriend}
                        </Form>
                        {participantContainer}
                    </Container>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        marginTop: 24
    },
    header: {
        backgroundColor: '#499fcd',
        flex: 0
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white'
    },
    backBtn: {
        color: 'white'
    },
    content: {
        flex: 0,
        paddingLeft: 5,
        paddingRight: 5
    },
    textInputLine: {
        marginRight: 15,
        marginLeft: 15,
    },
    textInput: {
        justifyContent: 'center',
        color: 'black',
        fontSize: 16,
    },
    textArea: {
        margin: 15,
        padding: 6,
        color: 'black',
        fontSize: 16,
    },
    eventDescriptionText: {
        marginLeft: 15,
        color: '#1da1f2',
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
        flex: 0
    },
    addFriendIcon: {
        color: 'white'
    },
    chooseFriendBtn: {
        backgroundColor: '#499fcd',
        borderRadius: 15,
        marginRight: 15,
        flex: 0,
        // width: '50%',
    },
    participantContainer: {
        flex: 0,
        height: 60,
        borderWidth: 0.5,
        borderColor: '#919191',
        margin: 15,
        alignItems: 'center',
        justifyContent: 'center',
    }
})