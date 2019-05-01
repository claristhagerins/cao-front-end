import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { Root } from "native-base";
import firebase from '../../config/Firebase';
import App from '../../../App';
import { Font, AppLoading } from "expo";

export default class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            loading: true,
        };
    }

    async componentWillMount() {
        await Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
        });
    }

    componentDidMount() {
        const { currentUser } = firebase.auth()
        this.setState({ currentUser })
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.navigation.navigate('Main');
            } else {
                this.props.navigation.navigate('Login');
            }
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <Root>
                    <AppLoading />
                </Root>
            );
        }

        return (
            <ImageBackground
                source={require('../../../assets/screenBackground/splashScreen.jpg')}
                style={styles.bgImage}>
            </ImageBackground>
        )
    }
}
const styles = StyleSheet.create({
    bgImage: {
        height: '100%',
        width: '100%'
    }
})