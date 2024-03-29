import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FontAwesome } from '@expo/vector-icons';

import { MonoText } from '../components/StyledText';
// import { UserInterfaceIdiom } from 'expo-constants';

import { APIActivityInProgress, SVUSessionContext } from '../hooks/useSVUSessionContext';
import { LoginForm } from '../components/Login';
import { SignupForm } from '../components/Signup';

export default function SessionScreen() {
  const { svuSession, APIError, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [signupInProgress, setSignupInProgress] = React.useState(false);

  let sessionForm = (<LoginForm />);
  let alternateFormText = 'If you don\'t have an account, please feel free to signup';
  let alternateFormButtonText = 'Signup For A New Account';

  if (signupInProgress) {
    sessionForm = sessionForm = (<SignupForm setSignupInProgress={setSignupInProgress} />);
    alternateFormText = 'If you already have an account, please login'
    alternateFormButtonText = 'Login';
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/svu_logo.png')}
            style={styles.welcomeImage}
          />
        </View>

        {sessionForm}

        <View style={[styles.getStartedContainer, {
          borderTopColor: 'black',
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 50,
          marginTop: 20,
          marginBottom: 20,
        }]}>

          <Text style={styles.getStartedText}>{alternateFormText}</Text>
        </View>

        <View style={styles.leftDecoratedContainer}>
          <TouchableHighlight
            style={styles.loginButton}
            onPress={() => { setSignupInProgress(!signupInProgress) }}

            underlayColor='rgb(128, 180, 220)'>
            <Text style={styles.loginText}>{alternateFormButtonText}</Text>
          </TouchableHighlight>

        </View>

      </ScrollView>

      <APIActivityInProgress />
      <APIError />
    </View>
  );
}

SessionScreen.navigationOptions = {
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

  loginButton: {
    width: 240,
    height: 42,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    backgroundColor: 'rgb(33, 150, 243)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff'
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
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
