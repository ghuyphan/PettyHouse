import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Platform, useWindowDimensions } from 'react-native';
import { FAB, Text, ActivityIndicator, Button, Snackbar, Icon } from 'react-native-paper';
import MapView, { Circle } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useSelector } from 'react-redux';
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedStyle,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetFlatList, BottomSheetFlatListMethods, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { debounce } from 'lodash';
import eventsource from "react-native-sse";
import 'react-native-url-polyfill/auto';
interface CustomEventSource extends EventSource {
    new(url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSED: 2;
}

//Component import
import { RootState } from '../store/rootReducer'; // Adjust the path if needed
import TextDialog from '../components/modal/textDialog'; // Adjust the path if needed
import SliderDialog from '../components/modal/sliderDialog';
import CustomMarker from '../components/marker/marker';
import pb from '../services/pocketBase';
import * as Location from 'expo-location';
import { constructImageURL } from '../utils/constructURLUtils';
import SearchbarComponent from '../components/searchBar/searchBar';
import BottomSheetItem from '../components/bottomSheet/bottomSheetItem';
import PopupDialog from '../components/modal/popupDialog';

//API import
import { fetchRecordsWithinRadius } from '../api/fetchRecordWithinRadius';

//Animation import
import { useBottomSheetTransitionManager } from '../animation/HomeScreen/BottomSheetTransitionManager';
import { useHeaderAnimation } from '../animation/HomeScreen/HeaderAnimation';

//Type import
import TypeMarker from '../types/markers';
import TypeCirlce from '../types/mapCircle';

const HomeScreen = () => {
    global.EventSource = eventsource as unknown as CustomEventSource;
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [buttonPressed, setButtonPressed] = useState('');
    const [circleProps, setCircleProps] = useState<TypeCirlce | null>(null);
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVisible, setIsVisible] = useState(false);
    const [sliderVisible, setSliderVisible] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [markers, setMarkers] = useState<TypeMarker[]>([]);
    const [isLoadingRegion, setIsLoadingRegion] = useState(false);
    const [radius, setRadius] = useState(2);

    const [zoomLevel, setZoomLevel] = useState(0);
    //Timer to prevent multiple button spam
    const [isLoadingData, setIsLoadingData] = useState(false);
    const lastFetchTime = useRef(0); // Store timestamp of last fetch (pet fab)
    const lastClickTime = useRef(0); // Store timestamp of last click (location fab)

    //Bottom sheet
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [activeView, setActiveView] = useState<'detail' | 'list'>('list');

    // Use the transition manager
    const { showDetail, showList, listStyle, detailStyle } = useBottomSheetTransitionManager(setActiveView);

    const flatListRef = useRef<BottomSheetFlatListMethods>(null);
    const bottomSheetPosition = useSharedValue<number>(0);
    const { height: windowHeight } = useWindowDimensions();
    const FABOffset = Platform.OS === 'ios' ? (windowHeight < 700 ? 150 : 170) : 90;
    const maxOffsetRatio = windowHeight < 700 ? 0.65 : 0.7;
    const maxOffset = windowHeight * maxOffsetRatio;
    const [bottomSheetSnapPoint, setBottomSheetSnapPoint] = useState(0);
    const [reason, setReason] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState('');

    const animatedFABStyle = useAnimatedStyle(() => {
        const availableSpace = windowHeight - bottomSheetPosition.value;
        const maxBottomPosition = windowHeight - maxOffset;
        const calculatedFABPosition = Math.min(availableSpace - FABOffset, maxBottomPosition);

        return {
            bottom: calculatedFABPosition,
        };
    });
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const relativePosition = windowHeight - bottomSheetPosition.value;
        const opacity = interpolate(
            relativePosition,
            [bottomSheetSnapPoint - 50, bottomSheetSnapPoint],
            [1, 0],
            'clamp'
        );
        const marginBottom = interpolate(
            relativePosition,
            [bottomSheetSnapPoint - 50, bottomSheetSnapPoint],
            [20, 10],
            'clamp'
        );
        const height = interpolate(
            relativePosition,
            [bottomSheetSnapPoint - 50, bottomSheetSnapPoint],
            [30, 0],
            'clamp'
        );

        return {
            opacity,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom,
            paddingHorizontal: 20,
            height,
        };
    });


    //Popup dialog animation 
    const containerPosition = useSharedValue(0);
    const containerScale = useSharedValue(0.1);
    const [isError, setIsError] = useState(false);
    const [haveRecordData, setHaveRecordData] = useState(false);
    const [popupMessage, setpopupMessage] = useState('');
    const handleSheetChanges = useCallback((index: number) => {
        if (haveRecordData === true) {
            if (index === 0) {
                flatListRef.current?.scrollToIndex({ index: 0, animated: false });
            }
        }
    }, [haveRecordData, flatListRef]); // Make sure flatListRef is stable


    //Animation
    const openPopupDialog = useCallback(() => {
        containerPosition.value = withTiming(90, { duration: 300, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
    }, []);

    const closePopupDialog = useCallback(() => {
        containerPosition.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
        containerScale.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
    }, []);

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
        setIsVisible(false); // Hide the element first

        try {  // Introduce a try-catch block for potential errors
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
                switch (buttonPressed) {
                    case 'location':
                        handleLocation();
                        break;
                    case 'fetchingPet':
                        handleFetchingPet(radius);
                        break;
                }
                handleLocation();
            }

        } catch (error) {
            console.error("Error requesting location permission:", error);
            // Handle general errors during the permission request
        }
    }


    const handleLocation = useCallback(async () => {
        setButtonPressed('location');
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

    const handleFetchingPet = useCallback(async (currentRadius: number) => {
        setButtonPressed('fetchingPet');
        const currentTime = Date.now();
        const timeSinceLastFetch = currentTime - lastFetchTime.current;
        const threshold = 2000; // 2 seconds minimum between fetches
        bottomSheetRef.current?.snapToIndex(0);

        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsVisible(true);
            return;
        }

        if (isLoadingData || timeSinceLastFetch < threshold) {
            return; // Ignore the request if still loading or threshold not met
        }

        setIsLoadingData(true);
        lastFetchTime.current = currentTime; // Update last fetch time early to prevent multiple triggers

        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsVisible(true);
                throw new Error('Location permission not granted');
            }

            const location = await Location.getCurrentPositionAsync({});
            await SecureStore.setItemAsync('lastLocation', JSON.stringify({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }));

            animateZoomMap(location.coords.longitude, location.coords.latitude, 15, 500, true);
            openPopupDialog();
            setIsError(false);
            setpopupMessage(t('fetchingData'));

            // Fetch posts within 2km hence the 2 for radius
            const records = await fetchRecordsWithinRadius(location.coords.latitude, location.coords.longitude, currentRadius);
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
                hasLiked: record.expand?.likes_via_post_id?.some((like) => like.user_id === userData?.id) || false,
                dislike: record.dislikeCount,
                username: record.expand?.user.username,
                avatar: record.expand?.user.avatar,
                created: record.created
            }));

            setMarkers(newMarkers);
            setCircleProps({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                radius: currentRadius * 1000,
            });

            setHaveRecordData(true);
        } catch (error) {
            console.error('Error fetching records:', error);
            setHaveRecordData(false);
            setIsError(true);
            setpopupMessage(t('errorFetchingData'));
            openPopupDialog();
        } finally {
            setTimeout(() => {
                closePopupDialog();
                setIsLoadingData(false); // Stop loading indicator
            }, 1200);
        }
    }, [isLoadingData, t, userData?.id]); // Ensure all necessary dependencies are included

    const updateRadius = async (value: number) => {
        setRadius(value);
        SecureStore.setItemAsync('radius', value.toString());
        setSliderVisible(false);
    };

    const toggleLike = async (postId: string) => {
        const token = await SecureStore.getItemAsync('authToken');

        try {
            // Track if a toggle request is already in progress
            let isRequestInProgress = false;
            setMarkers(prevMarkers => prevMarkers.map(marker =>
                marker.id === postId ? { ...marker, like: marker.hasLiked ? marker.like - 1 : marker.like + 1, hasLiked: !marker.hasLiked } : marker
            ));

            // Modify the toggle behavior
            const toggle = async () => {
                if (isRequestInProgress) return;

                isRequestInProgress = true;
                await pb.send(`/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                isRequestInProgress = false;
            };

            // Now directly call the toggle function
            toggle();

        } catch (error) {
            setMarkers(prevMarkers => prevMarkers.map(marker =>
                marker.id === postId ? { ...marker, like: marker.hasLiked ? marker.like - 1 : marker.like + 1, hasLiked: !marker.hasLiked } : marker
            ));
            // Handle error
            setpopupMessage('Error');
            openPopupDialog();
            setTimeout(() => {
                closePopupDialog();
            }, 2000);

        }
    };

    const debouncedToggleLike = useRef(debounce(toggleLike, 800)).current;

    const toggleReport = async (postId: string, reason: string) => {
        const token = await SecureStore.getItemAsync('authToken');

        try {
            let isRequestInProgress = false;
            if (isRequestInProgress) return;

            isRequestInProgress = true;
            const response = await pb.send(`/api/posts/${postId}/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            isRequestInProgress = false;
            setSnackbarText('Post reported successfully');
            setSnackbarVisible(true);
        } catch (error) {
            if (error instanceof Error) {
                setSnackbarText(error.message);
            }
            setSnackbarVisible(true);
            setpopupMessage('Error');
            openPopupDialog();
            setTimeout(() => {
                closePopupDialog();
            }, 2000);
        }
    };

    const handleSearchBarLayout = (searchbarBottom: number) => {
        // Define the desired space between the search bar and the bottom sheet
        let desiredSpace = 0;
        if (windowHeight < 700) {
            Platform.OS === 'ios' ? desiredSpace = 60 : desiredSpace = 20;
        } else {
            Platform.OS === 'ios' ? desiredSpace = 100 : desiredSpace = 10;
        }

        // Calculate the snap point for the bottom sheet, including the desired space
        const snapPoint = windowHeight - searchbarBottom - desiredSpace;
        setBottomSheetSnapPoint(snapPoint);
    };

    useEffect(() => {
        const subscribeToPosts = () => {
            pb.collection('posts').subscribe('*', (event) => {
                // console.log(event.action);  // You can check the action type: 'create', 'update', or 'delete'
                // console.log(event.record);  // This is the record that was changed
                updateMarkersState(event.record);
            }, { /* other options */ });
        };

        const updateMarkersState = (updatedRecord: any) => {
            setMarkers((prevMarkers) => {
                return prevMarkers.map(marker => {
                    if (marker.id === updatedRecord.id) {
                        return { ...marker, like: updatedRecord.likeCount };
                    }
                    return marker;
                });
            });
        };
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
        subscribeToPosts();
        // return () => backHandler.remove();
        return () => {
            pb.collection('posts').unsubscribe('*');
            backHandler.remove()  // Cleanup the subscription
        };
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
                        <CustomMarker key={index} marker={marker} index={index} bottomSheetRef={bottomSheetRef} flatListRef={flatListRef} />
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
            <Animated.View style={animatedFABStyle}>
                <FAB
                    size='small'
                    mode='elevated'
                    style={{ position: 'absolute', bottom: 80, left: 20, borderRadius: 50 }}
                    onPress={() => setSliderVisible(true)}
                    icon={'radar'}
                    color={'#8ac5db'}
                >
                </FAB>
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
                    onPress={() => {
                        handleFetchingPet(radius)
                    }}
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
            <SliderDialog
                dismissable={true}
                isVisible={sliderVisible}
                onDismiss={() => setSliderVisible(false)}
                onConfirm={updateRadius}
                title={t('radiusSliderTitle')}
                radius={radius}
                dismissLabel={t('cancelButton')}
                confirmLabel={t('changeButton')}
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
                snapPoints={haveRecordData ? [65, 300, bottomSheetSnapPoint] : [65]}
                animatedPosition={bottomSheetPosition}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}
                onChange={handleSheetChanges}
            >
                <Animated.View style={[styles.fullSize, listStyle]}>
                    {/* {activeView === 'list' && ( */}
                        <BottomSheetFlatList
                            ref={flatListRef}
                            data={markers}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={haveRecordData}
                            ListHeaderComponent={
                                <Animated.View style={headerAnimatedStyle}>
                                    {haveRecordData ? <Text style={{ fontSize: 20 }}>{t('lastestInYourArea')}</Text> :
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={{ fontSize: 20 }}>{t('tapBottomSheetHeader')}</Text>
                                            <View style={{ padding: 5, borderRadius: 10, backgroundColor: '#8ac5db' }} >
                                                <Icon source="paw" color={'#fff'} size={15} />
                                            </View>

                                            <Text style={{ fontSize: 20 }}>{t('noRecords')}</Text>
                                        </View>
                                    }

                                </Animated.View>
                            }
                            renderItem={({ item }) => (
                                <BottomSheetItem
                                    item={item}
                                    toggleLike={() => debouncedToggleLike(item.id)}
                                    toggleReport={(reason: string) => toggleReport(item.id, reason)}
                                    isLastItem={markers.indexOf(item) === markers.length - 1}
                                    showDetail={() => showDetail()}
                                />


                            )}
                        />
                    {/* )} */}
                </Animated.View>
                <Animated.View style={[styles.fullSize, detailStyle, { position: 'absolute', top: 0, left: 0, right: 0 }]}>
                    {activeView === 'detail' && (
                        <View style={ [styles.fullSize]}>
                            <Button onPress={showList}>Show List</Button>
                        </View>
                    )}
                        </Animated.View>

            </BottomSheet>
            <Snackbar
                wrapperStyle={{ bottom: 0 }}
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: t('close'),
                    labelStyle: { color: '#b5e1eb' },
                    onPress: () => {
                        setSnackbarVisible(false);
                    },
                    rippleColor: '#b5e1eb',
                }}
            >
                {snackbarText}
            </Snackbar>
            <SearchbarComponent
                onSearchUpdate={setSearchQuery}
                onSearchBarLayout={handleSearchBarLayout}
                bottomSheetPosition={bottomSheetPosition}
                lastSnapPoint={bottomSheetSnapPoint}
                bottomSheetRef={bottomSheetRef}
                activeView={activeView}
                showList={showList}
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
    contentContainer: {
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    fullSize: {
        width: '100%',
        height: '100%'
    }
});

export default HomeScreen;
