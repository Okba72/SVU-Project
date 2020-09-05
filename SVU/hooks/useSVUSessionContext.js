import * as React from "react";


import PropTypes from "prop-types";

export const SVUSessionContext = React.createContext();
import { ActivityIndicator, View, Alert, Modal, StyleSheet, Text, TouchableHighlight, } from 'react-native';


/**
 * 
 * @param {*} props 
 */
export const SVUSessionProvider = props => {
  // Initial values are obtained from the props
  const { apiUrl, children } = props;

  // Make the context object:
  const initSVUSessionContext = {
    apiUrl: apiUrl,
    userId: "",
    userLoggedIn: false,
    bearerToken: "",
    expireTimeMillis: 0,
    apiActivityInProgress: false,
    apiError: "",
  };


  /**
   * 
   * @param {*} state 
   * @param {*} action 
   */
  const sessionReducer = (state, action) => {
    switch (action.type) {
      case 'API_CALL':
        return {
          apiUrl: action.apiUrl,
          userId: action.userId,
          userLoggedIn: action.userLoggedIn,
          bearerToken: action.bearerToken,
          expireTimeMillis: action.expireTimeMillis,
          apiActivityInProgress: action.apiActivityInProgress,
          apiError: action.apiError,
        };

      default:
        return initSVUSessionContext;
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

    let sessionUpdateAction = {
      type: "API_CALL",
      apiUrl: svuSession.apiUrl,
      userId: svuSession.userId,
      userLoggedIn: svuSession.userLoggedIn,
      bearerToken: svuSession.bearerToken,
      expireTimeMillis: svuSession.expireTimeMillis,
      apiError: svuSession.apiError,
      apiActivityInProgress: true,
    }

    let payload = {
      userId: userId,
      password: password,
    }

    let loginResponse = apiCall("/session/login", payload).then((responsePayload) => {
      sessionUpdateAction.expireTimeMillis = loginResponse.expireTimeMillis;
    }).catch((error) => {
      console.log(`loginResponse Error: ${error}`);
      //TODO: handle the error, display meaningful message to the user
    });
  };


  /**
   * 
   * @param {*} endpointUrl 
   * @param {*} payload 
   */
  const apiCall = async (endpointUrl, payload) => {
    let sessionUpdateAction = {
      type: "API_CALL",
      apiUrl: svuSession.apiUrl,
      userId: svuSession.userId,
      userLoggedIn: svuSession.userLoggedIn,
      bearerToken: svuSession.bearerToken,
      expireTimeMillis: svuSession.expireTimeMillis,
      apiError: svuSession.apiError,
      apiActivityInProgress: true,
    }

    dispatchSessionUpdate(sessionUpdateAction);

    // Default options are marked with *
    console.log("body: " + JSON.stringify(payload));

    let options = {
      method: payload ? "POST" : "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, *same-origin, omit
      headers: new Headers({
        "Authorization": svuSession.bearerToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
      }),
      // "Content-Type": "application/x-www-form-urlencoded",
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: payload ? JSON.stringify(payload) : null // body payload type must match "Content-Type" header
    };

    const response = await fetch(svuSession.apiUrl + endpointUrl, options).then((response) => {
      console.log("auth header:", response.headers.get("authorization"));
      if (!response.ok) {
        sessionUpdateAction.apiError = response.statusText;
        throw { "success": false, "status": response.status, "message": response.statusText };
      }

      let newBearerToken = response.headers.get("authorization");

      if (newBearerToken != null) {
        sessionUpdateAction.bearerToken = newBearerToken;
        sessionUpdateAction.userLoggedIn = true;
      }
      return response.json();
    }).finally(() => {
      sessionUpdateAction.apiActivityInProgress = false;
      dispatchSessionUpdate(sessionUpdateAction);
    });

    console.log(`resp body inside api call: ${response}`);
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
      type: "API_CALL",
      apiUrl: svuSession.apiUrl,
      userId: svuSession.userId,
      userLoggedIn: svuSession.userLoggedIn,
      bearerToken: svuSession.bearerToken,
      expireTimeMillis: svuSession.expireTimeMillis,
      apiError: svuSession.apiError,
      apiActivityInProgress: svuSession.apiActivityInProgress,
    }

    if (sessionUpdateAction.apiError) {
      return (
        // <View style={styles.centeredView}>
        //   <Modal
        //     animationType="slide"
        //     transparent={true}
        //     visible={true}
        //     onRequestClose={() => {
        //       console.log("modal onRequestClose called....")
        //     }}
        //   >
        //     <View style={styles.centeredView}>
        //       <View style={styles.modalView}>
        //         <Text style={styles.modalText}>Hello World!</Text>

        //         <TouchableHighlight
        //           style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
        //           onPress={() => {
        //             console.log("yes, it is being called....");
        //             sessionUpdateAction.apiError = "";
        //             dispatchSessionUpdate(sessionUpdateAction);
        //           }}
        //         >
        //           <Text style={styles.textStyle}>Hide Modal</Text>
        //         </TouchableHighlight>
        //       </View>
        //     </View>
        //   </Modal>

        // </View>

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
              console.log("modal onRequestClose called....")
            }}
            style={{borderRadius: 4, borderWidth: 0, alignSelf: "center"}}
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
                }}>{sessionUpdateAction.apiError}</Text>

                <TouchableHighlight
                  style={{
                    backgroundColor: "#F194FF",
                    borderRadius: 20,
                    padding: 10,
                    elevation: 2,
                    backgroundColor: "#2196F3"
                  }}
                  onPress={() => {
                    console.log("yes, it is being called....");
                    sessionUpdateAction.apiError = "";
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
  return <SVUSessionContext.Provider value={{ svuSession, APIActivityInProgress, APIError, doLogin, doLogout, apiCall }}>{children}</SVUSessionContext.Provider>;
};


export const { Consumer } = SVUSessionProvider;

SVUSessionProvider.propTypes = {
  apiUrl: PropTypes.string,
};

SVUSessionProvider.defaultProps = {
  apiUrl: "",
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