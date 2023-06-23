import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/nav.css";
import NotificationScreen from "./notifications/notifScreen";
import { serverUrl } from "../configClientDev";
import { useNavigate } from "react-router-dom";
import loadProfilePic from "./general/loadProfilePic";
import themeSettings from "./general/themeSettings";

export default function Nav(props) {
  const navigate = useNavigate();

  const location = useLocation();

  const [navUser, setNavUser] = useState(null);
  const [userLink, setUserLink] = useState(null);
  const [theme, setTheme] = useState(null);

  const [notifToggle, setNotifToggle] = useState(false);
  const [notifsCount, setNotifsCount] = useState(null);
  const [notifsCountDisplay, setNotifsCountDisplay] = useState(null);
  const [notifsBtnStyle, setNotifsBtnStyle] = useState("none");
  const [profilePic, setProfilePic] = useState(null);

  const [buttonBg, setButtonBg] = useState("none");
  const [buttonText, setButtonText] = useState("none");

  useEffect(() => {
    loadUser();
    loadNotifs();
    setNotifToggle(false);

    return;
  }, [props]);

  useEffect(() => {
    if (props.theme == null) {
      return;
    }

    const src = require(`../images/themes/theme_${props.theme}/nav.png`);
    setTheme(src);
    setButtonBg(themeSettings[props.theme].navButtonBg);
    setButtonText(themeSettings[props.theme].navButtonColor);
  }, [props.theme]);

  useEffect(() => {
    if (notifsCount == null || notifsCount == 0) {
      setNotifsCountDisplay(null);
      setNotifsBtnStyle("saturate(0)");
    } else {
      setNotifsCountDisplay(notifsCount);
      setNotifsBtnStyle("none");
    }
  }, [notifsCount]);

  function loadUser() {
    if (props.user != null && props.user.username) {
      const user = props.user;

      const userElements = <p>{user.username}</p>;

      loadProfilePic(props.user.profilePic).then((res) => {
        setProfilePic(res);
      });

      setNavUser(userElements);
      setUserLink(`/profile/${user._id}`);
    } else {
      setNavUser(null);
      setUserLink(null);
    }
  }

  function loadNotifs() {
    if (!props.user) {
      return;
    }

    if (props.user.notifications.length > 0) {
      let unengagedCount = 0;

      props.user.notifications.forEach((notif) => {
        if (notif.engaged == false) {
          unengagedCount++;
        }
        return;
      });
      setNotifsCount(unengagedCount);
    } else {
      setNotifsCount(0);
    }
  }

  async function engageNotifs() {
    if (props.user == null) {
      return;
    }

    if (props.user.notifications == 0) {
      return;
    }
    const newNotifs = props.user.notifications.map((notif) => {
      notif.engaged = true;
      return notif;
    });
    await fetch(`${serverUrl}/user/allNotifsEngaged`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        id: props.user._id,
        newNotifs: newNotifs,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.status);
      })
      .then(() => {
        setNotifsCount(0);
      })

      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <nav
      style={{
        backgroundImage: "url(" + theme + ")",
      }}
    >
      <div className="navElements">
        <div className="navHeader">
          <img
            className="navLogo"
            onClick={() => {
              navigate("/feed");
            }}
            src={require("../images/assets/logo.png")}
          />
        </div>

        <ul className="navUl">
          <li style={{ backgroundColor: buttonBg }}>
            <p
              onClick={() => {
                navigate("/feed");
              }}
              style={{ color: buttonText }}
            >
              Feed
            </p>
          </li>
          <li style={{ backgroundColor: buttonBg }}>
            <p
              style={{ color: buttonText }}
              onClick={() => {
                navigate(userLink);
              }}
            >
              Profile
            </p>
          </li>
          <li style={{ backgroundColor: buttonBg }}>
            <p
              style={{ color: buttonText }}
              onClick={() => {
                navigate("/settings");
              }}
            >
              Settings
            </p>
          </li>
          <li style={{ backgroundColor: buttonBg }}>
            <p
              style={{ color: buttonText }}
              onClick={() => {
                navigate("/about");
              }}
            >
              About
            </p>
          </li>
          <li
            style={{ backgroundColor: buttonBg }}
            onClick={() => {
              props.logout();
            }}
          >
            <p style={{ color: buttonText }}>Logout</p>
          </li>
        </ul>

        <div className="navRight">
          <div
            className="navUserIcon clickable"
            onClick={() => {
              navigate(userLink);
            }}
            style={{
              backgroundImage: "url(" + profilePic + ")",
            }}
          ></div>

          <div
            className="notifBtn"
            style={{ filter: notifsBtnStyle }}
            onClick={() => {
              engageNotifs();
              setNotifToggle(!notifToggle);
            }}
          >
            {notifsCountDisplay}
          </div>
        </div>
      </div>
      <div className="notifPosition">
        <NotificationScreen toggle={notifToggle} user={props.user} />
      </div>
    </nav>
  );
}
