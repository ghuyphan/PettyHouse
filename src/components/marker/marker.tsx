import React from 'react';
import { Callout, Marker } from "react-native-maps";
import { StyleSheet, View, Image } from 'react-native';
import { BlurView } from 'expo-blur';
// import { Image } from 'expo-image';
import { Text, Icon, Divider, Avatar } from 'react-native-paper';

interface MapMarker {
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
}

const CustomMarker = ({ marker }: { marker: MapMarker; index: number }) => {

    return (
        <Marker
            coordinate={marker.coordinate}
            title={marker.title}
            description="Hello world dashjkdhasjlhdajskhdhja"
        // tracksViewChanges={false}
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

            <Callout tooltip style={styles.callout}>
                <View style={[styles.bubble]}>
                    <View style={{ flexDirection: 'row', gap: 5, width: '100%', marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            {marker.avatar ?
                                <Avatar.Image source={{ uri: marker.avatar }} size={20} style={styles.avatar} /> :
                                <Avatar.Text label={marker.username.slice(0, 2).toUpperCase()} size={20} style={styles.avatar} />}
                            <Text style={styles.userName}>@{marker.username}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                            <Icon source="heart-outline" size={13} color={'#888'} />
                            <Text style={{ color: '#888', fontSize: 12 }}>{marker.like}</Text>
                        </View>
                    </View>
                    <Text style={{ width: '100%', fontWeight: 'bold', fontSize: 13, color: '#555' }}>{marker.title}</Text>
                    <View style={{ flexDirection: 'column', gap: 2, marginTop: 2, width: '100%', alignItems: 'flex-start' }}>

                        <Text style={{ color: '#888', fontSize: 13, width: '100%' }}>{marker.address}</Text>

                    </View>
                </View>
                <View style={styles.arrowBorder} />
            </Callout>
        </Marker >
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerIcon: {
        position: 'absolute',  // Add position absolute
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
        backgroundColor: '#333',
    },
    userName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333'
    },
    callout: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -5
    },
    bubble: {
        width: 260,
        // height: 100,
        flexDirection: 'column',
        backgroundColor: '#fff',
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
        borderTopWidth: 8,  // Height of the triangle
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#fff',
    }
});

export default CustomMarker;
