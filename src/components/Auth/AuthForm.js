import { useState, useRef, useContext } from "react";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router-dom";
import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };
  const submitHandler = (event) => {
    event.preventDefault(); // to prevent browser to sent request auto
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    setIsLoading(true);
    let url;
    //key=[API_KEY] we get this from project setting
    //Web API key AIzaSyCfe7hlzGhsAgLlVyuEV4pQ80i2VGYAED8
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCfe7hlzGhsAgLlVyuEV4pQ80i2VGYAED8";
    } else {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCfe7hlzGhsAgLlVyuEV4pQ80i2VGYAED8";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true, //	Whether or not to return an ID and refresh token. Should always be true.
      }),
      headers: {
        "Content-Type": "application/json", // to ensure that auth restAPI knows we get some json data coming here
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((data) => {
            let errorMessage = "authentication failed !";
            /*  if (data && data.error && data.error.message) {
            errorMessage = data.error.message;
          } */
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        /*we use + (+data.expiresIn) to convert it from string to number
         then *1000 to convert it from second to milliseconds 
        expiresIn=(The number of seconds in which the ID token expires.)
        so here we get the current time in milliseconds then sum it with the time that's come
         from the api request then convert it from string to number to milliseconds 
         then pass it to new date again to construct a new date object from the time stamp in milliseconds   */
        const expirationTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        /*so here i pass it as string and also a could pass it as date object but since i convert it
        in calculateRemainingTime function i will pass it as string
         */

        authCtx.login(data.idToken, expirationTime.toISOString());
        history.replace(
          "/"
        ); /*redirect the user to different page & user can't use the back button
         to go back to the previous page*/
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Sending Request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
