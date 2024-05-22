import React, { FC, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Avatar, Button, Menu, IconButton, Snackbar } from 'react-native-paper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TextDialogCheckBox from '../modal/textDialogCheckBox';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface DetailBottomSheetItemProps {
    item: {
        id: string;
        comment: string;
        username: string;
        avatar: string;
        created: string;
    };
    toggleLike: () => void;
    // toggleReport: (reason: string) => void;
    isLastItem: boolean;
}

const DetailBottomSheetItem: FC<DetailBottomSheetItemProps> = ({ item, toggleLike, isLastItem }) => {
    const { t } = useTranslation();
    const createdDate = useMemo(() => moment(item.created), [item.created]);
    const currentDate = useMemo(() => moment(), []);

    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);
    const [isVisible, setIsVisible] = useState(false);

    const timeAgoText = useMemo(() => {
        const timeDiffHours = currentDate.diff(createdDate, 'hours');
        if (timeDiffHours < 1) {
            return t('lesThanAnHourAgo');
        } else if (timeDiffHours < 24) {
            return `${timeDiffHours} ${t('hoursAgo')}`;
        } else {
            const daysDiff = currentDate.diff(createdDate, 'days');
            if (daysDiff < 7) {
                return `${daysDiff} ${t('daysAgo')}`;
            } else if (daysDiff < 31) {
                const weeksDiff = Math.floor(daysDiff / 7);
                return `${weeksDiff} ${weeksDiff > 1 ? t('weeksAgo') : t('weekAgo')}`;
            } else {
                const monthsDiff = currentDate.diff(createdDate, 'months');
                return `${monthsDiff} ${monthsDiff > 1 ? 'months' : 'month'} ago`;
            }
        }
    }, [createdDate, currentDate, t]);

    const scale = useSharedValue(1);

    const handleToggleLike = () => {
        scale.value = 1.1;  // Slightly scale up when liked
        toggleLike();

        // Reset the scale after the animation is complete
        setTimeout(() => {
            scale.value = 1;  // Reset scale to normal
        }, 100);  // The delay should match the duration of the animation
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value, { damping: 3, stiffness: 150 }) }],
        };
    }, []);
    const handleReport = (reason: string) => {
        setIsVisible(false);
    }

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
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <Text style={styles.userName}>{item.username}</Text>
                            <Text style={styles.date}>{timeAgoText}</Text>
                        </View>
                        <Text style={styles.address}>{item.comment}</Text>
                    </View>

                </View>
            </View>
            {/* <Text style={styles.title}>
                {item.comment}
            </Text> */}
            {/* {item.like > 0 && <Text style={styles.like}>{item.like} {t('likes')}</Text>} */}
            {/* <View style={styles.actionSection}>
                <View style={styles.likeDislikeButtons}>
                <Animated.View style={animatedStyle}>
                        <IconButton
                            style={styles.moreButton}
                            size={22}
                            iconColor={item.hasLiked ? '#FF5733' : '#8ac5db'}
                            onPress={handleToggleLike}
                            icon={item.hasLiked ? 'heart' : 'heart-outline'}
                        />
                    </Animated.View>
                    <IconButton
                        style={styles.moreButton}
                        size={22}
                        iconColor={'#8ac5db'}
                        onPress={() => showDetail()}
                        icon={'comment-outline'}
                    >
                    </IconButton>
                </View>
                <Text style={styles.timeAgo}>{timeAgoText}</Text>
            </View> */}
            {/* {!isLastItem && <View style={styles.divider} />} */}

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
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        marginHorizontal: 20,
        flexDirection: 'column',
        marginBottom: 20
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    avatar: {},
    userName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    date: {
        fontSize: 12,
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
        width: '100%'
    },
    title: {
        fontSize: 14,
        color: '#555',
        width: '100%',
        marginBottom: 10
    },
    image: {
        width: '100%',
        height: 280,
        borderRadius: 15,
        // aspectRatio: 1
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginTop: 10,
        marginBottom: 10,
    },
    timeAgo: {
        color: '#8ac5db',
        fontSize: 14
    },
    likeDislikeButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
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
        backgroundColor: 'transparent'
    },
    like: {
        color: '#8ac5db',
        fontSize: 14,
        alignItems: 'center',
        // marginBottom: 20,
        marginTop: 15,
        marginLeft: 10
    },
});

export default DetailBottomSheetItem;
