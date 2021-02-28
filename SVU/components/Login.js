import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, TouchableHighlight, View } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';


export function LoginForm() {
  const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");

  console.log(`svuSession.apiActivityInProgress: ${svuSession.apiActivityInProgress}`)
  return (
    <View style={styles.container}>
      <View style={styles.leftDecoratedContainer}>
        <View style={{ flex: 0.17, }}>
          <MaterialIcons name="email" size={24} color="black" />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            value={userId}
            // leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(username) => { setUserId(username) }}
            placeholder={'Username'}
            style={styles.input}
          />
        </View>
      </View>
      <View style={styles.leftDecoratedContainer}>
        <View style={{ flex: 0.17, }}>
          <MaterialCommunityIcons name="form-textbox-password" size={24} color="black" />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            value={password}
            onChangeText={(password) => { setPassword(password) }}
            placeholder={'Password'}
            secureTextEntry={true}
            style={styles.input}
          />
        </View>
      </View>
      <View style={styles.leftDecoratedContainer}>
        <TouchableHighlight
          style={styles.loginButton}
          onPress={() => { doLogin(userId, password) }}
          underlayColor='rgb(128, 180, 220)'>
          <Text style={styles.loginText}>Login</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

LoginForm.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({

  container: {
    flex: 6,
    margin: 20,
    backgroundColor: '#ecf0f1',
  },

  leftDecoratedContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: "10",
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    margin: 10
  },

  input: {
    width: 200,
    height: 32,
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'black',
    marginBottom: 10,
    marginTop: 10,
  },

  loginButton: {
    width: 280,
    height: 42,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    marginTop: 10,
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

  developmentModeText: {
    marginBottom: 20,
    marginTop: 10,
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
