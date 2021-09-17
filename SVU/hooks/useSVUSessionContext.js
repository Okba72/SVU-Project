import * as React from "react";
import { Audio } from 'expo-av';

import PropTypes from "prop-types";
import * as Permissions from "expo-permissions";

export const SVUSessionContext = React.createContext();
import { ActivityIndicator, View, Alert, Modal, StyleSheet, Text, TouchableHighlight, } from 'react-native';

import { w3cwebsocket as W3CWebSocket } from "websocket";
import jwt_decode from "jwt-decode";


/**
 * 
 * @param {*} props 
 */
export const SVUSessionProvider = props => {
  const [sound, setSound] = React.useState();

  async function playSound() {
    // console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/Blow.m4a'),
      { shouldPlay: true }
    );
    setSound(sound);

    // console.log('Playing Sound');
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
        // console.log('Unloading Sound');
        // sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  // Initial values are obtained from the props
  const { apiUrl, wsUrl, children } = props;

  let tokenExpirationTimer = null;

  // Make the context object:
  const initSVUSessionContext = {
    apiUrl: apiUrl,
    wsUrl: wsUrl,
    userId: "",
    userLoggedIn: false,
    bearerToken: "",
    expireTimeMillis: 0,
    apiActivityInProgress: false,
    apiError: "",
    wsClient: null,
    conversations: {},
  };


  /**
   * 
   * @param {*} state 
   * @param {*} action 
   */
  const sessionReducer = (state, action) => {
    // console.log("sesionReducer - 1: ", state, action.newState);
    let newState = {};
    switch (action.type) {
      case "API_ERR_RESET":
        // console.log("sesionReducer - 1: ", action.newState);
        newState = Object.assign(newState, state);
        newState.apiError = "";
        return newState;

      case "API_CALL":
        newState = Object.assign(newState, state, action.newState);
        // console.log("sesionReducer - 2: ", newState);
        return newState;

      case "WS_CLIENT":
        newState = Object.assign(newState, state, action.newState);
        // console.log("sesionReducer - 3: ", newState);
        return newState;

      case "CONV_UPDT":
        // console.log("sesionReducer - 4: ", action.newState);
        newState = Object.assign(newState, state);
        newState.conversations = Object.assign({}, action.newState.conversations);
        return newState;

      default:
        return state;
    }
  }


  const [svuSession, dispatchSessionUpdate] = React.useReducer(sessionReducer, initSVUSessionContext);

  const doLogout = (logoutAllDevices = false) => {
  }


  /**
   * 
   * @param {*} userId 
   * @param {*} password 
   */
  const doLogin = async (userId, password) => {
    if (!(userId && password)) {
      return;
    }

    let payload = {
      userId: userId,
      password: password,
    }

    try {
      let loginResponse = await apiCall("/session/login", payload);
      let sessionUpdateAction = {
        type: "API_CALL",
        newState: {
          userId: userId,
          expireTimeMillis: loginResponse.expireTimeMillis,
        }
      }

      dispatchSessionUpdate(sessionUpdateAction);

      playSound();

    } catch (error) {
      console.log(`loginResponse Error: ${error}`);
    }
  };


  const fetchNewConversations = async () => {
    apiCall("/conversation/myConversations/0").then((responsePayload) => {

      let convMap = {};
      for (let aConv of responsePayload.conversations) {
        convMap[aConv._id] = aConv;
      }
      let sessionUpdateAction = {
        type: "CONV_UPDT",
        newState: {
          conversations: convMap,
        }
      };
      // console.log(convMap);

      dispatchSessionUpdate(sessionUpdateAction);
    }).catch((error) => {
      console.log(`conversation load error: ${error}`);
    });
  }

  /**
   * The following hook will load conversations as needed (upon login)
   */
  React.useEffect(
    () => {
      if (svuSession.userLoggedIn && !svuSession.wsClient) {
        // console.log(`\n\n\n userLoggedIn changed, useEffect: will load conversations... \n\n\n`);

        fetchNewConversations();
      }
      return;
    }, [svuSession.userLoggedIn]
  )



  /**
   * The following hook will establish the WS connection upon successful login
   */
  React.useEffect(
    () => {
      if (svuSession.userLoggedIn && !svuSession.wsClient) {
        // console.log(`\n\n\n userLoggedIn changed in useEffect: ${svuSession.userLoggedIn}!!! \n\n\n`);

        initWSClient(svuSession, dispatchSessionUpdate);
      }
      return;
    }, [svuSession.userLoggedIn, svuSession.wsClient]
  )

  /**
   * WebSocket initiation function
   * 
   * @param {*} svuSession 
   * @param {*} dispatchSessionUpdate 
   */
  const initWSClient = (svuSession, dispatchSessionUpdate) => {
    // console.log("\n\n initWSClient! \n\n");
    if (!svuSession.userLoggedIn) {
      return;
    }

    // console.log("\n\n initWSClient! - 2 \n\n");

    let wsClient = new W3CWebSocket(
      `${svuSession.wsUrl}?token=${svuSession.bearerToken}`, "svu-protocol", "*");


    wsClient.onopen = function () {
      // console.log('WebSocket Client Connected');

      // TODO: implement any needed preamble data exchange.

      // function sendNumber() {
      //   if (wsClient.readyState === wsClient.OPEN) {
      //     var number = Math.round(Math.random() * 0xFFFFFF);
      //     wsClient.send(number.toString());
      //   }
      // }
      // sendNumber();
    };

    wsClient.onclose = function () {
      // console.log('svu-protocol Client Closed');
      // setTimeout(initWSClient, 50, svuSession, dispatchSessionUpdate);
      let sessionUpdateAction = {
        type: "WS_CLIENT",
        newState: {
          wsClient: null,
        }
      };
      setTimeout(dispatchSessionUpdate, 1000, sessionUpdateAction)
    };

    wsClient.onmessage = async function (e) {
      if (typeof e.data === 'string') {
        // console.log("Received: '" + e.data + "'");
        fetchNewConversations();
      }
      await playSound();
    };

    // // connectFailed
    // wsClient.onclose = function () {
    //   console.log('svu-protocol Client Closed');
    //   setTimeout(initWSClient, 50);
    // };

    let sessionUpdateAction = {
      type: "WS_CLIENT",
      newState: {
        wsClient: wsClient,
      }
    };
    dispatchSessionUpdate(sessionUpdateAction);
  }

  /**
   * 
   * @param {*} endpointUrl 
   * @param {*} payload 
   */
  const apiCall = async (endpointUrl, payload) => {
    let sessionUpdateAction = {
      type: "API_CALL",
      newState: {
        apiActivityInProgress: true,
      }
    };

    dispatchSessionUpdate(sessionUpdateAction);


    let contentType = "application/json";
    if (typeof (payload) == "FormData") {
      contentType = "multipart/form-data";
    }

    // Default options are marked with *
    // console.log("body: " + JSON.stringify(payload));

    let options = {
      method: payload ? "POST" : "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, *same-origin, omit
      headers: new Headers({
        "Authorization": svuSession.bearerToken,
        "Content-Type": contentType,
        "Accept": "application/json",
      }),
      // "Content-Type": "application/x-www-form-urlencoded",
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: payload ? JSON.stringify(payload) : null // body payload type must match "Content-Type" header
    };

    const response = await fetch(svuSession.apiUrl + endpointUrl, options).then((response) => {
      // console.log("auth header:", response.headers.get("authorization"));
      if (!response.ok) {
        sessionUpdateAction.newState.apiError = response.statusText;
        throw { "success": false, "status": response.status, "message": response.statusText };
      }

      let newBearerToken = response.headers.get("authorization");

      if (newBearerToken != null) {
        sessionUpdateAction.newState.bearerToken = newBearerToken;
        sessionUpdateAction.newState.userLoggedIn = true;


        let decodedBearerToken = jwt_decode(newBearerToken);
        let timerToAutoLogoutMillis = (decodedBearerToken.exp - decodedBearerToken.iat - 30) * 1000;
        if (tokenExpirationTimer) {
          clearTimeout(tokenExpirationTimer);
        }
        tokenExpirationTimer = setTimeout(() => {
          let autoLogoutSessionUpdateAction = {
            type: "API_CALL",
            newState: {
              userLoggedIn: false,
            }
          };

          dispatchSessionUpdate(autoLogoutSessionUpdateAction);
        }, timerToAutoLogoutMillis);
        // console.log("\n\n decodedBearerToken: ", decodedBearerToken, "\n\n");
      }
      return response.json();
    }).finally(() => {
      sessionUpdateAction.newState.apiActivityInProgress = false;
      dispatchSessionUpdate(sessionUpdateAction);
    });

    // console.log(`resp body inside api call: ${response}`);
    return response;
  };

  /**
   * This is a spinner that is to be displayed overlayed during API activities:
   */
  const APIActivityInProgress = () => {
    if (svuSession.apiActivityInProgress) {
      return (<View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.7,
        backgroundColor: 'rgba(240,240,240,02)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" />
      </View >
      )
    } else {
      return null
    }
  }


  const APIError = () => {

    let sessionUpdateAction = {
      type: "API_ERR_RESET",
      newState: {
      }
    };

    if (svuSession.apiError) {
      return (

        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: 0.95,
          backgroundColor: 'rgba(240,240,240, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={true}
            onRequestClose={() => {
              // console.log("modal onRequestClose called....")
            }}
            style={{ borderRadius: 4, borderWidth: 0, alignSelf: "center" }}
          >
            <View style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: 'center',
            }}>
              <View style={{
                margin: 20,
                backgroundColor: "white",
                opacity: 1.0,
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                alignSelf: 'center',
                shadowColor: "#0a0a0a",
                shadowOffset: {
                  width: 0,
                  height: 2
                }
              }} >
                <Text style={{
                  marginBottom: 15,
                  opacity: 1.0,
                  textAlign: "center",
                }}>{svuSession.apiError}</Text>

                <TouchableHighlight
                  style={{
                    backgroundColor: "#F194FF",
                    borderRadius: 20,
                    padding: 10,
                    elevation: 2,
                    backgroundColor: "#2196F3"
                  }}
                  onPress={() => {
                    // console.log("yes, it is being called....");
                    sessionUpdateAction.newState.apiError = "";
                    dispatchSessionUpdate(sessionUpdateAction);
                  }}
                >
                  <Text style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>Ok</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>

        </View>
      );
    } else {
      return null;
    }
  }


  // pass the init context value in provider and return
  return (<SVUSessionContext.Provider value={{ svuSession, APIActivityInProgress, APIError, doLogin, doLogout, apiCall, }}>{children}</SVUSessionContext.Provider>);
};


export const { Consumer } = SVUSessionProvider;

SVUSessionProvider.propTypes = {
  apiUrl: PropTypes.string,
  wsUrl: PropTypes.string,
};

SVUSessionProvider.defaultProps = {
  apiUrl: "",
  wsUrl: "",
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
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
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
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