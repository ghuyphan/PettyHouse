import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface textDialogProps {
  
    isVisible: boolean; 
    onDismiss: () => void; 
    title: string;
    content: React.ReactNode; // Allows for various content types 
    icon: string;
    confirmLabel?: string; // Optional confirmation label
    dismissable?: boolean;
}

const TextDialog: React.FC<textDialogProps> = ({ 
    isVisible, 
    onDismiss, 
    title, 
    content, 
    icon,
    confirmLabel = "Ok",
    dismissable = true,
}) => {
  return (
        <Portal>
          <Dialog visible={isVisible} onDismiss={onDismiss} style={{ backgroundColor: '#f0f9fc' }} dismissable={dismissable}>
          <Dialog.Icon icon={icon} />
            <Dialog.Title style={styles.title}>{title}</Dialog.Title>
            <Dialog.Content>
              <Text style={{ fontSize: 16 }}>{content}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={onDismiss} labelStyle={{ fontSize: 16, fontWeight: 'bold'}}>{confirmLabel}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
  );
};

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
    }
});

export default TextDialog;

