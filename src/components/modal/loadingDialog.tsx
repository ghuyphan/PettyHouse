import React, { useState } from 'react';
import { ActivityIndicator, Portal, Provider } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface LoadingContainerProps {
  isLoading: boolean;
}

const LoadingContainer: React.FC<LoadingContainerProps> = ({ isLoading }) => {
  return (
    <Provider>
        <Portal>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} size="large" />
            </View>
          )}
        </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingContainer;
