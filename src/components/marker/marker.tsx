import { Marker } from "react-native-maps";
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
// import { Image } from 'expo-image';

interface MapMarker {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    image: string;
    // Add any other properties here
}

const CustomMarker = ({ marker }: { marker: MapMarker; index: number }) => {
    // const blurhash =
    //     "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

    return (
        <Marker
            coordinate={marker.coordinate}
            title={marker.title}
        >
            <View style={styles.container}>
                <Image
                    source={require('../../../assets/images/marker.png')}
                    style={styles.image}
                    // placeholder={blurhash}
                    // contentFit="cover"
                    // transition={1000}
                />
                <Image
                    source={{ uri: marker.image }}
                    style={styles.centeredImage}
                    // placeholder={blurhash}
                    // contentFit="cover"
                    // transition={1000}
                />
            </View>

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
    image: {
        position: 'absolute',  // Add position absolute
        width: '140%',          
        height: '140%',
        
    },
    centeredImage: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
        bottom: 2,
    }
});

export default CustomMarker;
