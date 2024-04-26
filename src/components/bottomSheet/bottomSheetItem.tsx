import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Avatar, Button } from 'react-native-paper';
import moment from 'moment'; 
import { useTranslation } from 'react-i18next';

interface BottomSheetItemProps {
    item: any;
    toggleLike: () => void;
    isLastItem: boolean;
}
const BottomSheetItem: React.FC<BottomSheetItemProps> = ({ item, toggleLike, isLastItem }) => {
    const { t } = useTranslation();
    const createdDate = moment(item.created); // Assuming item.created has time zone info
    const currentDate = moment();


    const timeDiffHours = currentDate.diff(createdDate, 'hours'); 
    let timeAgoText;
    if (timeDiffHours < 1) {
        timeAgoText = t('lessThanOneHourAgo');
    } else if (timeDiffHours < 24) {
        timeAgoText = `${timeDiffHours} ` + t('hoursAgo'); 
    } else {
        const daysDiff = currentDate.diff(createdDate, 'days'); 
        if (daysDiff < 7) { 
            timeAgoText = `${daysDiff} ` + t('daysAgo'); 
        } else if (daysDiff < 31) { // Check for weeks
            const weeksDiff = Math.floor(daysDiff / 7);
            timeAgoText = `${weeksDiff} ${weeksDiff > 1 ?  t('weeksAgo') : t('weekAgo')}`;
        } else { // Check for months
            const monthsDiff = currentDate.diff(createdDate, 'months');
            timeAgoText = `${monthsDiff} ${monthsDiff > 1 ? 'months' : 'month'} ago`;
        }
    }

    return (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                {item.avatar ?
                    <Avatar.Image source={{ uri: item.avatar }} size={35} style={styles.avatar} /> :
                    <Avatar.Text label={item.username.slice(0, 2).toUpperCase()} size={35} style={styles.avatar} color='#fff' />
                }
                <View style={{ flexDirection: 'column', gap: 5 }}>
                    <Text style={styles.userName}>@{item.username}</Text>
                    <Text style={{ color: '#888', fontSize: 12, width: '100%' }} numberOfLines={1}>{item.address}</Text>
                </View>
            </View>
            <Text style={{ fontSize: 14, color: '#555', width: '100%', marginBottom: 10 }}>
                {item.title}
            </Text>
            <Image source={{ uri: item.image }} style={{ width: '100%', height: 300, borderRadius: 15 }} contentFit='cover' />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 }}>
            <Text style={{ color: '#8ac5db', fontSize: 15 }}>{timeAgoText}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Button
                        mode='text'
                        onPress={() => toggleLike()}
                        icon={item.hasLiked ? 'thumb-up' : 'thumb-up-outline'}
                        labelStyle={{ fontSize: 20, color: '#8ac5db' }}
                    >
                        <Text style={{ color: '#8ac5db', fontSize: 15, width: '100%' }}>{item.like}</Text>
                    </Button>
                    <Button
                        mode='text'
                        onPress={() => toggleLike()}
                        icon={'thumb-down-outline'}
                        labelStyle={{ fontSize: 20, color: '#8ac5db' }}
                    >
                        <Text style={{ color: '#8ac5db', fontSize: 15 }}>{item.dislike}</Text>
                    </Button>
                </View>
            </View>
            {!isLastItem && (
                <View style={{ backgroundColor: '#f0f9fc', height: 5, width: '100%', marginBottom: 20, borderRadius: 5 }} />
            )}
        </View>
    );

}
const styles = StyleSheet.create({
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

export default BottomSheetItem;