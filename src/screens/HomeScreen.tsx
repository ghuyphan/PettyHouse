import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Dimensions, Platform, Image } from 'react-native';
import { FAB, Text, ActivityIndicator, Avatar, Icon, Button } from 'react-native-paper';
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
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';

//Component import
import { RootState } from '../store/rootReducer'; // Adjust the path if needed
import TextDialog from '../components/modal/textDialog'; // Adjust the path if needed
import CustomMarker from '../components/marker/marker';
import pb from '../services/pocketBase';
import * as Location from 'expo-location';
import { constructImageURL } from '../utils/constructURLUtils';
import SearchbarComponent from '../components/searchBar/searchBar';
// import BottomSheetComponent from '../components/bottomSheet/bottomSheet';
import PopupDialog from '../components/modal/popupDialog';
//API import
import { fetchRecordsWithinRadius } from '../api/fetchRecordWithinRadius';

//Type import
import TypeMarker from '../types/markers';
import TypeCirlce from '../types/mapCircle';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

    const [zoomLevel, setZoomLevel] = useState(0);
    //Timer to prevent multiple button spam
    const [isLoadingData, setIsLoadingData] = useState(false);
    const lastFetchTime = useRef(0); // Store timestamp of last fetch (pet fab)
    const lastClickTime = useRef(0); // Store timestamp of last click (location fab)

    //Bottom sheet
    const bottomSheetRef = useRef<BottomSheet>(null);
    const bottomSheetPosition = useSharedValue<number>(0);
    const windowHeight = Dimensions.get('window').height;
    const animatedFABStyle = useAnimatedStyle(() => {
        const availableSpace = windowHeight - bottomSheetPosition.value;
        let maxOffset = 0;
        let FABOffset = 0;
        if (windowHeight < 700) {
            FABOffset = Platform.OS === 'ios' ? 150 : 90;
            maxOffset = windowHeight * 0.65;
        } else {
            FABOffset = Platform.OS === 'ios' ? 170 : 90;
            maxOffset = windowHeight * 0.7;
        }
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

    //Popup dialog animation 
    const containerPosition = useSharedValue(0);
    const containerScale = useSharedValue(0.1);
    const [isError, setIsError] = useState(false);
    const [haveRecordData, setHaveRecordData] = useState(false);
    const [popupMessage, setpopupMessage] = useState('');
    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        // console.log(bottomSheetPosition)
    }, []);

    //Animation
    const openPopupDialog = () => {
        containerPosition.value = withTiming(90, { duration: 300, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
    }
    const closePopupDialog = () => {
        containerPosition.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
    }
    const animateZoomMap = (longtitude: number, latitude: number, zoomLevel: number, duration: number, doZoom: boolean) => {
        if (doZoom) {
            mapRef.current?.animateCamera({
                center: {
                    latitude: latitude,
                    longitude: longtitude,
                },
                zoom: zoomLevel,
                heading: 0,
            }, { duration: duration });
            setZoomLevel(zoomLevel);
        } else {
            mapRef.current?.animateCamera({
                center: {
                    latitude: latitude,
                    longitude: longtitude,
                },
                heading: 0,
            }, { duration: 500 });
        }
    }

    const requestLocationPermission = async () => {
        setIsVisible(false);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            //If permission not granted, show error pop-up with error message
            setIsError(true);
            setpopupMessage(t('locationPermissionMessage'));
            openPopupDialog();
            setTimeout(() => {
                closePopupDialog();
            }, 2000);
        } else {
            handleLocation();
        }
    }

    const handleLocation = useCallback(async () => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime.current;
        const threshold = 500;
        bottomSheetRef.current?.snapToIndex(0);

        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsVisible(true);
            return;
        }
        if (timeSinceLastClick >= threshold) {
            try {
                const location = await Location.getCurrentPositionAsync();
                const currentRegion = await mapRef.current?.getMapBoundaries();
                const newZoom = zoomLevel === 15 ? 17 : 15;
                const lastLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };  // Save last location
                await SecureStore.setItemAsync('lastLocation', JSON.stringify(lastLocation));

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
                        animateZoomMap(location.coords.longitude, location.coords.latitude, newZoom, 500, true);

                    } else {
                        // User is outside the center region
                        animateZoomMap(location.coords.longitude, location.coords.latitude, 0, 500, false);

                    }
                }

                lastClickTime.current = currentTime;
            } catch (error) {
                console.error('Error getting location:', error);
            }
        }
    }, [lastClickTime, zoomLevel]);

    const handleFetchingPet = useCallback(async () => {
        const currentTime = Date.now();
        const timeSinceLastFetch = currentTime - lastFetchTime.current;
        const threshold = 2000; // 2 seconds minimum between fetches
        bottomSheetRef.current?.snapToIndex(0);

        if (isLoadingData || timeSinceLastFetch < threshold) {
            return; // Ignore the request if still loading or threshold not met
        }
        const { status } = await Location.getForegroundPermissionsAsync();

        setIsLoadingData(true); // Start loading indicator
        if (status !== 'granted') {
            lastFetchTime.current = currentTime;
            setIsLoadingData(false);
            setIsVisible(true);
            return;
        } else {
            try {
                const location = await Location.getCurrentPositionAsync({});
                const lastLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };  // Save last location
                await SecureStore.setItemAsync('lastLocation', JSON.stringify(lastLocation));

                animateZoomMap(location.coords.longitude, location.coords.latitude, 15, 500, true);
                openPopupDialog();
                setIsError(false);
                setpopupMessage(t('fetchingData'))

                //Fetch posts within 2km hence the 2 for radius
                const records = await fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, 2);
                const newMarkers = records.map(record => ({
                    id: record.id,
                    coordinate: {
                        latitude: record.latitude,
                        longitude: record.longitude
                    },
                    title: record.text,
                    address: record.address || '-',
                    image: constructImageURL(record.image, record.id),
                    like: record.likeCount,
                    dislike: record.dislike,
                    username: record.expand?.user.username,
                    avatar: record.expand?.user.avatar,
                }));

                setMarkers(newMarkers);
                setCircleProps({
                    center: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    },
                    radius: 2000,
                });
            } catch (error) {
                console.error('Error fetching records:', error);
                setHaveRecordData(false);
            } finally {
                setTimeout(() => {
                    closePopupDialog();
                    setIsLoadingData(false); // Stop loading indicator
                }, 1200);
                lastFetchTime.current = currentTime;
                setHaveRecordData(true);
            }
        }
    }, [isLoadingData]);

    const toggleLike = async (postId: string) => {
        const token = await SecureStore.getItemAsync('authToken');
    
        try {
            const response = await pb.send(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            // Update likes on the markers
            if (response.like) {
                // Like action
                setMarkers(prevMarkers => prevMarkers.map(marker => 
                    marker.id === postId ? {...marker, like: marker.like + 1} : marker
                ));
            } else {
                // Dislike action
                setMarkers(prevMarkers => prevMarkers.map(marker => 
                    marker.id === postId ? {...marker, like: marker.like - 1} : marker
                ));
            }
    
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

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

            {/* <SearchbarComponent onSearchUpdate={setSearchQuery} /> */}
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
                    disabled={isLoadingData}
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
            <PopupDialog
                isLoading={isLoadingData}
                message={popupMessage}
                containerPosition={containerPosition}
                containerScale={containerScale}
                textColor={'#8ac5db'}
                isError={isError}
            />
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={haveRecordData ? [65, 300, '85%'] : [65]}
                onChange={handleSheetChanges}
                animatedPosition={bottomSheetPosition}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}

            >
                <BottomSheetFlatList
                    data={markers}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={haveRecordData}
                    ListHeaderComponent={<Text style={{ fontSize: 20, paddingHorizontal: 20, marginBottom: 20 }}>{haveRecordData ? 'Lastest in your area' : "Let search to find nearby pet"}</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                {item.avatar ?
                                    <Avatar.Image source={{ uri: item.avatar }} size={35} style={styles.avatar} /> :
                                    <Avatar.Text label={item.username.slice(0, 2).toUpperCase()} size={35} style={styles.avatar} color='#fff' />
                                }
                                <View style={{ flexDirection: 'column', gap: 5 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '95%' }}>
                                        <Text style={styles.userName}>@{item.username}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Text style={{ color: '#888', fontSize: 13, width: '93%' }} numberOfLines={1}>{item.address}</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{ fontSize: 15, marginBottom: 10 }}>
                                {item.title}
                            </Text>
                            <Image source={{ uri: item.image }} style={{ width: '100%', aspectRatio: 1, resizeMode: 'cover', borderRadius: 15 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <TouchableOpacity onPress={() => toggleLike(item.id)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 20 }}>
                                        <Icon source="heart" size={25} color={'#FAA0A0'} />
                                        <Text style={{ color: '#FAA0A0', fontSize: 15 }}>{item.like}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updateLike(item.id)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 20 }}>
                                        <Icon source="heart" size={25} color={'#FAA0A0'} />
                                        <Text style={{ color: '#FAA0A0', fontSize: 15 }}>{item.like}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: '#f0f9fc', height: 5, width: '100%', marginTop: 20, marginBottom: 20, borderRadius: 5 }} />
                        </View>
                    )}
                />
            </BottomSheet>
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
    contentContainer: {
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: 20,
        flexDirection: 'column'
    },
    avatar: {
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
    },


});

export default HomeScreen;
