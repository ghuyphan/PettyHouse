import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, Text } from 'react-native';
import { Searchbar, FAB, BottomNavigation } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/rootReducer';
import TextDialog from '../components/modal/textDialog';
import * as Location from 'expo-location';

const HomeScreen = () => {
    const [region, setRegion] = useState({
        latitude: 37.78825,   // Replace with an initial latitude
        longitude: -122.4324,  // Replace with an initial longitude
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVisible, setIsVisible] = React.useState(false);
    const [index, setIndex] = useState(0);
    const mapRef = useRef<MapView>(null);

    const [routes] = useState([
        { key: 'map', title: t('map'), focusedIcon: 'map-marker' },
        { key: 'list', title: t('list'), focusedIcon: 'format-list-bulleted' },
        { key: 'profile', title: t('profile'), focusedIcon: 'account' },
    ]);
    useEffect(() => {
        console.log(userData);
    }, []);

    const requestLocationPermission = async () => {
        setIsVisible(false);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
        } else {
            const location = await Location.getCurrentPositionAsync({});
            const region = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }
            mapRef.current?.animateCamera({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                pitch: 2, // Optional: Set the pitch angle
                heading: 20, // Optional: Set the heading angle
                altitude: 200, // Optional: Set the altitude
                zoom: 19, // Optional: Set the zoom level
            }, { duration: 1000 }); // Specify the duration of the animation in milliseconds
        }
    };

    const handleLocationFABPress = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsVisible(true); // Show the dialog
        } else {
            requestLocationPermission(); // Permission already granted 
        }
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    const renderScene = BottomNavigation.SceneMap({
        map: () => (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                region={region}
                showsCompass={false}
                showsUserLocation={true}
                showsPointsOfInterest={false}
            >
                <Marker
                    coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude
                    }}
                    title="My Marker"
                    description="Example marker"
                />
            </MapView>
            <Searchbar
                placeholder={t('searchPlaceholder')}
                onChangeText={setSearchQuery}
                value={searchQuery}
                iconColor='#b5e1eb'
                selectionColor={'#b5e1eb'}
                style={{ position: 'absolute', top: 50, left: 10, right: 10 }}
            />
            <FAB
                style={{ position: 'absolute', bottom: 150, right: 20, borderRadius: 50 }}
                icon="crosshairs-gps"
                color = {'#b5e1eb'}
                onPress={handleLocationFABPress}
                variant='primary'
                rippleColor={'#b5e1eb'}
            />
            <FAB
                style={{ position: 'absolute', bottom: 70, right: 20, backgroundColor: '#b5e1eb' }}
                color = {'#fff'}
                icon="plus-circle"
                onPress={() => console.log('Pressed')}
                variant='primary'
                rippleColor={'#f0f9fc'}
            />
            <TextDialog
                dismissable={false}
                icon='map-marker'
                isVisible={isVisible}
                onDismiss={requestLocationPermission}
                title="Petty House need location access"
                content="Your location is used to show your location on the map and required to find pets in your area."
                confirmLabel={t('allow')}
            />
        </View>
        ),
        list: () => <View style={styles.container}><Text>{t('listScreenContent')}</Text></View>,
        profile: () => <View style={styles.container}><Text>{t('profileScreenContent')}</Text></View>,
    });

    return (
        <>
            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
                theme={{ colors: { primary: '#b5e1eb', secondaryContainer: '#b5e1eb' } }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1
    },
    searchbar: {
        position: 'absolute',
        top: 50,
        left: 10,
        right: 10,
    },
    locationFAB: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    addFAB: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    }

});

export default HomeScreen;
