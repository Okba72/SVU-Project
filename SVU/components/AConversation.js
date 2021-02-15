import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';

export function AConversationSummary(props) {
  const { conversationId, recipients, titleText, unread } = props;

  const { setActiveConversationId } = React.useContext(SVUSessionContext);

  let recipStyle = styles.recipientsText;
  if (unread) {
    recipStyle = styles.recipientsTextUnread;
  }
  return (
    <View style={styles.aConversationSummaryContainer}>
      <Text style={recipStyle}
        onPress={() => { setActiveConversationId(conversationId) }}
      >{recipients}</Text>
      <Text style={styles.titleText}>{titleText}</Text>
    </View>
  )
}


export function AConversation() {
  // const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  // const [userId, setUserId] = React.useState("");
  // const [password, setPassword] = React.useState("");


  return (
    <View style={styles.container}>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

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
  },

  aConversationSummaryContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 4,
    marginBottom: 10,
  },

  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },

  recipientsText: {
    fontSize: 14,
    color: 'rgba(196,100,109, 1)',
    lineHeight: 16,
    textAlign: 'left',
  },

  recipientsTextUnread: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(196,100,109, 1)',
    lineHeight: 16,
    textAlign: 'left',
  },


  titleText: {
    fontSize: 12,
    color: 'rgba(96, 96, 96, 1)',
    lineHeight: 14,
    textAlign: 'left',
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

