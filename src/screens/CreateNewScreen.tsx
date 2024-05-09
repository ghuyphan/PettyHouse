import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import { Button, useTheme, Avatar, Text, Icon, IconButton, Banner, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { clearUserData } from '../reducers/userSlice';
import pb from '../services/pocketBase';
import TextDialog2Btn from '../components/modal/textDialog2Btn';
import i18n from '../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';

interface SettingsProps { }

const CreateNewScreen: React.FC<SettingsProps> = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [bannerVisible, setBannerVisible] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [imageUri, setImageUri] = useState<null>(null);
    const textInputRef = useRef<TextInput>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const userData = useSelector((state: RootState) => state.user.userData);

    const scrollY = useSharedValue(0);
    const headerSmallStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [45, 50], [0, 1]);
        return { opacity: opacity };
    });
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });
    const handleClose = (() => {
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
            setTimeout(() => {
                navigation.goBack();
            }, 500); // Wait for the keyboard dismiss animation to complete
        } else {
            navigation.goBack();
        }

    })

    const handleOpenGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access gallery is required!');
            return;
        }
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,  // Enables basic cropping
            aspect: [4, 4],        // Aspect ratio to maintain during cropping
        });
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
            console.log(pickerResult);
        }
    };

    const handleOpenCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access camera is required!');
            return;
        }
        const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,  // Enables basic cropping
            aspect: [4, 4],        // Aspect ratio to maintain during cropping
        });
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
        }
    };
    useEffect(() => {
        if (userData?.verified) {
            setBannerVisible(false);
        }
    }, []);

    const snapPoints = useMemo(() => ['20%', '20%'], []);
    const renderContent = () => (
        <View style={styles.bottomSheetItem}>
            <Button labelStyle={{ fontSize: 16, fontWeight: 'bold' }} icon={"camera"} mode="contained" onPress={handleOpenCamera}>
                Take a Photo
            </Button>
            <Button labelStyle={{ fontSize: 16, fontWeight: 'bold' }} icon={"image"} mode="contained" onPress={handleOpenGallery}>
                Pick an Image from Gallery
            </Button>
        </View>
    );


    return (
        <View style={styles.container}>
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
                        <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
                            {imageUri ? (
                                <Avatar.Image source={{ uri: imageUri }} size={50} />
                            ) : (
                                <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={50} color="#fff" />
                            )}
                        </TouchableOpacity>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userData?.username}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Avatar' as never)}>
                                <View style={styles.locationContainer}>
                                    <Icon source={'navigation-variant'} color={'#8ac5db'} size={15}></Icon>
                                    <Text style={{ color: '#8ac5db', fontWeight: 'bold' }}>Vị trí hiện tại</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableWithoutFeedback onPress={() => textInputRef.current?.focus()}>
                        <View style={{ height: 500 }}>
                            <TextInput
                                mode="flat"
                                placeholder="What's on your mind?"
                                multiline
                                disabled={!userData?.verified}
                                ref={textInputRef}
                                // outlineColor='transparent'
                                verticalAlign='top'
                                selectionColor='#8ac5db'
                                underlineStyle={{ backgroundColor: 'transparent' }}
                                underlineColor='transparent'
                                activeUnderlineColor='transparent'
                                style={{ backgroundColor: 'transparent' }} // Ensure the text input aligns text at the top
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Animated.ScrollView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                handleIndicatorStyle={{ backgroundColor: '#ccc' }}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
                )}
            >
                {renderContent()}
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
                style={styles.postButton}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                disabled={true}
            >
                Đăng
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingHorizontal: 20,
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
        marginTop: 57,
        backgroundColor: 'transparent',
    },
    postButton:{
        position: 'absolute',
        top: 0,
        right: 10,
        marginTop: 57,
        backgroundColor: 'transparent',
    },
    headerSmall: {
        flexDirection: 'row',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 10,
        alignItems: 'center',
        backgroundColor: '#f0f9fc',
        position: 'absolute',
        height: 100,
        top: 0,
        left: 0,
        right: 0,
    },
    headerSmallText: {
        fontSize: 20,
        marginLeft: 50,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,

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
        gap: 10
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f0f9fc',
        borderRadius: 50,
        gap: 5
    },
    // Define additional styles if necessary
});

export default CreateNewScreen;
