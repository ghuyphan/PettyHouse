import React, { FC, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Avatar, Button, Menu, IconButton, Snackbar } from 'react-native-paper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TextDialogCheckBox from '../modal/textDialogCheckBox';

interface BottomSheetItemProps {
    item: {
        created: string;
        avatar?: string;
        username: string;
        address: string;
        title: string;
        image: string;
        hasLiked: boolean;
        like: number;
    };
    toggleLike: () => void;
    toggleReport: (reason: string) => void;
    isLastItem: boolean;
}

const BottomSheetItem: FC<BottomSheetItemProps> = ({ item, toggleLike, isLastItem, toggleReport }) => {
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
            return t('lessThanOneHourAgo');
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

    const handleReport = (reason: string) => {
        toggleReport(reason);
        setIsVisible(false);
    }

    return (
        <View style={styles.card}>
            <View style={styles.topContainer}>
                <View style={styles.userSection}>
                    {item.avatar ? (
                        <Avatar.Image source={{ uri: item.avatar }} size={35} style={styles.avatar} />
                    ) : (
                        <Avatar.Text label={item.username.slice(0, 2).toUpperCase()} size={35} style={styles.avatar} color="#fff" />
                    )}
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>@{item.username}</Text>
                        <Text style={styles.address}>{item.address}</Text>
                    </View>

                </View>
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    contentStyle={{ backgroundColor: '#ffff' }}
                    anchor={<IconButton icon="dots-vertical" onPress={openMenu} size={20} iconColor='#8ac5db' style={styles.moreButton} />}
                >
                    <Menu.Item onPress={() => { }} title={t('edit')} />
                    <Menu.Item onPress={() => { }} title={t('delete')} />
                    <Menu.Item titleStyle={{ color: 'red' }} onPress={() => (
                        <>
                            {setIsVisible(true)}
                            {closeMenu()}
                        </>
                    )} title={t('report')} />
                </Menu>
            </View>
            <Text style={styles.title}>
                {item.title}
            </Text>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.actionSection}>
                <View style={styles.likeDislikeButtons}>
                    <IconButton
                        style={styles.moreButton}
                        size={22}
                        iconColor={item.hasLiked ? '#FF5733' : '#8ac5db'}
                        onPress={toggleLike}
                        icon={item.hasLiked ? 'heart' : 'heart-outline'}
                    >
                    </IconButton>
                    <IconButton
                        style={styles.moreButton}
                        size={22}
                        iconColor={'#8ac5db'}
                        onPress={toggleLike}
                        icon={'comment-outline'}
                    >
                    </IconButton>
                </View>
                <Text style={styles.timeAgo}>{timeAgoText}</Text>
            </View>
            {item.like > 0 && <Text style={styles.like}>{item.like} lượt thich</Text>}
            {!isLastItem && <View style={styles.divider} />}
            <TextDialogCheckBox
                dismissable={true}
                isVisible={isVisible}
                onDismiss={() => setIsVisible(false)}
                onConfirm={(reason) => handleReport(reason)}
                title={'What is wrong with this post?'}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: 20,
        flexDirection: 'column'
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    avatar: {},
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
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
        marginBottom: 10
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 15,
        // aspectRatio: 1
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        // marginBottom: 10,
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
        marginBottom: 20,
    },
});

export default BottomSheetItem;
