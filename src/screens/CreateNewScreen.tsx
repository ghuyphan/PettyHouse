import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import { List, Button, useTheme, Avatar, Text, Icon, IconButton } from 'react-native-paper';
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
    const [isVisible, setIsVisible] = useState(false);
    const [imageUri, setImageUri] = useState<null>(null);
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

    const handleOpenGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access gallery is required!');
            return;
        }
        const pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
            console.log(pickerResult.assets);
        }
    };

    const handleOpenCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access camera is required!');
            return;
        }
        const pickerResult = await ImagePicker.launchCameraAsync();
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
        }
    };

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
                style={styles.scrollView}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{t('createPost')}</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
                            {imageUri ? (
                                <Avatar.Image source={{ uri: imageUri }} size={70} />
                            ) : (
                                <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={70} color="#fff" />
                            )}
                            <View style={styles.cameraIcon}>
                                <Icon source="camera-outline" color={colors.primary} size={20}></Icon>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>@{userData?.username}</Text>
                        </View>
                    </View>
                    <TextDialog2Btn
                        isVisible={isVisible}
                        onDismiss={() => setIsVisible(false)}
                        onConfirm={() => { setIsVisible(false); logout() }}
                        title={t('logout') + '?'}
                        content='Are you sure you want to log out?'
                    />
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
            <IconButton style={styles.backButton} icon="arrow-left" size={25} onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 130,
        paddingBottom: 10,
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
    headerSmall: {
        // marginTop: 60,
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
    scrollView: {
        flex: 1,
        backgroundColor: '#fff', // Match the background color
    },
    contentContainer: {
        flex: 1,
    },
    avatarContainer: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderRadius: 20,
        gap: 10,
    },
    cameraIcon: {
        position: 'absolute',
        backgroundColor: '#f0f9fc',
        padding: 5,
        borderRadius: 50,
        bottom: 0,
        right: -10,

    },
    userInfo: {
        flexDirection: 'column',
        gap: 5,
    },
    userName: {
        fontSize: 18,
        color: '#333',
    },
    // name: {
    //     fontSize: 20,
    //     color: '#333',
    //     fontWeight: '600',
    // },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        backgroundColor: '#77DD77',
        padding: 5,
        borderRadius: 50,
    },
    verifiedText: {
        color: '#fff',
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#8ac5db', // This should be the color you want for your logout button
    },
    listSection: {
        marginTop: 20,
    },
    listItemContainer: {
        paddingLeft: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    bottomSheetItem: {
        justifyContent: 'center',
        padding: 20,
        gap: 10
    },
    // Define additional styles if necessary
});

export default CreateNewScreen;
