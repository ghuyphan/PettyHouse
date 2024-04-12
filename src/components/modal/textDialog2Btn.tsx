import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface textDialog2BtnProps {

  isVisible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  content: React.ReactNode; // Allows for various content types 
  // icon: string;
  dismissLabel?: string; // Optional confirmation label
  confirmLabel?: string;
  dismissable?: boolean;
}

const TextDialog2Btn: React.FC<textDialog2BtnProps> = ({
  isVisible,
  onDismiss,
  onConfirm,
  title,
  content,
  // icon,
  confirmLabel = "Ok",
  dismissLabel = "Cancel",
  dismissable = true,

}) => {
  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onDismiss} style={{ backgroundColor: '#f0f9fc' }} dismissable={dismissable}>
        {/* <Dialog.Icon icon={icon} /> */}
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ fontSize: 16 }}>{content}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} labelStyle={{ fontSize: 16, fontWeight: 'bold' }}>{dismissLabel}</Button>
          <Button onPress={onConfirm} labelStyle={{ fontSize: 16, fontWeight: 'bold' }}>{confirmLabel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    // textAlign: 'center',
  }
});

export default TextDialog2Btn;

