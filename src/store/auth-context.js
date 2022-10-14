import React, { useState, useEffect, useCallback } from "react";

let logoutTimer; //it's undefined and global variable because it's outside of all fun and outside rendering flow

/*React context allow us to >>Ex trigger action in that
component state storage and then directly pass that 
to component that is interested without building such as
a long prop chain
so we can manage state and pass it to any component in app
without build such a prop chain
if you have something you want to forward yo a lot of component you must use context
*/

// it will be object contains component
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});
const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime(); //here i will get time in millisecond to use it in timeout
  const adjExpirationTime = new Date(expirationTime).getTime();
  /*we pass expirationTime to new date because it's string and we want to convert it to date object
  and that should be some time in the future 
   */
  const remainingTime = adjExpirationTime - currentTime;
  //if we pass adjExpirationTime it's van negative value but we can handle this
  return remainingTime;
};
const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpirationDate);
  if (remainingTime <= 60000) {
    /*if the remain time equal or less than minute so we remove the token 
    and the remain time>>it's will logout auto*/
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }
  //if the time is valid and more than one minute we will return the token and the remain time
  return { token: storedToken, duration: remainingTime };
};
export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  //the only problem of local storage  if your page vulnerable to cross site scripting attack
  let initialToken;
  if (tokenData) {
    //if it not null >>will store the token in initialToken variable
    initialToken = tokenData.token;
  }
  //local storage is sync API
  //it's storage built in the browser which allow us to store simple data that then survive page reloads
  const [token, setToken] = useState(initialToken);
  const userIsLoggedIn = !!token; //this mean convert truthy or falsy value to true of false boolean value
  //if token string not empty will return true and if token string empty will return false
  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    //we can use clear() to erase all data in there or we target specific key
    if (logoutTimer) {
      /*so here we check if the logoutTimer is set then we clear timeout=>to clear that timer if the
      timer was is set*/
      clearTimeout(logoutTimer);
    }
  }, []); /*no need to add anything in dependency because clearTimeout&localStorage 
  are browser built in func then not specific in your react app,setToken is a state updating func
  don't need to add it we could add it but react guarantees us that func never changes
  &logoutTimer is global variable so it's out of rendering flow no need to add it*/

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime); //that's value must be string to store it
    //local storage  allow to store only basic primitive data like string,number
    //if you want to store object in local storage you must convert it to json which hen is string again
    const remainingTime = calculateRemainingTime(expirationTime); // and here because we logged in we know
    //it's will be a positive value around one hour in milliseconds
    logoutTimer = setTimeout(logoutHandler, remainingTime); //so here we point at a logout handler as a callback
    //so the logout handler is executed if the time express
  };
  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);
  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
