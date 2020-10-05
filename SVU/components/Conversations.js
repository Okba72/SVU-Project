import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';

import { AConversationSummary } from './AConversation';


export function Conversations() {
  const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");

  const demoRecipients = ["ali", "ali, ouqbah", "assem", "ali, ouqbah, assem"];
  const demoTitleText = ["First conversation", "First conversation", "First conversation", "First conversation"];

  let i=1;
  const convs = demoRecipients.map((aRecip) => {
    return (<AConversationSummary conversationId={i++} recipients={aRecip} titleText="First conversation" />)
  });

  return (
    <View style={styles.container}>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>


        {convs}

        {/* <View style={[styles.getStartedContainer, {
          borderBottomColor: 'black',
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingBottom: 50,
          marginBottom: 20,
        }]}>
          <DevelopmentModeNotice />

          <Text style={styles.getStartedText}>This is the home screen for the SVU project.</Text>
        </View>


        <View style={styles.getStartedContainer}>
          <Text style={styles.getStartedText}>Open up the code for this screen:</Text>

          <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
            <MonoText>screens/HomeScreen.js</MonoText>
          </View>

          <Text style={styles.getStartedText}>
            Change any of the text, save the file, and your app will automatically reload.
          </Text>
        </View>

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={handleHelpPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>Help references for creating a new expo app.</Text>
          </TouchableOpacity>
        </View> */}


      </ScrollView>

      <View style={styles.tabBarInfoContainer}>
        {/* <Button
          title={'Conversations'}
          buttonStyle={styles.input}
          onPress={() => { }}
        /> */}

        <TouchableOpacity
          onPress={() => alert('Hello, world!')}
          style={{}}>
          <Text style={styles.touchableButttons}>
            <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
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
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    // width: "80%",
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
    margin: "0 auto",
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fbfbfb',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    width: 48,
    height: 32,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'grey',
    marginBottom: 10,
    margin: "0 auto",
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  touchableButttons: {
    flex: 1,
    // width: "auto",
    height: 32,
    // paddingHorizontal: 10,
    borderWidth: 0,
    // borderRadius: 12,
    borderColor: 'grey',
    // marginBottom: 10,
    margin: "0 auto",
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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

