import React, { memo, useCallback } from 'react';
import { Callout, Marker } from "react-native-maps";
import { StyleSheet, View, Image } from 'react-native';
import { Text, Icon, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface MapMarker {
    id: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    address: string;
    title: string;
    image: string;
    like: number;
    dislike: number;
    username: string;
    avatar: string;
    created: string;
}

interface CustomMarkerProps {
    marker: MapMarker;
    index: number;
    bottomSheetRef: React.RefObject<any>;
    flatListRef: React.RefObject<any>;  // Type should be adjusted to match the actual ref type you are using
}

const CustomMarker: React.FC<CustomMarkerProps> = memo(({ marker, index, bottomSheetRef, flatListRef }) => {
    const { t } = useTranslation();

    const handleCalloutPress = useCallback(() => {
        bottomSheetRef.current?.expand();
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
        }, 500);
    }, [index, bottomSheetRef, flatListRef]);

    return (
        <Marker
            coordinate={marker.coordinate}
            title={marker.title}
        >
            <View style={styles.container}>
                <Image
                    source={require('../../../assets/images/marker.png')}
                    style={styles.markerIcon}
                />
                <Image
                    source={{ uri: marker.image }}
                    style={styles.markerImage}
                />
            </View>
            <Callout tooltip style={styles.callout} onPress={handleCalloutPress}>
                <View style={styles.bubble}>
                    <View style={styles.row}>
                        <View style={styles.userRow}>
                        {marker.avatar ?
                            <Avatar.Image source={{ uri: marker.avatar }} size={20} style={styles.avatar} /> :
                            <Avatar.Text label={marker.username.slice(0, 2).toUpperCase()} size={20} style={styles.avatar} color='#fff' />
                        }
                        <Text style={styles.userName}>@{marker.username}</Text>
                        </View>
                        <View style={styles.likesRow}>
                            <Text style={styles.likes}>{marker.like}</Text>
                            <Icon source="thumb-up" size={13} color={'#8ac5db'} />
                        </View>
                    </View>
                    <Text style={styles.title}>{marker.title}</Text>
                    <Text style={styles.address}>{marker.address}</Text>
                    <Text style={styles.goToPost}>{t('goToPost')}</Text>
                </View>
                <View style={styles.arrowBorder} />
            </Callout>
        </Marker>
    );
});

const styles = StyleSheet.create({
    container: {
        width: 80,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerIcon: {
        position: 'absolute',
        width: '140%',
        height: '140%',
        bottom: -10,
    },
    markerImage: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
        bottom: 8.3,
    },
    avatar: {
        width: 20,
        aspectRatio: 1,
        borderRadius: 50,
        backgroundColor: '#8ac5db',
    },
    userName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    callout: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -5
    },
    bubble: {
        width: 260,
        flexDirection: 'column',
        backgroundColor: '#ffff',
        padding: 10,
        paddingHorizontal: 10,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowBorder: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        justifyContent: 'space-between'
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    likesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    likes: {
        color: '#8ac5db',
        fontSize: 12,
    },
    title: {
        width: '100%',
        fontSize: 13,
    },
    address: {
        color: '#888',
        fontSize: 13,
        width: '100%',
        marginTop: 2,
    },
    goToPost: {
        color: '#8ac5db',
        fontSize: 13,
        width: '100%',
    }
});

export default CustomMarker;
