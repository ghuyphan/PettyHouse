import React, {useRef} from "react";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import {SharedValue} from 'react-native-reanimated';
interface BottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>;
    title: string;
    onChange: (index : number) => void;
    animatedPosition: SharedValue<number>;
    snapPoint: number[];
    
}
const BottomSheetComponent: React.FC<BottomSheetProps> = ({
    bottomSheetRef,
    title,
    onChange,
    animatedPosition,
    snapPoint
}) => {
    // const bottomSheetRef = useRef<BottomSheet>(null);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            onChange={onChange}
            snapPoints={snapPoint}
            handleIndicatorStyle={{ backgroundColor: '#ccc' }}
            animatedPosition={animatedPosition}
        >
            <Text style={{fontSize: 20, paddingHorizontal: 20}}>{title}</Text>
            <BottomSheetView style={styles.contentContainer} >
                <View style={styles.container}>
                    
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
    },
})
export default BottomSheetComponent