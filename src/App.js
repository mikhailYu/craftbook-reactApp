import "./styles/App.css";

import Nav from "./components/nav";
import Main from "./components/main";
import { useLocation, redirect, useBeforeUnload } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "./configClientDev";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userTheme, setUserTheme] = useState(null);

  useEffect(() => {
    getUser();
    updateNav();
  }, [location]);

  useEffect(() => {
    if (!user || user == null) {
      return;
    } else if (user.theme != userTheme) {
      setUserTheme(user.theme);
    } else if (user.theme === 0) {
      setUserTheme(0);
    }
  }, [user]);

  function updateNav() {
    if (
      location.pathname == "/signUp" ||
      location.pathname == "/authenticate" ||
      location.pathname == "/invalid"
    ) {
      document.querySelector("nav").style.display = "none";
      document.querySelector(".App > div").style.paddingTop = "0px";
    } else {
      document.querySelector("nav").style.display = "block";
      document.querySelector(".App > div").style.paddingTop = "60px";
    }
  }

  async function logout() {
    await fetch(`${serverUrl}/user/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("fil");
      })
      .then((resObject) => {
        setUser(null);
        navigate("/");
        window.location.reload(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getUser() {
    const result = await fetch(`${serverUrl}/user/getAuth`, {
      method: "GET",
      credentials: "include",
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("authentication has been failed!");
      })
      .then((resObject) => {
        console.log(resObject);
        setUser(resObject.user);

        return resObject.user;
      })
      .catch((err) => {
        console.log(err);
      });

    return result;
  }

  async function sendNotification(receiverId, notification) {
    fetch(`${serverUrl}/user/addNotif`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        receiverId: receiverId,
        notification: notification,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .catch((err) => {
        console.log(err);
        return;
      });
    return;
  }

  return (
    <div className="App">
      <Nav user={user} theme={userTheme} getUser={getUser} logout={logout} />
      <Main user={user} getUser={getUser} sendNotification={sendNotification} />
    </div>
  );
}

export default App;
