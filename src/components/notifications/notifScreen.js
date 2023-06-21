import { useEffect, useState } from "react";
import NotifSingle from "./notifSingle";
import uniqid from "uniqid";
import { serverUrl } from "../../configClientDev";

//at some point make notifs updated with real time.
// socket io does this apperantly.....

export default function NotificationScreen(props) {
  const [notifStyle, setNotifStyle] = useState("none");
  const [notifList, setNotifList] = useState(null);

  useEffect(() => {
    if (props.user == null) {
      return;
    }
    loadNotifs();
  }, [props.user]);

  useEffect(() => {
    if (!props.toggle) {
      setNotifStyle("none");
    } else {
      setNotifStyle("block");
    }
  }, [props.toggle]);

  async function loadNotifs() {
    const notifs = await getNotifs();

    if (!notifs) {
      return;
    }
    if (notifs.length == 0) {
      setNotifList("No notifications.");
    } else {
      const allNotifs = notifs
        .map((notif) => {
          return (
            <NotifSingle
              loadNotifs={loadNotifs}
              key={uniqid()}
              user={props.user}
              checkNotifCount={checkNotifCount}
              notifInfo={notif}
            />
          );
        })
        .reverse();

      if (allNotifs.length == 0) {
        setNotifList("No notifications.");
        return;
      }
      setNotifList(allNotifs);
    }
  }

  async function getNotifs() {
    const result = await fetch(
      `${serverUrl}/user/getNotifications/${props.user._id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      }
    )
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("authentication has been failed!");
      })

      .catch((err) => {
        console.log(err);
      });

    return result.data;
  }

  async function checkNotifCount() {
    await fetch(`${serverUrl}/user/getNotifications/${props.user._id}`, {
      method: "GET",
      credentials: "include",
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
      .then((res) => {
        if (res.data.length == 0) {
          setNotifList("No notifications.");
        }
      })

      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="notifCont" style={{ display: notifStyle }}>
      {notifList}
    </div>
  );
}
