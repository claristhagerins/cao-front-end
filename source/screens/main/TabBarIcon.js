import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon, Container } from 'native-base';
import Colors from '../../constant/Colors';

export default class TabBarIcon extends React.Component {
  render() {
    return (
      <Container style={styles.container}>
      <Icon
        name={this.props.name}
        size={40}
        style={this.props.focused ? styles.tabIconSelected : styles.tabIconDefault}
        // color={this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  tabIconSelected: {
    marginBottom: 4,
    color: '#1da1f2',
  },
  tabIconDefault: {
    marginBottom: 4,
    color: '#c1c1c1'
  },
  container: {
    width: '100%',
    margin: 5
  }
})