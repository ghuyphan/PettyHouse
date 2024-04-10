import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, ToastAndroid } from 'react-native';
import { Button, FAB, Text, ActivityIndicator } from 'react-native-paper';
import MapView, { Circle } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useSelector } from 'react-redux';

//Component import
import { RootState } from '../store/rootReducer'; // Adjust the path if needed
import TextDialog from '../components/modal/textDialog'; // Adjust the path if needed
import LoadingDialog from '../components/modal/loadingDialog';
import CustomMarker from '../components/marker/marker';
import pb from '../services/pocketBase';
import * as Location from 'expo-location';
import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';
import SearchbarComponent from '../components/searchBar/searchBar';

//Type import
import TypeMarker from '../types/markers';
import TypeCirlce from '../types/mapCircle';
import LoadingContainer from '../components/modal/loadingDialog';

const HomeScreen = () => {
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    let lastClickTime = 0;

    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [circleProps, setCircleProps] = useState<TypeCirlce | null>(null);
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [markers, setMarkers] = useState<TypeMarker[]>([]);


    const requestLocationPermission = async () => {
        setIsVisible(false);
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
            return;
        } else if (timeSinceLastClick >= 2000) {
            const location = await Location.getCurrentPositionAsync({});
            await SecureStore.setItemAsync('lastLocation', JSON.stringify({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }));
            // const lastLocation = await SecureStore.getItemAsync('lastLocation');
            setCircleProps({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                radius: 1000,
            });

            lastClickTime = currentTime;
            fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 1);
            mapRef.current?.animateCamera({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                pitch: 2, // Optional: Set the pitch angle
                heading: 20, // Optional: Set the heading angle
                altitude: 200, // Optional: Set the altitude
                zoom: 16, // Optional: Set the zoom level
            }, { duration: 1300 }); // Specify the duration of the animation in milliseconds
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
        // Create a bounding box around the center point
        setIsLoading(true);
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
            image: constructImageURL(record.image, record.id),
        }));
        setMarkers(newMarkers);
        setIsLoading(false);
    }
    const constructImageURL = (image: string, record: string) => {
        const baseURL = 'https://petty-house.pockethost.io/api/files/';
        const collectionId = 'fbj6nkb0oiiajw3'; // Replace with your actual collection ID
        const recordId = record; // Assuming your record has an 'id' field
        const fileName = image;

        return `${baseURL}${collectionId}/${recordId}/${fileName}`;
    }

    useEffect(() => {
        // const attemptInitialLocationFetch = async () => {
        //     try {
        //         let { status } = await Location.getForegroundPermissionsAsync();

        //         if (status === 'granted') {
        //             const location = await Location.getCurrentPositionAsync({});
        //             fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 10);
        //         } else {
        //             // Handle case where permission is not granted initially
        //             // You might want to display a message to the user
        //             console.log('Location permission not granted');
        //         }
        //     } catch (error) {
        //         console.error('Error fetching location:', error);

        //     }
        //     const lastLocationString = await SecureStore.getItemAsync('lastLocation');
        //     if (lastLocationString) {
        //         const lastLocation = JSON.parse(lastLocationString);
        //         setRegion({
        //             ...region,
        //             latitude: lastLocation.latitude,
        //             longitude: lastLocation.longitude
        //         });
        //         console.log(lastLocation);
        //     } 
        // };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        // attemptInitialLocationFetch();
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
                    <CustomMarker key={index} marker={marker} index={index} />
                ))}
                {circleProps && (
                    <Circle
                        center={circleProps.center}
                        radius={circleProps.radius}
                        strokeColor="#8ac5db"  // Your app's primary color 
                        fillColor="rgba(138, 197, 219, 0.2)"
                    />
                )}

            </MapView>

            <SearchbarComponent onSearchUpdate={setSearchQuery} />
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
            {isLoading && <View style={styles.loadingContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 10, backgroundColor: '#f0f9fc', borderRadius: 50 }}>
                    <ActivityIndicator>

                    </ActivityIndicator>
                    <Text>
                        Finding nearby pets...
                    </Text>
                </View>
            </View>}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 30,
        left: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default HomeScreen;
