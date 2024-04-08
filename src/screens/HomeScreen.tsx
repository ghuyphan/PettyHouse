import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, Dimensions } from 'react-native';
import { Searchbar, FAB } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer'; // Adjust the path if needed
import TextDialog from '../components/modal/textDialog'; // Adjust the path if needed
import * as SecureStore from 'expo-secure-store';

import pb from '../services/pocketBase';
import * as Location from 'expo-location';
import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';

const windowHeight = Dimensions.get('window').height;
interface Marker {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
}

const HomeScreen = () => {
    const searchbarTop = windowHeight * 0.07;
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    let lastClickTime = 0;

    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVisible, setIsVisible] = React.useState(false);
    const mapRef = useRef<MapView>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);

    const requestLocationPermission = async () => {
        setIsVisible(false);
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
        } else if (timeSinceLastClick >= 1500) {
            const location = await Location.getCurrentPositionAsync({});
            await SecureStore.setItemAsync('lastLocation', location.coords.latitude + ',' + location.coords.longitude);
            const lastLocation = await SecureStore.getItemAsync('lastLocation');
            console.log(lastLocation);
            lastClickTime = currentTime;
            fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 10);
            mapRef.current?.animateCamera({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                pitch: 2, // Optional: Set the pitch angle
                heading: 20, // Optional: Set the heading angle
                altitude: 200, // Optional: Set the altitude
                zoom: 17, // Optional: Set the zoom level
            }, { duration: 1500 }); // Specify the duration of the animation in milliseconds
        }
    };

    const handleLocationFABPress = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsVisible(true); // Show the dialog
            return; // Permission not granted
        } else {
            requestLocationPermission(); // Permission already granted 
        }
    }

    const fetchRecordsWithinRadius = async function (centerLat: number, centerLon: number, radius: number) {
        const boundingBox = calculateBoundingBox(centerLat, centerLon, radius);

        // Query to fetch records within the bounding box
        const potentialRecords = await pb.collection('posts').getList(1, 50, {
            filter: `latitude >= ${boundingBox.minLat} && latitude <= ${boundingBox.maxLat} && longitude >= ${boundingBox.minLon} && longitude <= ${boundingBox.maxLon}`
        });

        const filteredRecords = potentialRecords.items.filter(record => {
            const distance = getDistanceFromLatLonInKm(
                { latitude: centerLat, longitude: centerLon },
                { latitude: record.latitude, longitude: record.longitude }
            );
            return distance <= radius;
        });

        const newMarkers = filteredRecords.map(record => ({
            coordinate: {
                latitude: record.latitude,
                longitude: record.longitude
            },
            title: record.text, // Assuming you have a 'title' field
        }));
        setMarkers(newMarkers);
    }

    useEffect(() => {
        const attemptInitialLocationFetch = async () => {
            try {
                let { status } = await Location.getForegroundPermissionsAsync();

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 10);
                } else {
                    // Handle case where permission is not granted initially
                    // You might want to display a message to the user
                    console.log('Location permission not granted'); 
                }
            } catch (error) {
                console.error('Error fetching location:', error);
                // Handle errors appropriately, e.g., display an error message to the user
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        attemptInitialLocationFetch();  
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                provider='google'
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                showsCompass={false}
                showsUserLocation={true}
                showsPointsOfInterest={false}
                showsMyLocationButton={false}
                showsBuildings={false}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        coordinate={marker.coordinate}
                        title="My Marker"
                        description={marker.title}
                    />
                ))}
            </MapView>
            <Searchbar
                placeholder={t('searchPlaceholder')}
                onChangeText={setSearchQuery}
                value={searchQuery}
                iconColor='#b5e1eb'
                selectionColor={'#b5e1eb'}
                style={{ position: 'absolute', top: searchbarTop, left: 10, right: 10 }}
            />
            <FAB
                style={{ position: 'absolute', bottom: 120, right: 20, borderRadius: 50 }}
                icon="crosshairs-gps"
                color={'#8ac5db'}
                onPress={handleLocationFABPress}
                variant='primary'
                rippleColor={'#b5e1eb'}
            />
            <FAB
                style={{ position: 'absolute', bottom: 30, right: 20, backgroundColor: '#8ac5db' }}
                color={'#fff'}
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
                title={t('locationPermissionTitle')}
                content={t('locationPermissionContent')}
                confirmLabel={t('locationPermissionButton')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1
    }
});

export default HomeScreen;
