import React, { FC, useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Avatar, Button, Menu, IconButton } from 'react-native-paper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TextDialogCheckBox from '../modal/textDialogCheckBox';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { getTimeAgo } from '../../utils/timeUtils';

interface BottomSheetItemProps {
    item: {
        created: string;
        avatar?: string;
        username: string;
        userId: string;
        address: string;
        title: string;
        image1: string;
        image2?: string;
        image3?: string;
        hasLiked: boolean;
        like: number;
    };
    toggleLike: () => void;
    showDetail: () => void;
    toggleReport: (reason: string) => void;
    isLastItem: boolean;
}

const BottomSheetItem: FC<BottomSheetItemProps> = React.memo(({ item, toggleLike, isLastItem, toggleReport, showDetail }) => {
    const { t } = useTranslation();
    const createdDate = useMemo(() => moment(item.created), [item.created]);
    const currentDate = useMemo(() => moment(), []);
    const navigation = useNavigation();

    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = useCallback(() => setMenuVisible(true), []);
    const closeMenu = useCallback(() => setMenuVisible(false), []);
    const [isVisible, setIsVisible] = useState(false);
    const [isReported, setIsReported] = useState(false);

    const timeAgoText = useMemo(() => getTimeAgo(createdDate, t), [createdDate, t]);

    const scale = useSharedValue(1);

    const handleToggleLike = useCallback(() => {
        scale.value = 1.15;
        toggleLike();
        setTimeout(() => {
            scale.value = 1;
        }, 100);
    }, [toggleLike, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value, { damping: 3, stiffness: 150 }) }],
        };
    }, []);

    const handleReport = useCallback((reason: string) => {
        toggleReport(reason);
        setIsReported(true);
        setIsVisible(false);
    }, [toggleReport]);

    const handleImagePress = useCallback((index: number) => {
        const images = [item.image1, item.image2, item.image3].filter(img => img !== undefined) as string[];
        navigation.navigate('ImageViewer', { images, initialIndex: index });
    }, [item.image1, item.image2, item.image3, navigation]);

    const renderImages = useCallback(() => {
        const images = [item.image1, item.image2, item.image3].filter(img => img);
        if (images.length > 1) {
            return (
                <ScrollView nestedScrollEnabled horizontal showsHorizontalScrollIndicator={false} style={{ height: 300 }} contentContainerStyle={{ gap: 10, paddingLeft: 60 }} overScrollMode={'never'}>
                    {images.map((img, index) => (
                        <TouchableOpacity key={index} onPress={() => handleImagePress(index)}>
                            <Image source={{ uri: img }} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            );
        } else {
            return (
                <View style={{ marginLeft: 35 }}>
                    <TouchableOpacity onPress={() => handleImagePress(0)}>
                        <Image source={{ uri: item.image1 }} style={styles.image} />
                    </TouchableOpacity>
                </View>
            );
        }
    }, [item.image1, item.image2, item.image3, handleImagePress]);

    return (
        <View style={styles.card}>
            {isReported ? (
                <View style={styles.reportContainer}>
                    <Text style={styles.reportMessage}>{t('reportedPost')}</Text>
                </View>
            ) : (
                <>
                    <View style={styles.topContainer}>
                        <View style={styles.userSection}>
                            {item.avatar ? (
                                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId } )}>
                                    <Avatar.Image source={{ uri: item.avatar }} size={30} style={styles.avatar} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
                                    <Avatar.Text label={item.username.slice(0, 2).toUpperCase()} size={30} style={styles.avatar} color="#fff" />
                                </TouchableOpacity>
                            )}
                            <View style={styles.userInfo}>
                                <View style={{ flexDirection: 'row', gap: 5 }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
                                        <Text style={styles.userName}>{item.username}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.date}>{timeAgoText}</Text>
                                </View>
                                <Text numberOfLines={1} style={styles.address}>{item.address}</Text>
                            </View>
                        </View>
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            elevation={1}
                            contentStyle={{ backgroundColor: '#ffff' }}
                            anchor={<IconButton icon="dots-vertical" onPress={openMenu} size={22} iconColor='#8ac5db' style={styles.moreButton} />}
                        >
                            <Menu.Item theme={{ colors: { onSurfaceVariant: '#8ac5db' } }} leadingIcon={'share-outline'} titleStyle={{ color: '#8ac5db' }} onPress={() => { }} title={t('share')} />
                            <Menu.Item theme={{ colors: { onSurfaceVariant: '#ff6f61' } }} leadingIcon={'comment-alert-outline'} titleStyle={{ color: '#ff6f61' }} onPress={() => (
                                <>
                                    {setIsVisible(true)}
                                    {closeMenu()}
                                </>
                            )} title={t('report')} />
                        </Menu>
                    </View>
                    <TouchableWithoutFeedback onPress={() => showDetail()}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            {renderImages()}
                            <View style={styles.actionSection}>
                                <View style={styles.likeDislikeButtons}>
                                    <Animated.View style={animatedStyle}>
                                        <Button
                                            style={styles.likeButton}
                                            labelStyle={{ color: item.hasLiked ? '#ff6f61' : '#8ac5db', fontSize: 20 }}
                                            onPress={handleToggleLike}
                                            icon={item.hasLiked ? 'heart' : 'heart-outline'}
                                        >
                                            <Text style={{ color: item.hasLiked ? '#ff6f61' : '#8ac5db', fontSize: 14 }}>{item.like}</Text>
                                        </Button>
                                    </Animated.View>
                                    <IconButton
                                        style={styles.moreButton}
                                        size={22}
                                        iconColor={'#8ac5db'}
                                        onPress={() => showDetail()}
                                        icon={'comment-outline'}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                    {!isLastItem && <View style={styles.divider} />}
                </>
            )}
            <TextDialogCheckBox
                confirmLabel={t('report')}
                dismissLabel={t('cancelButton')}
                dismissable={true}
                isVisible={isVisible}
                onDismiss={() => setIsVisible(false)}
                onConfirm={(reason) => handleReport(reason)}
                title={t('reportTitle')}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        // marginHorizontal: 20,
        flexDirection: 'column'
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: 20,
    },
    avatar: {},
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userInfo: {
        flexDirection: 'column',
        gap: 5
    },
    address: {
        fontSize: 12,
        color: '#999',
    },
    contentContainer: {
        flexDirection: 'column',

    },
    title: {
        fontSize: 14,
        width: '100%',
        marginBottom: 10,
        marginLeft: 35,
        paddingHorizontal: 25
    },
    image: {
        flex: 1,
        borderRadius: 15,
        aspectRatio: 1,
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginLeft: 50,
    },
    likeDislikeButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        color: '#8ac5db',
        backgroundColor: 'transparent'
    },
    likeCount: {
        fontSize: 14,
        color: '#8ac5db',
    },
    divider: {
        backgroundColor: '#f0f9fc',
        height: 5,
        width: '100%',
        marginBottom: 20,
        borderRadius: 5
    },
    moreButton: {
        color: '#8ac5db',
        backgroundColor: 'transparent',
        marginRight: -20
    },
    reportContainer: {
        backgroundColor: '#f0f9fc',
        borderRadius: 15,
        marginBottom: 20,
    },
    reportMessage: {
        fontSize: 16,
        color: '#8ac5db',
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default BottomSheetItem;
