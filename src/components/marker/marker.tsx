import { Callout, Marker } from "react-native-maps";
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
// import { Image } from 'expo-image';
import { Text, Surface } from 'react-native-paper';

interface MapMarker {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    image: string;
}

const CustomMarker = ({ marker }: { marker: MapMarker; index: number }) => {
    return (
        <Marker
            coordinate={marker.coordinate}
            title={marker.title}
            description="Hello world dashjkdhasjlhdajskhdhja"
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

            <Callout tooltip>
                <View style={styles.bubble}>
                    <Text>{marker.title}</Text>
                </View>
                <View style={styles.arrowBorder} />
            </Callout>
        </Marker>
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
        width: 52,
        aspectRatio: 1,
        borderRadius: 50,
        bottom: 8.7,
    },
    bubble: {
        width: 180,
        // height: 100,
        backgroundColor: '#f0f9fc',
        paddingVertical: 5,
        paddingHorizontal: 7,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }, 
    arrowBorder: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#f0f9fc',
        borderWidth: 10,
        alignSelf: 'center',
        marginTop: -0.5,
    }
});

export default CustomMarker;
