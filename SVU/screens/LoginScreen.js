import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FontAwesome } from '@expo/vector-icons';

import { MonoText } from '../components/StyledText';
// import { UserInterfaceIdiom } from 'expo-constants';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';



export default function LoginScreen() {
  const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");


  console.log(`svuSession.apiActivityInProgress: ${svuSession.apiActivityInProgress}`)
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/svu_logo.png')}
            style={styles.welcomeImage}
          />
        </View>

        {/* <View style={styles.welcomeContainer}>
          <FontAwesome.Button name="lock" backgroundColor="#3b5998" onPress={() => { }}>
            Login with Facebook
        </FontAwesome.Button>
        </View> */}


        <View style={[styles.getStartedContainer, {
          borderBottomColor: 'black',
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingBottom: 50,
          marginBottom: 20,
        }]}>

          <Text style={styles.getStartedText}>This is the login screen for the SVU project.</Text>
        </View>

        <View style={styles.leftDecoratedContainer}>
          <MaterialIcons name="email" size={24} color="black" />
          <TextInput
            value={userId}
            // leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(username) => { setUserId(username) }}
            placeholder={'Username'}
            style={styles.input}
          />
        </View>
        <View style={styles.leftDecoratedContainer}>
          <MaterialCommunityIcons name="textbox-password" size={24} color="black" />
          <TextInput
            value={password}
            onChangeText={(password) => { setPassword(password) }}
            placeholder={'Password'}
            secureTextEntry={true}
            style={styles.input}
          />
        </View>
        <View style={styles.leftDecoratedContainer}>
          <Button
            title={'Login'}
            style={styles.input}
            onPress={() => { doLogin(userId, password) }}
          />
        </View>

      </ScrollView>

      <APIActivityInProgress />
    </View>
  );
}

LoginScreen.navigationOptions = {
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
