import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image, ActivityIndicator, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import { Button, Text, IconButton, TextInput, Avatar, Icon, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import pb from '../services/pocketBase';
import { RootState } from '../store/rootReducer';
import { Cloudinary } from "@cloudinary/url-gen";
import axios from 'axios';
import TextDialog2Btn from '../components/modal/textDialog2Btn';
import TextDialog from '../components/modal/textDialog';

interface SettingsProps { }

const CreateNewScreen: React.FC<SettingsProps> = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [textPost, setTextPost] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const textInputRef = useRef<TextInput>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const userData = useSelector((state: RootState) => state.user.userData);
    const [isVerified, setIsVerified] = useState(false);
    const [isCheckingVerification, setIsCheckingVerification] = useState(true);
    const [locationOption, setLocationOption] = useState('current');
    const [chosenLocation, setChosenLocation] = useState('');
    const [locationAddress, setLocationAddress] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isIconDialogVisible, setIsIconDialogVisible] = useState(false);
    const [isIconDialogMessage, setIsIconDialogMessage] = useState('');

    const [isBottomSheetClosable, setIsBottomSheetClosable] = useState(true);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const cld = new Cloudinary({
        cloud: {
            cloudName: 'huyphan'
        },
        url: {
            secure: true
        }
    });

    const userId = useMemo(() => userData?.id, [userData]);

    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!userId) return;
            setIsCheckingVerification(true);
            try {
                const response = await pb.authStore.model?.verified;
                setIsVerified(response);
            } catch (error) {
                console.log(error);
            }
            setIsCheckingVerification(false);
        };

        checkVerificationStatus();
    }, [userId]);

    const scrollY = useSharedValue(0);
    const headerSmallStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [45, 50], [0, 1]);
        return { opacity: opacity };
    });
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const handleClose = () => {
        if (textPost.length > 0 || images.length > 0) {
            setIsDialogVisible(true);
        } else {
            confirmClose();
        }
    };

    const confirmClose = () => {
        setIsDialogVisible(false);
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
            setTimeout(() => {
                navigation.goBack();
            }, 500); // Wait for the keyboard dismiss animation to complete
        } else {
            navigation.goBack();
        }
    };

    const handleLocation = async () => {
        bottomSheetRef.current?.snapToIndex(0);
    }

    const handleOpenGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            setIsIconDialogMessage(t('galleryPermissionRequired'));
            setIsIconDialogVisible(true);
            return;
        }
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 4],
            allowsMultipleSelection: true, // Allow multiple selection
        });

        if (!pickerResult.canceled) {
            const selectedImages = pickerResult.assets ? pickerResult.assets.map((image) => image.uri) : [];
            if (selectedImages.length > 3) {
                setIsIconDialogMessage(t('maxImages'));
                setIsIconDialogVisible(true);
                return;
            }
            setImages((prevImages) => {
                const totalImages = prevImages.length + selectedImages.length;
                if (totalImages > 3) {
                    setIsIconDialogMessage(t('maxImages'));
                    setIsIconDialogVisible(true);
                    return prevImages;
                }
                return [...prevImages, ...selectedImages];
            });
        }
    };

    const handleOpenCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            setIsIconDialogMessage(t('cameraPermissionRequired'));
            setIsIconDialogVisible(true);
            return;
        }
        const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
        });
        if (!pickerResult.canceled) {
            setImages((prevImages) => [...prevImages, pickerResult.assets[0].uri]);
        }
    };

    const handlePost = async () => {
        if (images.length === 0) {
            setIsIconDialogMessage(t('selectAtLeastOneImage'));
            setIsIconDialogVisible(true);
            return;
        }

        setIsLoading(true);

        try {
            let postLatitude = latitude;
            let postLongitude = longitude;
            let postAddress: string | null = locationAddress;

            if (locationOption === 'current') {
                // 1. Get User's Current Location
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setIsIconDialogMessage(t('locationPermissionRequired'));
                    setIsIconDialogVisible(true);
                    setIsLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                postLatitude = location.coords.latitude;
                postLongitude = location.coords.longitude;

                // 2. Reverse Geocode for Current Location
                const geocodeUrl = `https://geocode.maps.co/reverse?lat=${postLatitude}&lon=${postLongitude}&api_key=6614d73195ef9945990294agr2e2a9e`;
                const geocodeResponse = await axios.get(geocodeUrl);

                if (geocodeResponse.data && geocodeResponse.data.display_name) {
                    const displayName = geocodeResponse.data.display_name;
                    postAddress = displayName ? displayName.trim() : null;
                    const addressParts = postAddress?.split(", ");
                    const firstTwoParts = addressParts?.slice(0, 2);
                    postAddress = firstTwoParts?.join(", ");
                    const districtMatch = postAddress?.match(/District\s+(\w+)/);
                    if (districtMatch) {
                        const districtName = districtMatch[1];
                        postAddress = postAddress?.replace(districtMatch[0], districtName.match(/^\d+$/) ? "District " + districtName : districtName + " District");
                    }
                    postAddress = postAddress?.replace(/\s+/g, " ").trim();
                } else {
                    console.warn("Geocoding failed to retrieve address.");
                    postAddress = null;
                }
            }

            // 3. Upload Images to Cloudinary
            const uploadedImageUrls = await Promise.all(
                images.map(async (imageUri) => {
                    const fetchResponse = await fetch(imageUri);
                    const blob = await fetchResponse.blob();

                    const formData = new FormData();
                    formData.append('file', {
                        uri: imageUri,
                        type: 'image/jpeg',
                        name: `upload_${Date.now()}.jpg`,
                    });
                    formData.append('upload_preset', 'qfvwzasi');
                    console.log(formData);

                    const postResponse = await axios.post(
                        `https://api.cloudinary.com/v1_1/huyphan/image/upload`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );

                    return postResponse.data.secure_url;
                })
            );


            // 4. Create New Post Object
            const newPost = {
                image1: uploadedImageUrls[0] || null,
                image2: uploadedImageUrls[1] || null,
                image3: uploadedImageUrls[2] || null,
                text: textPost,
                user: userData?.id,
                visible: true,
                latitude: postLatitude,
                longitude: postLongitude,
                address: postAddress,
            };

            // 5. Save Post to PocketBase
            await pb.collection('posts').create(newPost);

            // 6. Success Actions
            setImages([]);
            setTextPost('');
            setIsLoading(false);
            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error);
            setIsLoading(false);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Cloudinary or Geocoding Error:', error.response.data);
                    setIsIconDialogMessage(t('cloudinaryGeocodingError'));
                    setIsIconDialogVisible(true);
                } else if (error.request) {
                    console.error('No response from server:', error.request);
                    setIsIconDialogMessage(t('noServerResponse'));
                    setIsIconDialogVisible(true);
                } else {
                    console.error('Error:', error.message);
                    setIsIconDialogMessage(t('unknownError'));
                    setIsIconDialogVisible(true);
                }
            } else {
                console.error('Unexpected error:', error);
                setIsIconDialogMessage(t('unexpectedError'));
                setIsIconDialogVisible(true);
            }
        }
    };


    const handleSaveLocation = async () => {
        if (locationOption === 'chosen') {
            if (!chosenLocation) {
                setIsIconDialogMessage(t('enterValidLocation'));
                setIsIconDialogVisible(true);
                return;
            }
            try {
                // Construct the geocode URL
                setIsLoadingLocation(true);
                const geocodeUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(chosenLocation)}&api_key=6614d73195ef9945990294agr2e2a9e`;

                // Fetch the geocode response
                const geocodeResponse = await axios.get(geocodeUrl);

                // Check if the response contains valid data
                if (geocodeResponse.data && geocodeResponse.data[0]) {
                    // Update the state with the new location data
                    const locationData = geocodeResponse.data[0];
                    console.log(locationData);
                    setLatitude(locationData.lat);
                    setLongitude(locationData.lon);
                    setLocationAddress(chosenLocation);
                    setIsLoadingLocation(false);

                    // Close the bottom sheet
                    bottomSheetRef.current?.close();
                } else {
                    // Show the location dialog if geocoding fails
                    setIsIconDialogMessage(t('locationNotFound'));
                    setIsIconDialogVisible(true);
                    setIsLoadingLocation(false);
                    console.error('Geocoding failed to retrieve address.');
                }
            } catch (error) {
                // Handle and log any errors that occur during geocoding
                console.error('Geocoding Error:', error);
                setIsIconDialogMessage(t('geocodingError'));
                setIsIconDialogVisible(true);
                setIsLoadingLocation(false);
            }
        } else {
            // Close the bottom sheet without running geocode if the location option is not 'chosen'
            bottomSheetRef.current?.close();
        }
    };


    const snapPoints = useMemo(() => ['35%'], []);

    if (isCheckingVerification) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8ac5db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.modalBackground}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.modalText}>{t('uploadingPost')}</Text>
                </View>
            </Modal>
            <TextDialog2Btn
                isVisible={isDialogVisible}
                onDismiss={() => setIsDialogVisible(false)}
                onConfirm={confirmClose}
                title={t('confirmExit')}
                content={t('unsavedChanges')}
                confirmLabel={t('yes')}
                confirmTextColor='#FF5733'
                dismissLabel={t('no')}
            />
            <TextDialog
                icon='alert-outline'
                isVisible={isIconDialogVisible}
                onDismiss={() => setIsIconDialogVisible(false)}
                title={t('attention')}
                content={isIconDialogMessage}
                confirmLabel={t('ok')}
            />
            {!isVerified ? (
                <View style={styles.container}>
                    <IconButton
                        style={styles.backButton}
                        icon="close"
                        size={25}
                        onPress={handleClose}
                    />
                    <View style={styles.unverifiedContainer}>
                        <Text style={styles.unverifiedText}>Please verify to create a new post.</Text>
                    </View>
                </View>
            ) : (
                <Animated.ScrollView
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerText}>{t('createPost')}</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            {userData?.avatar ? (
                                <Avatar.Image source={{ uri: userData?.avatar }} size={50} />
                            ) : (
                                <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={50} color="#fff" />
                            )}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{userData?.username}</Text>
                                <TouchableOpacity onPress={() => handleLocation()}>
                                    <View style={styles.locationContainer}>
                                        <Icon source={locationOption === 'current' ? 'navigation-variant' : 'map-marker'} color={'#8ac5db'} size={15}></Icon>
                                        <Text style={{ color: '#8ac5db', fontWeight: 'bold' }}>{locationOption === 'current' ? t('currentLocation') : t('chosenLocation')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableWithoutFeedback onPress={() => textInputRef.current?.focus()}>
                            <View style={{ flex: 1, marginHorizontal: -10 }}>
                                <TextInput
                                    value={textPost}
                                    onChangeText={setTextPost}
                                    mode="flat"
                                    placeholder={t('writeSomething')}
                                    multiline
                                    ref={textInputRef}
                                    verticalAlign="top"
                                    selectionColor="#8ac5db"
                                    cursorColor='#8ac5db'
                                    underlineStyle={{ backgroundColor: 'transparent' }}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    style={{ backgroundColor: 'transparent' }} // Ensure the text input aligns text at the top
                                />
                                <View style={styles.imagesContainer}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {images.map((imageUri, index) => (
                                            <View key={index} style={styles.selectedImageContainer}>
                                                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                                                <IconButton
                                                    icon="close"
                                                    iconColor='#8ac5db'
                                                    size={13}
                                                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                                                    style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#f0f9fc' }}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                    {images.length < 3 && (
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <IconButton icon="image" size={20} iconColor="#8ac5db" onPress={handleOpenGallery} style={{ backgroundColor: 'transparent' }} />
                                            <IconButton icon="camera" size={20} iconColor="#8ac5db" onPress={handleOpenCamera} style={{ backgroundColor: 'transparent' }} />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </Animated.ScrollView>
            )}

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}
                snapPoints={snapPoints}
                enablePanDownToClose={isBottomSheetClosable}
                keyboardBehavior='interactive' // Use 'interactive' to move with the keyboard
                keyboardBlurBehavior='restore'
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} pressBehavior={'none'} />
                )}
            >
                <BottomSheetScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
                    <View style={styles.bottomSheetItem}>
                        <RadioButton.Group onValueChange={(value) => {
                            setLocationOption(value);
                            setIsBottomSheetClosable(value === 'current');
                        }} value={locationOption}>
                            <RadioButton.Item label={t('currentLocation')} value="current" />
                            <RadioButton.Item label={t('chosenLocation')} value="chosen" />
                        </RadioButton.Group>
                        <View style={locationOption === 'chosen' ? styles.activeBottomSheetInputContainer : styles.bottomSheetInputContainer}>
                            <BottomSheetTextInput
                                editable={locationOption === 'chosen'}
                                value={chosenLocation}
                                onChangeText={setChosenLocation}
                                placeholder={t('enterLocation')}
                                selectionColor="#8ac5db"
                                style={{ flex: 1 }}
                            />
                            <TouchableOpacity onPress={() => setChosenLocation('')} disabled={locationOption === 'current'}>
                                <Icon source="close-circle" color={'#ccc'} size={20}></Icon>
                            </TouchableOpacity>

                        </View>
                        <Button mode='contained' loading={isLoadingLocation} disabled={isLoadingLocation} onPress={handleSaveLocation} style={styles.bottomSheetButton}>
                            {isLoadingLocation ? t('findingAddress') : t('save')}
                        </Button>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>

            <Animated.View style={[styles.headerSmall, headerSmallStyle]}>
                <Text style={styles.headerSmallText}>{t('createPost')}</Text>
            </Animated.View>
            <IconButton
                style={styles.backButton}
                icon="close"
                size={25}
                onPress={handleClose}
            />
            <Button
                mode='text'
                style={styles.postButton}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                disabled={!textPost || !textPost.trim() || isLoading || images.length === 0}
                onPress={handlePost}
            >
                {t('post')}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 130,
    },
    headerText: {
        fontSize: 30,
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 10,
        marginTop: 45,
        backgroundColor: 'transparent',
    },
    postButton: {
        position: 'absolute',
        top: 0,
        right: 10,
        marginTop: 45,
        backgroundColor: 'transparent',
    },
    headerSmall: {
        flexDirection: 'row',
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 10,
        alignItems: 'center',
        backgroundColor: '#f0f9fc',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerSmallText: {
        fontSize: 20,
        marginLeft: 50,
    },
    avatarContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 20,
        gap: 10,
    },
    userInfo: {
        flexDirection: 'column',
        gap: 5,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    bottomSheetItem: {
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    activeBottomSheetInputContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f0f9fc',
        borderColor: '#8ac5db',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    bottomSheetInputContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f0f9fc',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        opacity: 0.8,
    },
    bottomSheetButton: {
        marginTop: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f0f9fc',
        borderRadius: 50,
        gap: 5,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    unverifiedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unverifiedText: {
        fontSize: 18,
        color: 'red',
    },
    imagesContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    selectedImageContainer: {
        position: 'relative',
        margin: 5,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
    },
});

export default CreateNewScreen;
