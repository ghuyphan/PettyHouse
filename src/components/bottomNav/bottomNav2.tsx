import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import HomeScreen from '../../screens/HomeScreen';
import { useTranslation } from 'react-i18next';

const BottomNav2 = () => {
    const [index, setIndex] = React.useState(0);
    const { t } = useTranslation();
    const HomeRoute = () => <HomeScreen/>;
    const ListRoute = () => <View style={styles.container}><Text>Nearby</Text></View>;
    const ProfileRoute = () => <View style={styles.container}><Text>Profile</Text></View>;
    const SettingRoute = () => <View style={styles.container}><Text>Setting</Text></View>;
    
    const [routes] = React.useState([
        { key: 'home', title: t('explore'), focusedIcon: 'map-marker', unfocusedIcon: 'map-marker-outline' },
        { key: 'list', title: 'Nearby', focusedIcon: 'near-me', unfocusedIcon: 'near-me' },
        { key: 'profile', title: 'Profile', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
        { key: 'setting', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        home: HomeRoute,
        list: ListRoute,
        profile: ProfileRoute,
        setting: SettingRoute,
    });

    return (
        <BottomNavigation
            
            sceneAnimationEnabled
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            theme={{ colors: { primary: '#FFFF', secondaryContainer: '#d2edf7' } }}
            activeColor='#8ac5db'

        />
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})


export default BottomNav2;