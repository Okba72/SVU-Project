import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';

export function AConversationSummary(props) {
  const { conversationId, recipients, titleText, unread, setActiveConversationId } = props;

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


export function AMessage(props) {
  const { svuSession, apiCall } = React.useContext(SVUSessionContext);
  const { id, sender, message, msgDate, } = props;

  let messageStyle = styles.messageSenderSelf;
  let senderLabel = null;

  if (sender != svuSession.userId) {
    messageStyle = styles.messageSenderOther;
    senderLabel = (
      <Text style={[messageStyle, { fontWeight: 'bold' }]}
      // onPress={() => { setActiveConversationId(conversationId) }}
      >{sender}</Text>
    )
  }


  return (
    <View style={styles.messagesContainer}>
      {senderLabel}
      <Text style={[messageStyle, {}]}
      // onPress={() => { setActiveConversationId(conversationId) }}
      >{message}</Text>
      {/* <Text style={styles.titleText}>{message}</Text> */}
    </View>
  )
}


// AConversationSummary.propTypes = {
//   createNewConvVisible: PropTypes.bool,
//   setCreateNewConvVisible: PropTypes.func,
// };

// AConversationSummary.defaultProps = {
//   createNewConvVisible: false,
//   setCreateNewConvVisible: null,
// };


export function AConversation(props) {
  // const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  // const [userId, setUserId] = React.useState("");
  // const [password, setPassword] = React.useState("");

  const { activeConversationId, setActiveConversationId } = props;
  const { svuSession, APIActivityInProgress, apiCall } = React.useContext(SVUSessionContext);
  const [newMessageText, setNewMessageText] = React.useState("");


  const leaveConversation = async () => {
    let payload = {
      "conversationId": activeConversationId,
    }

    try {
      let apiResponse = await apiCall("/conversation/leave", payload);
      setActiveConversationId(null);
    } catch (error) {
      console.log(`apiCall Error: ${error}`);
    }
  }

  const sendMessage = async () => {
    if (!newMessageText | newMessageText.length <= 0) {
      return;
    }

    let payload = {
      "conversationId": activeConversationId,
      "message": {
        "messageText": newMessageText,
      }
    }

    try {
      let apiResponse = await apiCall("/conversation/newMessage", payload);
      setNewMessageText("");
    } catch (error) {
      console.log(`apiCall Error: ${error}`);
    }
  }

  const convArr = Object.values(svuSession.conversations).filter(
    (aConv) => aConv._id == activeConversationId
  );

  let convElem = {}
  if (convArr.length > 0) {
    convElem = convArr[0];
  }


  let messages = convElem.messages.sort((a, b) => {
    // console.log(a.date_last_updated , b.date_last_updated);
    let aDt = Date.parse(a.message_time);
    let bDt = Date.parse(b.message_time);
    if (aDt > bDt) {
      return 1;
    } else if (aDt < bDt) {
      return -1;
    } else {
      return 0;
    }
  });


  const msgs = messages.map((aMsg) => {
    return (<AMessage
      id={aMsg._id}
      sender={aMsg.sender}
      message={aMsg.message_text}
      msgDate={aMsg.message_time}
      key={aMsg._id}
    />)
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableHighlight
          style={[styles.svuButton, { width: 100, marginLeft: 12, }]}
          onPress={() => setActiveConversationId("")}
          underlayColor='rgb(128, 180, 220)'>
          <Text style={[styles.svuButtonText]}>Back</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={[styles.svuButton, { width: 100, borderColor: 'red', borderWidth: 2, backgroundColor: 'whit', color: 'red', marginRight: 12, }]}
          onPress={() => leaveConversation()}
          underlayColor='rgb(128, 180, 220)'>
          <Text style={[styles.svuButtonText, { color: 'red' }]}>Leave</Text>
        </TouchableHighlight>
      </View>

      <ScrollView style={styles.conversationListContainer} contentContainerStyle={styles.conversationListContent}>
        {msgs}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TextInput
          value={newMessageText}
          multiline={true}
          onChangeText={(newMsgTxt) => { setNewMessageText(newMsgTxt) }}
          placeholder={'New message'}
          style={[styles.input, { flexGrow: 1, marginLeft: 4, marginRight: 4 }]}
        />

        <TouchableHighlight
          style={[styles.svuButton, { width: 'auto', height: 48, marginRight: 4, }]}
          onPress={() => sendMessage()}
          underlayColor='rgb(128, 180, 220)'>
          <Text style={[styles.svuButtonText]}>Send</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 0,
    height: '100%',
    width: '100%',

    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
  },

  horizontalLayout: {
    // flexBasis: 0,
    // flexGrow: 1,
    // flexShrink: 0,

    // flex: 1,
    // height: '90%',
    // width: '100%',
    borderWidth: 0,
    flexDirection: 'row',
    // justifyContent: "flex-start",
    // alignItems: "flex-start",
    marginTop: 22
  },


  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },

  bottomBar: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4
  },

  aConversationSummaryContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 4,
    marginBottom: 10,
  },

  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '95%',
    marginTop: 4,
    marginBottom: 4,
  },


  messageSenderSelf: {
    width: '95%',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },

  messageSenderOther: {
    width: '95%',
    textAlign: 'left',
    marginTop: 4,
    marginBottom: 4,
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


  input: {
    width: 'auto',
    height: 48,
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'black',
    marginBottom: 10,
  },

  // input: {
  //   flex: 1,
  //   width: 48,
  //   height: 32,
  //   paddingHorizontal: 10,
  //   borderWidth: 1,
  //   borderRadius: 12,
  //   borderColor: 'grey',
  //   marginBottom: 10,
  //   margin: "0 auto",
  //   textAlign: 'center',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },

  conversationListContainer: {
    width: '100%',
    marginBottom: 0,
    marginTop: 0,

    paddingLeft: 20,
    paddingRight: 20,
  },
  conversationListContent: {
    // flexGrow: 0, 
    flexDirection: 'column',
    justifyContent: 'space-between'
  },

  svuButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: 240,
    height: 32,
    padding: 8,
    textAlignVertical: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    backgroundColor: 'rgb(33, 150, 243)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
    margin: 'auto',
  },
  svuButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
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

