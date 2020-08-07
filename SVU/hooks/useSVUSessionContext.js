import * as React from "react";


import PropTypes from "prop-types";

export const SVUSessionContext = React.createContext();
import { ActivityIndicator, View } from 'react-native';


/**
 * 
 * @param {*} props 
 */
export const SVUSessionProvider = props => {
  // Initial values are obtained from the props
  const { apiUrl, children } = props;
  const loginEndpoint = apiUrl + "/session/login"

  // Make the context object:
  const initSVUSessionContext = {
    apiUrl: apiUrl,
    userId: "",
    userLoggedIn: false,
    bearerToken: "",
    expireTimeMillis: 0,
    apiActivityInProgress: false,
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
          apiUrl: "",
          userId: action.userId,
          userLoggedIn: action.userLoggedIn,
          bearerToken: action.bearerToken,
          expireTimeMillis: action.expireTimeMillis,
          apiActivityInProgress: action.apiActivityInProgress,
        };

      default:
        return initSVUSessionContext;
    }
  }


  const [svuSession, dispatchSessionUpdate] = React.useReducer(sessionReducer, initSVUSessionContext);

  console.log(apiUrl);

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
      apiActivityInProgress: true,
    }

    let payload = {
      userId: userId,
      password: password,
    }

    let loginResponse = apiCall(apiUrl + "/session/login", payload).then((responsePayload) => {
      console.log(`loginResponse: ${responsePayload}`);
      console.log(responsePayload);
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
      body: JSON.stringify(payload) // body payload type must match "Content-Type" header
    };

    const response = await fetch(endpointUrl, options).then((response) => {
      console.log("auth header:", response.headers.get("authorization"));
      if (!response.ok) {
        throw new Error("HTTP status: " + response.status);
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
        opacity: 0.5,
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

  // pass the init context value in provider and return
  return <SVUSessionContext.Provider value={{ svuSession, APIActivityInProgress, doLogin, doLogout, apiCall }}>{children}</SVUSessionContext.Provider>;
};


export const { Consumer } = SVUSessionProvider;

SVUSessionProvider.propTypes = {
  apiUrl: PropTypes.string,
};

SVUSessionProvider.defaultProps = {
  apiUrl: "",
};
