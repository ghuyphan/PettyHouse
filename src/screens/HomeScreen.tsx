import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, ToastAndroid } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import MapView, { Circle } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useSelector } from 'react-redux';
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedStyle,
} from 'react-native-reanimated';

//Component import
import { RootState } from '../store/rootReducer'; // Adjust the path if needed
import TextDialog from '../components/modal/textDialog'; // Adjust the path if needed
import CustomMarker from '../components/marker/marker';
import pb from '../services/pocketBase';
import * as Location from 'expo-location';
import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';
import SearchbarComponent from '../components/searchBar/searchBar';

//Type import
import TypeMarker from '../types/markers';
import TypeCirlce from '../types/mapCircle';

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
    const containerPosition = useSharedValue(-500);
    const containerScale = useSharedValue(1);
    const mapRef = useRef<MapView>(null);
    const [markers, setMarkers] = useState<TypeMarker[]>([]);
    const [isLoadingRegion, setIsLoadingRegion] = useState(false);
    const animatedLoadingStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            bottom: containerPosition.value,
            left: 110,
            right: 110,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            backgroundColor: '#f0f9fc',
            borderRadius: 50,
            transform: [{ scale: containerScale.value }] 
        };
    });

    const handleLocation = async () => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status == 'granted') {
            if (timeSinceLastClick >= 1200) {
                const location = await Location.getCurrentPositionAsync({});
                await SecureStore.setItemAsync('lastLocation', JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }));

                mapRef.current?.animateCamera({
                    center: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    },
                    zoom: 15
                }, { duration: 1200 });
                lastClickTime = currentTime;
            }

        } else {
            setIsVisible(true);
            return;
        }
    };

    const handleFetchingPet = async () => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            setIsVisible(true);
            return;
        } else if (timeSinceLastClick >= 2000) {
            const location = await Location.getCurrentPositionAsync({});
            await fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 2);
            setCircleProps({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                radius: 2000,
            });
            lastClickTime = currentTime;
        }
    }
    const requestLocationPermission = async () => {
        setIsVisible(false);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            // ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
            return;
        } else {
            handleLocation();
        }
    }

    const fetchRecordsWithinRadius = async function (centerLat: number, centerLon: number, radius: number) {
        // Create a bounding box around the center point
        // setIsLoading(true);
        containerPosition.value = withTiming(30, { duration: 500, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) });
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
        containerPosition.value = withTiming(-500, { duration: 1000, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(0.1, { duration: 500, easing: Easing.inOut(Easing.ease) }); // Scale up
        // setIsLoading(false);
    }
    const constructImageURL = (image: string, record: string) => {
        const baseURL = 'https://petty-house.pockethost.io/api/files/';
        const collectionId = 'fbj6nkb0oiiajw3'; // Replace with your actual collection ID
        const recordId = record; // Assuming your record has an 'id' field
        const fileName = image;

        return `${baseURL}${collectionId}/${recordId}/${fileName}`;
    }

    useEffect(() => {
        const fetchLastLocation = async () => {
            setIsLoadingRegion(true);
            const lastLocationString = await SecureStore.getItemAsync('lastLocation');
            if (lastLocationString) {
                const lastLocation = JSON.parse(lastLocationString);
                setRegion({
                    ...region,
                    latitude: lastLocation.latitude,
                    longitude: lastLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
            else {
                setRegion({
                    ...region,
                    latitude: 10.762622,
                    longitude: 106.660172,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
            setIsLoadingRegion(false);
        }
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        fetchLastLocation();
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            {isLoadingRegion ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f9fc' }}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
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
            )}

            <SearchbarComponent onSearchUpdate={setSearchQuery} />
            <FAB
                style={{ position: 'absolute', bottom: 120, right: 20, borderRadius: 50 }}
                icon="crosshairs-gps" // Dynamically change icon
                color={'#8ac5db'}
                onPress={handleLocation} // Update onPress behavior
                variant='primary'
                rippleColor={'#b5e1eb'}
            />

            <FAB
                style={{ position: 'absolute', bottom: 30, right: 20, backgroundColor: '#8ac5db' }}
                color={'#fff'}
                icon="paw"
                onPress={handleFetchingPet}
                variant='primary'
                rippleColor={'#f0f9fc'}
            />
            <TextDialog
                dismissable={false}
                icon='map-marker-outline'
                isVisible={isVisible}
                onDismiss={requestLocationPermission}
                title={t('locationPermissionTitle')}
                content={t('locationPermissionContent')}
                confirmLabel={t('locationPermissionButton')}
            />
            {/* {isLoading && ( */}
                <Animated.View style={animatedLoadingStyle}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <ActivityIndicator />
                        <Text>Finding nearby pets...</Text>
                    </View>
                </Animated.View>
            {/* )} */}


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
