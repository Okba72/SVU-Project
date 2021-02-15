import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { ActivityIndicator, Alert, Modal, Button, TextInput, Image, Platform, Pressable, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native';
import PropTypes from "prop-types";
import { AntDesign } from '@expo/vector-icons';
import { MonoText } from './StyledText';


import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SVUSessionContext } from '../hooks/useSVUSessionContext';

import { AConversationSummary } from './AConversation';
import { createNativeWrapper } from 'react-native-gesture-handler';

const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

const CreateConversationModal = (props) => {
  const { svuSession, APIActivityInProgress, apiCall } = React.useContext(SVUSessionContext);
  const { createNewConvVisible, setCreateNewConvVisible } = props;
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
    if (memberEmails.length < 1) {
      userListValid = false;
    }

    setMembers(userList);
  }

  const createNewConversation = async () => {
    console.log(`members=${members}, title=${title}`);
    let memberEmails = validateUserList(members);

    memberEmails.push(svuSession.userId);
    // console.log(memberEmails);

    let payload = {
      "userList": memberEmails,
      "titleText": title,
    }

    console.log(payload);
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
          <TextInput
            value={members}
            // leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(members) => { updateUserList(members) }}
            placeholder={'Members:'}
            style={styles.input}
          />

          <TextInput
            value={title}
            // leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(title) => { setTitle(title) }}
            placeholder={'Title (optional):'}
            style={styles.input}
          />

          <View style={styles.centeredModalViewHorizontal}>
            <TouchableHighlight
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
            </TouchableHighlight>

          </View>
        </View>
      </Modal>
    </View >
  )
};

CreateConversationModal.propTypes = {
  createNewConvVisible: PropTypes.bool,
  setCreateNewConvVisible: PropTypes.func,
};

CreateConversationModal.defaultProps = {
  createNewConvVisible: false,
  setCreateNewConvVisible: null,
};


export function ConversationList() {
  const { svuSession, APIActivityInProgress, doLogin } = React.useContext(SVUSessionContext);
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");

  const demoRecipients = ["ali", "ali, ouqbah", "assem", "ali, ouqbah, assem"];
  const demoTitleText = ["First conversation", "First conversation", "First conversation", "First conversation"];

  // console.log("svuSession", svuSession);
  const [createNewConvVisible, setCreateNewConvVisible] = React.useState(false);

  console.log(`createNewConvVisible: ${createNewConvVisible}`)

  const newConvModal = (<CreateConversationModal createNewConvVisible={createNewConvVisible} setCreateNewConvVisible={setCreateNewConvVisible} />)

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

  const convs = convArr.map((aRecip) => {
    return (<AConversationSummary
      conversationId={aRecip._id}
      recipients={aRecip.user_list.join(", ")}
      titleText={aRecip.title_text || ""}
      unread={aRecip.unread || false}
      key={aRecip._id}
    />)
  });

  const convList = (
    <View style={styles.container}>
      <ScrollView style={styles.conversationListContainer} contentContainerStyle={styles.conversationListContent}>
        {convs}
      </ScrollView>

      <View style={styles.newConversation}>

        <TouchableOpacity
          onPress={() => { setCreateNewConvVisible(true) }}
          style={{}}>
          <Text style={styles.touchableButttons}>
            <AntDesign name="pluscircle" size={24} color="rgb(33, 150, 243)" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  let convElemOnDisplay = convList;
  if (createNewConvVisible) {
    convElemOnDisplay = newConvModal
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

  newConversation: {
    // flex: 1,
    // flexBasis: 0,
    // flexGrow: 1,
    // flexShrink: 0,

    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 36
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },

  svuButton: {
    width: 240,
    height: 42,
    padding: 10,
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

