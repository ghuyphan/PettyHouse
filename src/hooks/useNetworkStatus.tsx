import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const useNetworkStatus = () => {
    const [snackBarVisible, setSnackBarVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setSnackBarVisible(!state.isConnected); // Show snackbar if offline
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const showSnackBar = () => {
        setSnackBarVisible(true);
    };

    const dismissSnackBar = () => {
        setSnackBarVisible(false);
    };

    const onDismissSnackBar = () => dismissSnackBar();

    return { snackBarVisible, showSnackBar, dismissSnackBar, onDismissSnackBar };
};

export default useNetworkStatus;