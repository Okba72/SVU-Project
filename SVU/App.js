import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import SVURouter from './navigation/SVURouter';
import { SVUSessionProvider } from './hooks/useSVUSessionContext';

const Stack = createStackNavigator();

export default function App(props) {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <SVUSessionProvider apiUrl='https://localhost/svu/api' wsUrl='wss://localhost:18001'>
          <SVURouter />
        </SVUSessionProvider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
