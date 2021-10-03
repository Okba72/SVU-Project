import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, Pressable, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native';
import PropTypes from "prop-types";
import { AntDesign } from '@expo/vector-icons';
import { MonoText } from './StyledText';

import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { APIActivityInProgress, SVUSessionContext } from '../hooks/useSVUSessionContext';

import { AConversationSummary } from './AConversation';
import { createNativeWrapper } from 'react-native-gesture-handler';

const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}


const AutoSuggestTextInput = (props) => {
  const { suggestionList, setAcceptedText } = props;
  const [currentText, setCurrentText] = React.useState("");
  const [currentSelection, setCurrentSelection] = React.useState({});

  const __handleChangeText = (newText) => {
    let suggestedNewText = newText;

    if ((newText.length >= currentText.length) && (!newText.match(/[,|;|\s]$/))) {

      // find the last fragment:
      let textFrags = newText.split(/,|;|\s/);

      let lastFrag = "";
      if (textFrags && (textFrags.length > 0)) {
        lastFrag = textFrags[textFrags.length - 1].trim();
      }

      if ((lastFrag.length > 0) && !suggestionList.has(lastFrag)) {

        textFrags = textFrags.filter((aFrag) => aFrag.trim().length > 0);
        let textFragSet = new Set(textFrags);
        suggestedNewText = textFrags.join(", ");
        let startSel = suggestedNewText.length;

        for (let aSuggestion of suggestionList.values()) {
          if (textFragSet.has(aSuggestion)) {
            continue;
          }
          if (lastFrag && aSuggestion.trim().startsWith(lastFrag)) {
            textFrags[textFrags.length - 1] = aSuggestion;
            suggestedNewText = textFrags.join(", ");
            setCurrentSelection({ start: startSel, end: suggestedNewText.length });
            break;
          }
        }
      }
    }

    setCurrentText(suggestedNewText);
    setAcceptedText(suggestedNewText);
  }


  // const __handleSelectionChange = ({ nativeEvent: { selection, text } }) => {
  //   // console.log(`in __handleSelectionChange - selection: ${selection}`);
  //   // console.log(`in __handleSelectionChange - text: ${text}`);
  //   // setCurrentSelection(selection);
  // };


  return (
    <TextInput
      value={currentText}
      selection={currentSelection}
      multiline={true}
      // leftIcon={{ type: 'font-awesome', name: 'lock' }}
      onChangeText={(newText) => { __handleChangeText(newText) }}
      // onSelectionChange={(selDescrEvent) => { __handleSelectionChange(selDescrEvent) }}
      placeholder={'Members:'}
      style={styles.input}
    />
  )
}


const CreateConversationModal = (props) => {
  const { svuSession, apiCall } = React.useContext(SVUSessionContext);
  const { createNewConvVisible, setCreateNewConvVisible, contactList } = props;
  const [members, setMembers] = React.useState("");
  const [title, setTitle] = React.useState("");

  let userListValid = false;
  /**
   * validate user list emails:
   * @param {*} userList 
   */
  const validateUserList = (userList) => {
    let memberEmails = [];
    let userListArr = userList.split(/,|;|\s/);
    for (let aUser of userListArr) {
      aUser = aUser.trim();
      if ((aUser.length > 0) && validateEmail(aUser)) {
        memberEmails.push(aUser);
      }
    }
    return memberEmails;
  }


  const updateUserList = (userList) => {
    let memberEmails = validateUserList(userList);
    console.log(`len of memberEmails=${memberEmails.length}`);
    if (memberEmails.length < 1) {
      userListValid = false;
    }

    setMembers(userList);
  }

  const createNewConversation = async () => {
    // console.log(`members=${members}, title=${title}`);
    let memberEmails = validateUserList(members);

    memberEmails.push(svuSession.userId);
    // console.log(memberEmails);

    let payload = {
      "userList": memberEmails,
      "titleText": title,
    }

    // console.log(payload);
    try {
      let apiResponse = await apiCall("/conversation/create", payload);

    } catch (error) {
      console.log(`apiCall Error: ${error}`);
    }

    setCreateNewConvVisible(false);
  }

  if (!createNewConvVisible) {
    return null;
  }

  return (
    <View style={styles.centeredModalView}>
      <Modal
        visible={createNewConvVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => { setCreateNewConvVisible(false) }} //for android hardware back
        style={styles.centeredModalView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>New Conversation</Text>
          <AutoSuggestTextInput suggestionList={contactList} setAcceptedText={updateUserList} />

          <TextInput
            value={title}
            // leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(title) => { setTitle(title) }}
            placeholder={'Title (optional):'}
            style={styles.input}
          />

          <View style={styles.centeredModalViewHorizontal}>
            <TouchableOpacity
              onPress={() => setCreateNewConvVisible(!createNewConvVisible)}
              style={[styles.svuButton, { width: 100, backgroundColor: 'whit', }]}>
              <Text style={styles.touchableButttons}>
                {/* <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" /> */}
                <AntDesign name="closecircleo" size={24} color="rgb(33, 150, 243)" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => createNewConversation()}
              style={[styles.svuButton, { backgroundColor: 'whit', width: 100 }]}>
              <Text style={styles.touchableButttons}>
                {/* <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" /> */}
                <AntDesign name="checkcircleo" size={24} color="rgb(33, 150, 243)" />
              </Text>
            </TouchableOpacity>

            {/* <TouchableHighlight
              style={[styles.svuButton, { width: 100, borderColor: 'red', borderWidth: 2, backgroundColor: 'whit', color: 'red', }]}
              onPress={() => setCreateNewConvVisible(!createNewConvVisible)}
              underlayColor='rgb(128, 180, 220)'>
              <Text style={[styles.svuButtonText, { color: 'red' }]}>Cancel</Text>
            </TouchableHighlight>

            
            <TouchableHighlight
              style={[styles.svuButton, { width: 100 }]}
              onPress={() => createNewConversation()}
              underlayColor='rgb(128, 180, 220)'>
              <Text style={styles.svuButtonText}>Start</Text>
            </TouchableHighlight> */}
          </View>
        </View>
        <APIActivityInProgress />
      </Modal>
    </View >
  )
};


const LogoutAllDevicesModal = (props) => {
  const { svuSession, doLogout } = React.useContext(SVUSessionContext);
  const { logoutAllDevicesVisible, setLogoutAllDevicesVisible } = props;
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");


  if (!logoutAllDevicesVisible) {
    return null;
  }


  const logoutAllDevices = async () => {
    await doLogout(userId, password);
    return setLogoutAllDevicesVisible(false);
  }

  return (
    <View style={styles.centeredModalView}>
      <Modal
        visible={logoutAllDevicesVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => { setLogoutAllDevicesVisible(false) }} //for android hardware back
        style={styles.centeredModalView}
      >



        <View style={styles.modalView}>

          <View style={[styles.centeredModalViewVertical, { flex: 2 }]}>

            <Text style={{ fontSize: "18pt", fontWeight: "bold", color: "red", height: "auto", textAlign: "center", marginBottom: 40 }}> Logout All Devices </Text>

            <Text style={{ fontSize: "12pt", fontWeight: "bold", color: "darkred", height: "auto", textAlign: "center", marginBottom: 20 }}> If you proceed, your sessions on all of your logged in devices will be terminated.  </Text>

            <Text style={{ fontSize: "12pt", fontWeight: "bold", color: "darkred", height: "auto" }}> If you want to logout only on this device, just reload or terminate the browser.  </Text>

            <View style={[styles.leftDecoratedContainer, { flex: 1 }]}>
              <View style={[styles.input, { flex: 0.17, borderWidth: 0, paddingTop: 4 }]}>
                <MaterialIcons name="email" size={24} color="black" />
              </View>
              <View style={{ flex: 1, }}>
                <TextInput
                  value={userId}
                  // leftIcon={{ type: 'font-awesome', name: 'lock' }}
                  onChangeText={(username) => { setUserId(username) }}
                  placeholder={'Username'}
                  style={styles.input}
                />
              </View>
            </View>
            <View style={[styles.leftDecoratedContainer, { flex: 1 }]}>
              <View style={[styles.input, { flex: 0.17, borderWidth: 0, paddingTop: 4 }]}>
                <MaterialCommunityIcons name="form-textbox-password" size={24} color="black" />
              </View>
              <View style={{ flex: 1, }}>
                <TextInput
                  value={password}
                  onChangeText={(password) => { setPassword(password) }}
                  placeholder={'Password'}
                  secureTextEntry={true}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <View style={styles.centeredModalViewHorizontal}>
            <TouchableOpacity
              onPress={() => { setLogoutAllDevicesVisible(!logoutAllDevicesVisible) }}
              style={[styles.svuButton, { width: 100, backgroundColor: 'whit', }]}>
              <Text style={styles.touchableButttons}>
                {/* <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" /> */}
                <AntDesign name="closecircleo" size={24} color="rgb(33, 150, 243)" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { logoutAllDevices() }}
              style={[styles.svuButton, { backgroundColor: 'whit', width: 100 }]}>
              <Text style={styles.touchableButttons}>
                {/* <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" /> */}
                <AntDesign name="checkcircleo" size={24} color="rgb(33, 150, 243)" />
              </Text>
            </TouchableOpacity>
          </View>

        </View>
        <APIActivityInProgress />

      </Modal>
    </View >
  )
};


export function ConversationList(props) {
  const { svuSession, doLogout } = React.useContext(SVUSessionContext);
  const { setActiveConversationId } = props;

  // console.log("svuSession", svuSession);
  const [createNewConvVisible, setCreateNewConvVisible] = React.useState(false);
  const [logoutAllDevicesVisible, setLogoutAllDevicesVisible] = React.useState(false);

  // console.log(`createNewConvVisible: ${createNewConvVisible}`)

  const convArr = Object.values(svuSession.conversations).sort((a, b) => {
    // console.log(a.date_last_updated , b.date_last_updated);
    let aDt = Date.parse(a.date_last_updated);
    let bDt = Date.parse(b.date_last_updated);
    if (aDt > bDt) {
      return -1;
    } else if (aDt < bDt) {
      return 1;
    } else {
      return 0;
    }
  });
  // console.log("convArr", convArr);

  // getting the set of all previous contacts from the conv array:
  const __reduceContacts = (prevSet, aUserId) => {
    if (aUserId) {
      prevSet.add(aUserId.trim());
    }
    return prevSet;
  };

  let contactList = new Set();
  convArr.forEach((aUserList) => {
    aUserList.user_list.reduce(__reduceContacts, contactList);
  });
  // console.log(contactList);
  contactList.delete(svuSession.userId);

  const logoutAllDevicesModal = (<LogoutAllDevicesModal logoutAllDevicesVisible={logoutAllDevicesVisible} setLogoutAllDevicesVisible={setLogoutAllDevicesVisible} />)

  const newConvModal = (<CreateConversationModal createNewConvVisible={createNewConvVisible} setCreateNewConvVisible={setCreateNewConvVisible} contactList={contactList} />)

  const convs = convArr.map((aRecip) => {
    return (<AConversationSummary
      conversationId={aRecip._id}
      recipients={aRecip.user_list.join(", ")}
      titleText={aRecip.title_text || ""}
      unread={aRecip.unread || false}
      key={aRecip._id}
      setActiveConversationId={setActiveConversationId}
    />)
  });

  const convList = (
    <View style={styles.container}>
      <ScrollView style={styles.conversationListContainer} contentContainerStyle={styles.conversationListContent}>
        {convs}
      </ScrollView>

      <View style={styles.bottomBar}>

        <TouchableOpacity
          onPress={() => { setLogoutAllDevicesVisible(true) }}
          style={[styles.svuButton, { width: 100, backgroundColor: 'whit', marginLeft: 12, }]}>
          <Text style={styles.touchableButttons}>
            <MaterialCommunityIcons name="exit-run" size={24} color="rgb(33, 150, 243)" />
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setCreateNewConvVisible(true) }}
          style={[styles.svuButton, { width: 100, backgroundColor: 'whit', marginRight: 12, }]}>
          <Text style={styles.touchableButttons}>
            {/* <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" /> */}
            <AntDesign name="form" size={24} color="rgb(33, 150, 243)" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  let convElemOnDisplay = convList;

  if (createNewConvVisible) {
    convElemOnDisplay = newConvModal
  } else if (logoutAllDevicesVisible) {
    convElemOnDisplay = logoutAllDevicesModal
  }

  return (
    <View style={styles.container}>
      {convElemOnDisplay}
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

  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },


  leftDecoratedContainer: {
    flex: 1,
    // height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: "10",
    alignSelf: 'center',
    alignItems: 'center',
    // backgroundColor: '#ecf0f1',
    margin: 10,
  },


  // svuButton: {
  //   width: 240,
  //   height: 42,
  //   padding: 10,
  //   borderWidth: 1,
  //   borderColor: 'black',
  //   marginBottom: 10,
  //   backgroundColor: 'rgb(33, 150, 243)',
  //   borderRadius: 4,
  //   borderWidth: 1,
  //   borderColor: '#fff',
  //   margin: 'auto',
  // },
  // svuButtonText: {
  //   color: 'white',
  //   textAlign: 'center',
  //   fontSize: 14,
  //   fontWeight: 'bold',
  // },


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




  input: {
    // flex: 1,
    width: '85%',
    height: 32,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'grey',
    marginBottom: 10,
    margin: "0 auto",
    textAlign: 'left',
    alignItems: 'left',
    justifyContent: 'left',
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

  //
  centeredModalView: {
    // flexBasis: 0,
    // flexGrow: 1,
    // flexShrink: 0,

    flex: 1,
    // height: '90%',
    // width: '100%',
    borderWidth: 0,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },

  centeredModalViewHorizontal: {
    flex: 1,
    width: '80%',
    borderWidth: 0,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    justifyContent: 'space-between',
  },

  centeredModalViewVertical: {
    flex: 0.1,
    height: '80%',
    borderWidth: 0,
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    justifyContent: 'space-between',
  },


  modalView: {
    flex: 1,
    margin: 20,
    width: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }

});

