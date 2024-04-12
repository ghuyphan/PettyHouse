import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Dimensions, Platform } from 'react-native';
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
import { constructImageURL } from '../utils/constructURLUtils';
import SearchbarComponent from '../components/searchBar/searchBar';
import BottomSheetComponent from '../components/button/bottomSheet';

//API import
import { fetchRecordsWithinRadius } from '../api/fetchRecordWithinRadius';

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

    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [circleProps, setCircleProps] = useState<TypeCirlce | null>(null);
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVisible, setIsVisible] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [markers, setMarkers] = useState<TypeMarker[]>([]);
    const [isLoadingRegion, setIsLoadingRegion] = useState(false);

    const [zoomLevel, setZoomLevel] = useState(15);
    //Timer to prevent multiple button spam
    const [isLoadingData, setIsLoadingData] = useState(false);
    const lastFetchTime = useRef(0); // Store timestamp of last fetch (pet fab)
    const lastClickTime = useRef(0); // Store timestamp of last click (location fab)

    //Bottom sheet
    const bottomSheetPosition = useSharedValue<number>(0);
    const windowHeight = Dimensions.get('window').height;
    const animatedFABStyle = useAnimatedStyle(() => {
        const availableSpace = windowHeight - bottomSheetPosition.value;
        const maxOffset = windowHeight * 0.7;
        const FABOffset = Platform.OS === 'ios' ? 170 : 90; // Adjust as needed
        const maxBottomPosition = windowHeight - maxOffset;

        let calculatedFABPosition = availableSpace - FABOffset;

        // Limit upward movement when enough space is available
        if (calculatedFABPosition > maxBottomPosition) {
            calculatedFABPosition = maxBottomPosition;
        }

        return {
            bottom: calculatedFABPosition,
        };
    });

    //Animation
    const containerPosition = useSharedValue(0);
    const containerScale = useSharedValue(0.1);
    const animatedLoadingStyle = useAnimatedStyle(() => {
        return {
            bottom: containerPosition.value,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            backgroundColor: '#f0f9fc',
            borderRadius: 50,
            transform: [{ scale: containerScale.value }]
        };
    });
    const [haveRecordData, setHaveRecordData] = useState(false);
    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        // console.log(bottomSheetPosition)
    }, []);

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

    const handleLocation = useCallback(async () => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime.current;
        const threshold = 500;

        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsVisible(true);
            return;
        }
        if (timeSinceLastClick >= threshold) {
            try {
                const location = await Location.getCurrentPositionAsync({});
                const currentRegion = await mapRef.current?.getMapBoundaries();
                const newZoom = zoomLevel === 15 ? 17 : 15;

                if (currentRegion) {
                    const centerThreshold = 0.9;

                    const centerRegion = {
                        northEast: {
                            latitude: currentRegion.northEast.latitude - (currentRegion.northEast.latitude - currentRegion.southWest.latitude) * centerThreshold / 2,
                            longitude: currentRegion.northEast.longitude - (currentRegion.northEast.longitude - currentRegion.southWest.longitude) * centerThreshold / 2,
                        },
                        southWest: {
                            latitude: currentRegion.southWest.latitude + (currentRegion.northEast.latitude - currentRegion.southWest.latitude) * centerThreshold / 2,
                            longitude: currentRegion.southWest.longitude + (currentRegion.northEast.longitude - currentRegion.southWest.longitude) * centerThreshold / 2,
                        }
                    };

                    if (location.coords.latitude >= centerRegion.southWest.latitude &&
                        location.coords.latitude <= centerRegion.northEast.latitude &&
                        location.coords.longitude >= centerRegion.southWest.longitude &&
                        location.coords.longitude <= centerRegion.northEast.longitude) {
                        // User is within the center region
                        mapRef.current?.animateCamera({
                            center: {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            },
                            zoom: newZoom,
                            heading: 0,
                        }, { duration: 400 });
                        setZoomLevel(newZoom);

                    } else {
                        // User is outside the center region
                        mapRef.current?.animateCamera({
                            center: {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            },
                            heading: 0,
                        }, { duration: 500 });
                    }
                }

                lastClickTime.current = currentTime;
            } catch (error) {
                console.error('Error getting location:', error);
                // Handle the error 
            }
        }
    }, [lastClickTime, zoomLevel]);


    const handleFetchingPet = useCallback(async () => {
        const currentTime = Date.now();
        const timeSinceLastFetch = currentTime - lastFetchTime.current;
        const threshold = 2000; // 3 seconds minimum between fetches

        if (isLoadingData || timeSinceLastFetch < threshold) {
            return; // Ignore the request if still loading or threshold not met
        }

        setIsLoadingData(true); // Start loading indicator

        try {
            const { status } = await Location.getForegroundPermissionsAsync();

            if (status !== 'granted') {
                setIsVisible(true);
                return;
            } else {
                containerPosition.value = withTiming(85, { duration: 400, easing: Easing.inOut(Easing.ease) });
                containerScale.value = withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) });

                const location = await Location.getCurrentPositionAsync({});

                mapRef.current?.animateCamera({
                    center: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    },
                    zoom: 15,
                    heading: 0,
                }, { duration: 500 });
                setZoomLevel(15);

                const records = await fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 2);

                const newMarkers = records.map(record => ({
                    coordinate: {
                        latitude: record.latitude,
                        longitude: record.longitude
                    },
                    title: record.text,
                    image: constructImageURL(record.image, record.id),
                }));

                setMarkers(newMarkers);
                setCircleProps({
                    center: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    },
                    radius: 2000,
                });
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            setHaveRecordData(false);
        } finally {
            setTimeout(() => {
                containerPosition.value = withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) });
                containerScale.value = withTiming(0.1, { duration: 400, easing: Easing.inOut(Easing.ease) });
            }, 1200);
            setIsLoadingData(false); // Stop loading indicator
            lastFetchTime.current = currentTime;
            setHaveRecordData(true);
        }
    }, [isLoadingData]);

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
            <Animated.View style={animatedFABStyle}>
                <FAB
                    style={{ position: 'absolute', bottom: 160, right: 20, borderRadius: 50 }}
                    icon={zoomLevel === 15 ? 'crosshairs-gps' : 'compass'}
                    color={'#8ac5db'}
                    onPress={handleLocation}
                    variant='primary'
                    rippleColor={'#b5e1eb'}
                />

                <FAB
                    style={{ position: 'absolute', bottom: 80, right: 20, backgroundColor: '#8ac5db' }}
                    color={'#fff'}
                    icon="paw"
                    onPress={handleFetchingPet}
                    variant='primary'
                    rippleColor={'#f0f9fc'}
                />
            </Animated.View>
            <TextDialog
                dismissable={false}
                icon='map-marker-outline'
                isVisible={isVisible}
                onDismiss={requestLocationPermission}
                title={t('locationPermissionTitle')}
                content={t('locationPermissionContent')}
                confirmLabel={t('locationPermissionButton')}
            />
            <View style={styles.loadingContainer}>
                <Animated.View style={animatedLoadingStyle}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <ActivityIndicator size="small" color={'#8ac5db'} />
                        <Text style={{ color: '#8ac5db', fontWeight: 'bold', fontSize: 14 }}>{t('fetchingData')}</Text>
                    </View>
                </Animated.View>
            </View>
            <BottomSheetComponent
                title={haveRecordData ? 'Lastest in your area' : "Let search to find nearby pet"}
                onChange={handleSheetChanges}
                animatedPosition={bottomSheetPosition}
                snapPoint={haveRecordData ? [65, 300, 600] : [65]}
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
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
