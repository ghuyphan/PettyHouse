import  { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRef } from 'react';

const AnimationScreen = () => {

    const animation = useRef<LottieView>(null);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
                ref={animation}
                source={require('../assets/animations/animation.json')}
                autoPlay
                loop
            />
        </View>
    );
};