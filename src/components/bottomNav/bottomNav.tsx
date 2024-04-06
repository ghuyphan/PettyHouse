import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import HomeScreen from '../../screens/HomeScreen';

const BottomNav = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home' },
    { key: 'list', title: 'Profile', focusedIcon: 'account' },
    { key: 'profile', title: 'Settings', focusedIcon: 'account' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: () => <HomeScreen />,
    list: () => <View style={styles.container}><Text>{'List'}</Text></View>,
    profile: () => <View style={styles.container}><Text>{'Profile'}</Text></View>,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      theme={{ colors: { primary: '#b5e1eb', secondaryContainer: '#b5e1eb' } }}
    />
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})


export default BottomNav;