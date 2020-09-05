import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FontAwesome5 } from '@expo/vector-icons';

import { MonoText } from '../components/StyledText';
// import { UserInterfaceIdiom } from 'expo-constants';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';



export function SignupForm(props) {
  const {setSignupInProgress} = props;
  const { svuSession, APIActivityInProgress, doLogin, apiCall } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [narVisible, setNarVisible] = React.useState(false);
  const [narImage, setNarImage] = React.useState("");
  const [narToken, setNarToken] = React.useState("");
  const [narText, setNarText] = React.useState("");

  const pwValidStyle = () => {
    if (password.length < 12) {
      return styles.validStyleRed;
    } else {
      return styles.validStyleGreen;
    }
  }

  const confPwValidStyle = () => {
    if ((password.length < 12) || (password != confirmPassword)) {
      return styles.validStyleRed;
    } else {
      return styles.validStyleGreen;
    }
  }

  const updateUserid = (newUserid) => {
    setUserId(newUserid);
    setPassword('');
    setConfirmPassword('');
    updateNarData(newUserid, '', '');
  }

  const updatePassword = (newPassword) => {
    setPassword(newPassword);
    updateNarData(userId, newPassword, confirmPassword);
  }

  const updateConfirmPassword = (newConfirmPassword) => {
    setConfirmPassword(newConfirmPassword);
    updateNarData(userId, password, newConfirmPassword);
  }

  const updateNarData = async (userId, password, confirmPassword) => {
    if ((userId.length > 0) &&
      (password.length >= 12) &&
      (password == confirmPassword)) {

      // get a NAR image and enable respective controls:
      setNarVisible(true);
      console.log("nar is visible");
      let response = await apiCall(`/session/getNARToken/${userId}`, null);
      setNarToken(response.narToken);
      setNarImage(`data:image/png;charset=utf-8;base64,  ${response.narImageBase64}`);

      console.log(response);
    } else {
      setNarVisible(false);
      setNarText('');
      setNarToken('');
      setNarImage('');
    }
  }

  const doSignup = async () => {
    let payload = {
      "userId": userId,
      "password": password,
      "narToken": narToken,
      "narText": narText
    };

    let response = await apiCall(`/session/signup`, payload);

    if(response.success) {
      setSignupInProgress(false);
    }
    console.log(response);
  }

  const getNarControlsComponent = () => {

    if (!narVisible) {
      return null;
    } else {
      return (
        <View style={styles.container}>

          <View style={styles.welcomeContainer}>
            <Image
              source={narImage}
              style={styles.narImage}
              alt='red dot'
            />
          </View>

          <View style={[styles.leftDecoratedContainer,]}>
            {/* <MaterialCommunityIcons name="robot" size={24} color="red" /> */}
            <FontAwesome5 name="robot" size={20} color="red" />
            <TextInput
              value={narText}
              onChangeText={(narText) => { setNarText(narText) }}
              placeholder={'Enter the text you see on the image:'}
              secureTextEntry={false}
              style={[styles.input,]}
            />
          </View>

        </View>
      );
    }
  }
  const narComponent = getNarControlsComponent();

  console.log(`svuSession.apiActivityInProgress: ${svuSession.apiActivityInProgress}`)
  return (
    <View style={styles.container}>
      <View style={styles.leftDecoratedContainer}>
        <MaterialIcons name="email" size={24} color="black" />
        <TextInput
          value={userId}
          // leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(username) => { updateUserid(username); }}
          placeholder={'Username'}
          style={styles.input}
        />
      </View>
      <View style={[styles.leftDecoratedContainer,]}>
        <MaterialCommunityIcons name="textbox-password" size={24} color="black" />
        <TextInput
          value={password}
          onChangeText={(newPassword) => { updatePassword(newPassword); }}
          placeholder={'Password, at least 12 characters'}
          secureTextEntry={true}
          style={[styles.input, pwValidStyle(),]}
        />
      </View>

      <View style={styles.leftDecoratedContainer}>
        <MaterialCommunityIcons name="textbox-password" size={24} color="black" />
        <TextInput
          value={confirmPassword}
          onChangeText={(newConfirmPassword) => { updateConfirmPassword(newConfirmPassword); }}
          placeholder={'Confirm Password'}
          secureTextEntry={true}
          style={[styles.input, confPwValidStyle(),]}
        />
      </View>

      {narComponent}

      <View style={styles.leftDecoratedContainer}>
        <Button
          title={'Signup'}
          style={styles.input}
          onPress={doSignup}
          disabled={!narVisible}
        />
      </View>
    </View>
  );
}

SignupForm.navigationOptions = {
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

  validStyleRed: {
    backgroundColor: 'rgba(200,0,0,0.1)',
  },

  validStyleGreen: {
    backgroundColor: 'rgba(0,200,0,0.1)',
  },

  narImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    // marginTop: 3,
    // marginLeft: -10,
  },

  input: {
    width: 320,
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
    width: 20,
    height: 20,
    // resizeMode: 'contain',
    // marginTop: 3,
    // marginLeft: -10,
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
