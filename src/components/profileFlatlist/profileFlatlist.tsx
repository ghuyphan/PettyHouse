import React, { FC, useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Avatar, Button, Menu, IconButton, Snackbar, Icon } from 'react-native-paper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TextDialogCheckBox from '../modal/textDialogCheckBox';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import pb from '../../services/pocketBase';
import TextDialog2Btn from '../modal/textDialog2Btn';
import { useNavigation } from '@react-navigation/native';
import { getTimeAgo } from '../../utils/timeUtils';

interface ProfileFlatlistProps {
    item: {
        id: string;
        created: string;
        avatar?: string;
        username: string;
        address: string;
        title: string;
        image1?: string;
        image2?: string;
        image3?: string;
        hasLiked: boolean;
        like: number;
        visible: boolean;
    };
    toggleLike: () => void;
    showDetail: () => void;
    isLastItem: boolean;
    fetchUserPosts: () => void;
}

const ProfileFlatlist: FC<ProfileFlatlistProps> = ({ item, toggleLike, isLastItem, showDetail, fetchUserPosts }) => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const createdDate = useMemo(() => moment(item.created), [item.created]);
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const openMenu = useCallback(() => setMenuVisible(true), []);
    const closeMenu = useCallback(() => setMenuVisible(false), []);

    const handleImagePress = useCallback((index: number) => {
        const images = [item.image1, item.image2, item.image3].filter(img => img);
        navigation.navigate('ImageViewer', { images, initialIndex: index });
    }, [item.image1, item.image2, item.image3, navigation]);

    const timeAgoText = useMemo(() => getTimeAgo(createdDate, t), [createdDate, t]);

    const scale = useSharedValue(1);

    const handleToggleLike = useCallback(() => {
        scale.value = 1.15;  // Slightly scale up when liked
        toggleLike();

        // Reset the scale after the animation is complete
        setTimeout(() => {
            scale.value = 1;  // Reset scale to normal
        }, 100);  // The delay should match the duration of the animation
    }, [toggleLike, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value, { damping: 3, stiffness: 150 }) }],
        };
    }, []);

    const hidePost = async () => {
        try {
            await pb.collection('posts').update(item.id, { visible: false });
            setIsVisible(false);
            fetchUserPosts();
        } catch (error) {
            console.log(error);
        }
    };

    const showPost = async () => {
        try {
            await pb.collection('posts').update(item.id, { visible: true });
            setIsVisible(false);
            fetchUserPosts();
        } catch (error) {
            console.log(error);
        }
    };

    const deletePost = async () => {
        try {
            await pb.collection('posts').delete(item.id);
            setIsVisible(false);
            fetchUserPosts();
        } catch (error) {
            console.log(error);
        }
    };

    const renderImages = useCallback(() => {
        const images = [item.image1, item.image2, item.image3].filter(img => img);
        if (images.length > 1) {
            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 300 }} contentContainerStyle={{ gap: 10, paddingLeft: 55 }}>
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

    const handleMenuItemPress = useCallback((action: 'show' | 'hide' | 'delete') => {
        let title = '';
        let message = '';

        switch (action) {
            case 'show':
                title = t('Show Post');
                message = t('Are you sure you want to show this post?');
                break;
            case 'hide':
                title = t('Hide Post');
                message = t('Are you sure you want to hide this post?');
                break;
            case 'delete':
                title = t('Delete Post');
                message = t('Are you sure you want to delete this post?');
                break;
        }

        setDialogTitle(title);
        setDialogMessage(message);
        setIsVisible(true);
    }, [t]);

    return (
        <View style={styles.card}>
            <View style={styles.topContainer}>
                <View style={styles.userSection}>
                    {item.avatar ? (
                        <Avatar.Image source={{ uri: item.avatar }} size={30} style={styles.avatar} />
                    ) : (
                        <Avatar.Text label={item.username.slice(0, 2).toUpperCase()} size={30} style={styles.avatar} color="#fff" />
                    )}
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={styles.userName}>{item.username}</Text>
                            {item.visible ? <Icon source="eye-outline" size={15} color="#999" /> : <Icon source="eye-off-outline" size={15} color="#999" />}
                            <Text style={styles.date}>{timeAgoText}</Text>
                        </View>
                        <Text style={styles.address}>{item.address}</Text>
                    </View>
                </View>
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    contentStyle={{ backgroundColor: '#ffff' }}
                    elevation={1}
                    anchor={<IconButton icon="dots-vertical" onPress={openMenu} size={22} iconColor='#8ac5db' style={styles.moreButton} />}
                >
                    {!item.visible ?
                        <Menu.Item theme={{ colors: { onSurfaceVariant: '#8ac5db' } }} leadingIcon={'eye-outline'} titleStyle={{ color: '#8ac5db' }} onPress={() => handleMenuItemPress('show')} title={t('show')} />
                        :
                        <Menu.Item theme={{ colors: { onSurfaceVariant: '#8ac5db' } }} leadingIcon={'eye-off-outline'} titleStyle={{ color: '#8ac5db' }} onPress={() => handleMenuItemPress('hide')} title={t('hide')} />}
                    <Menu.Item theme={{ colors: { onSurfaceVariant: '#8ac5db' } }} leadingIcon={'pencil-outline'} titleStyle={{ color: '#8ac5db' }} onPress={() => { }} title={t('edit')} />
                    <Menu.Item theme={{ colors: { onSurfaceVariant: '#8ac5db' } }} leadingIcon={'share-outline'} titleStyle={{ color: '#8ac5db' }} onPress={() => { }} title={t('share')} />
                    <Menu.Item theme={{ colors: { onSurfaceVariant: '#ff6f61' } }} leadingIcon={'delete-outline'} titleStyle={{ color: '#ff6f61' }} onPress={() => handleMenuItemPress('delete')} title={t('delete')} />
                </Menu>
            </View>
            <Text style={styles.title}>
                {item.title}
            </Text>
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
            {!isLastItem && <View style={styles.divider} />}
            <TextDialog2Btn
                title={dialogTitle}
                content={dialogMessage}
                confirmLabel={item.visible ? t('hide') : t('show')}
                onConfirm={() => {
                    if (dialogTitle.includes('Hide')) hidePost();
                    else if (dialogTitle.includes('Show')) showPost();
                    else if (dialogTitle.includes('Delete')) deletePost();
                }}
                
                dismissLabel={t('cancelButton')}
                onDismiss={() => setIsVisible(false)}
                isVisible={isVisible}
                dismissable={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        flexDirection: 'column'
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 20
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
        color: '#888',
        fontSize: 12,
        width: '100%'
    },
    title: {
        fontSize: 14,
        color: '#555',
        width: '100%',
        marginBottom: 10,
        marginLeft: 35,
        paddingHorizontal: 20,
    },
    image: {
        flex: 1,
        borderRadius: 15,
        aspectRatio: 1
    },

    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginLeft: 45,
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
    timeAgo: {
        color: '#8ac5db',
        fontSize: 14
    },
    iconLabel: {
        fontSize: 20,
        color: '#8ac5db'
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
    like: {
        color: '#8ac5db',
        fontSize: 14,
        alignItems: 'center',
        // marginBottom: 20,
        marginTop: 15,
        marginLeft: 10
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 1,
    },
    modalContentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProfileFlatlist;
