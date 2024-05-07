import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, withSpring } from 'react-native-reanimated';
import { Button, useTheme, Avatar, Text, Icon } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import pb from '../services/pocketBase';
import i18n from '../utils/i18n';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import TypeMarker from '../types/markers';
import { constructImageURL } from '../utils/constructURLUtils';
import ProfileSkeletonLoading from '../components/skeletonLoading/profileSkeletonLoading';

//Import components
import ProfileFlatlist from '../components/profileFlatlist/profileFlatlist';

interface SettingsProps { }

const ProfileScreen: React.FC<SettingsProps> = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [isReloading, setIsReloading] = useState(false);
    const [imageUri, setImageUri] = useState<null>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const userData = useSelector((state: RootState) => state.user.userData);
    const [posts, setPosts] = useState<TypeMarker[]>([]);


    const fetchUserPosts = async () => {
        if (!userData) return;
        setIsReloading(true);
        const records = await pb.collection('posts').getFullList({
            filter: `user = "${userData?.id}"`,
            expand: 'user,likes_via_post_id',
        });
        const newPosts = records.map(record => ({
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
        setPosts(newPosts);
        setIsLoading(false);
        setIsReloading(false);
    }

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const scrollY = useSharedValue(0);
    const headerSmallStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [70, 80], [0, 1]);
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
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ProfileSkeletonLoading isLoading={isLoading} />

                </View>
            ) : (
                <Animated.FlatList
                    data={posts}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    onRefresh={fetchUserPosts}
                    refreshing={isReloading}
                    style={styles.scrollView}
                    ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ProfileSkeletonLoading isLoading={isLoading} />

                    </View>}
                    ListHeaderComponent={() => (
                        <View style={styles.headerContainer}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.userInfo}>
                                    <Text style={styles.nameHeader}>{userData?.name}</Text>
                                    <Text style={styles.userNameHeader}>@{userData?.username}</Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('Avatar')}>
                                    {imageUri ? (
                                        <Avatar.Image source={{ uri: imageUri }} size={65} />
                                    ) : (
                                        <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={65} color="#fff" />
                                    )}
                                    <View style={styles.cameraIcon}>
                                        {userData?.verified ? (
                                            <Icon source="check-circle" color={'#77DD77'} size={20} />
                                        ) : (
                                            null
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.infoContainer}>
                                <Button style={{ flex: 1 }} mode='contained'>Edit Profile</Button>
                                <Button style={{ flex: 1 }} mode='contained'>Share Profile</Button>
                            </View>
                            <View style={styles.divider} />
                        </View>
                    )}

                    renderItem={({ item }) => (
                        <View style={{ flex: 1 }} >

                            <ProfileFlatlist
                                item={item}
                                isLastItem={posts.indexOf(item) === posts.length - 1}
                            />
                        </View>
                    )}

                >
                </Animated.FlatList >
            )}

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
                <Text style={styles.headerSmallText}>{userData?.name}</Text>
                {imageUri ? (
                    <Avatar.Image source={{ uri: imageUri }} size={35} />
                ) : (
                    <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={35} color="#fff" />
                )}
            </Animated.View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    headerSmall: {
        // marginTop: 60,
        flexDirection: 'row',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f9fc',
        position: 'absolute',
        height: 100,
        top: 0,
        left: 0,
        right: 0,
    },
    headerSmallText: {
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
        marginTop: 60,
        backgroundColor: '#fff', // Match the background color
    },
    contentContainer: {
        flex: 1,
        padding: 100,
    },
    headerContainer: {
        marginTop: 70,
        flexDirection: 'column',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderRadius: 20,
        // gap: 10,
    },
    cameraIcon: {
        position: 'absolute',
        backgroundColor: '#f0f9fc',
        padding: 5,
        borderRadius: 50,
        bottom: 0,
        right: -5,

    },
    userInfo: {
        flexDirection: 'column',
        gap: 5,
    },
    userNameHeader: {
        fontSize: 16,
    },
    nameHeader: {
        fontSize: 30,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    infoContainer: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        gap: 5,
    },
    divider: {
        backgroundColor: '#f0f9fc',
        height: 5,
        width: '100%',
        marginVertical: 30,
        borderRadius: 5
    },
    bottomSheetItem: {
        justifyContent: 'center',
        padding: 20,
        gap: 10
    },
    activityIndicator: {
        flex: 1,
    },
});

export default ProfileScreen;
