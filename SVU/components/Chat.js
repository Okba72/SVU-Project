import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';



export function Chat() {
  const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");

  console.log(`svuSession.apiActivityInProgress: ${svuSession.apiActivityInProgress}`)
  return (
    <View style={styles.container}>

    </View>
  );
}

LoginForm.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    margin: 20,
    backgroundColor: '#ecf0f1',
  },

  leftDecoratedContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: "10",

    // padding: "50",
    alignItems: 'center',
    // margin: "auto",
    backgroundColor: '#ecf0f1',
  },

  input: {
    width: 200,
    height: 32,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },

  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
