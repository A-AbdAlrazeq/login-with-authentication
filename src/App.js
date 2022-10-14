import { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import UserProfile from "./components/Profile/UserProfile";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AuthContext from "./store/auth-context";

function App() {
  const authCtx = useContext(AuthContext);
  return (
    <Layout>
      <Switch>
        <Route path="/" exact>
          <HomePage />
        </Route>
        {
          /* if the user not logged in will still in the auth page,no sense if user logged in and have access
          to auth page
           */ !authCtx.isLoggedIn && (
            <Route path="/auth">
              <AuthPage />
            </Route>
          )
        }
        <Route path="/profile">
          {
            /* if the user  logged in will open the profile page */ authCtx.isLoggedIn && (
              <UserProfile />
            )
          }
          {
            /* if the user  not logged in will redirect to the auth page */
            !authCtx.isLoggedIn && <Redirect to="/auth" />
          }
        </Route>
        <Route
          path="*"
          /*  user enter anything invalid will redirect to the auth page  or we can add error 404*/
        >
          <Redirect to="/" />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;
