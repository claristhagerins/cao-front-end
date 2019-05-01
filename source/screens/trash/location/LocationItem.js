import React, { PureComponent } from 'react';
import {  StyleSheet } from 'react-native';
import {View, Text, Button } from 'native-base';

class LocationItem extends PureComponent {
    render() {
        return (
            <Button transparent block style={styles.descBtn}>
                <Text style={{fontWeight: 'bold', fontSize: 18, color:'#828282'}} uppercase={false}>
                    {this.props.description}
                </Text>
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    descBtn: {
        marginTop: 5,
        paddingRight: 15,
        paddingBottom: 15,
        justifyContent: 'flex-start',
    }
})
export default LocationItem;