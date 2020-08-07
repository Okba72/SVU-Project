import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';


import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';

export default function SVURouter() {
    // const userLoggedIn = useSVUSession();
    const {svuSession} = React.useContext(SVUSessionContext);
  
    let bodyScreen = (<LoginScreen />);
    if (svuSession.userLoggedIn) {
        bodyScreen = (<HomeScreen />);
    }

    return (
        <View style={styles.container}>
            {bodyScreen}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
